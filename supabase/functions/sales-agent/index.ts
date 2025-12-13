import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agent system prompts
const AGENT_PROMPTS = {
  sdr: `Você é um SDR (Sales Development Representative) experiente e estratégico.
Seu objetivo é QUALIFICAR leads de forma rápida e eficiente.

REGRAS:
1. Seja breve e direto - máximo 2-3 frases por mensagem
2. Faça perguntas abertas para descobrir: orçamento, timeline, autoridade e necessidade (BANT)
3. Demonstre curiosidade genuína sobre o negócio do lead
4. Se o lead estiver qualificado (tem interesse + budget + urgência), passe para o Closer
5. Nunca force vendas - seu papel é qualificar, não vender

ESTILO: Amigável, curioso, profissional. Use emojis com moderação.`,

  closer: `Você é um Closer de vendas de alta performance.
Seu objetivo é FECHAR vendas de forma consultiva.

REGRAS:
1. Foque em resolver objeções de forma empática
2. Use as informações do produto (contexto RAG) para responder dúvidas técnicas
3. Crie urgência sem ser agressivo
4. Quando o lead estiver pronto, envie o link de checkout
5. Sempre confirme entendimento antes de enviar proposta

FERRAMENTAS DISPONÍVEIS:
- retrieve_context: buscar informações do produto
- generate_checkout_link: gerar link de pagamento

ESTILO: Persuasivo, consultivo, confiante.`,

  copywriter: `Você é um Copywriter especialista em vendas.
Seu objetivo é criar textos persuasivos e personalizados.

REGRAS:
1. Adapte o tom conforme o contexto (formal/informal)
2. Use gatilhos mentais de forma ética
3. Personalize com o nome e contexto do lead
4. Mantenha textos concisos e escaneáveis
5. Sempre inclua um CTA claro

ESTILO: Criativo, persuasivo, adaptável.`,

  cs: `Você é um especialista em Customer Success.
Seu objetivo é garantir satisfação e retenção de clientes.

REGRAS:
1. Seja sempre empático e solícito
2. Resolva problemas de forma proativa
3. Identifique oportunidades de upsell de forma natural
4. Colete feedback e sugestões
5. Celebre conquistas do cliente

ESTILO: Empático, prestativo, positivo.`
};

// Router to decide which agent should respond
async function routeToAgent(
  message: string, 
  conversationHistory: any[], 
  leadScore: number,
  apiKey: string
): Promise<string> {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content: `Você é um roteador de agentes de vendas. Analise a mensagem e histórico para decidir qual agente deve responder.

Critérios:
- SDR: Lead novo, ainda não qualificado, fazendo perguntas iniciais
- CLOSER: Lead qualificado (score > 50), interessado em comprar, discutindo preços/condições
- CS: Cliente que já comprou, com dúvidas pós-venda ou suporte
- COPYWRITER: Quando precisa gerar conteúdo específico (não usado em conversas diretas)

Responda APENAS com: SDR, CLOSER ou CS`
        },
        {
          role: "user",
          content: `Lead Score: ${leadScore}
Última mensagem: ${message}
Histórico resumido: ${conversationHistory.slice(-3).map(m => m.content).join(' | ')}`
        }
      ],
    }),
  });

  const data = await response.json();
  const agentType = data.choices?.[0]?.message?.content?.trim().toLowerCase() || 'sdr';
  
  // Validate agent type
  if (['sdr', 'closer', 'cs'].includes(agentType)) {
    return agentType;
  }
  return 'sdr';
}

// Retrieve relevant context from knowledge base
async function retrieveContext(
  supabase: any, 
  productId: string, 
  query: string
): Promise<string> {
  // Simple keyword-based retrieval (for production, use vector similarity)
  const { data: chunks } = await supabase
    .from('knowledge_chunks')
    .select('content')
    .eq('product_id', productId)
    .limit(3);

  if (chunks && chunks.length > 0) {
    return chunks.map((c: any) => c.content).join('\n\n');
  }
  return '';
}

// Generate agent response
async function generateAgentResponse(
  agentType: string,
  message: string,
  conversationHistory: any[],
  productContext: string,
  leadInfo: any,
  apiKey: string
): Promise<string> {
  const systemPrompt = AGENT_PROMPTS[agentType as keyof typeof AGENT_PROMPTS] || AGENT_PROMPTS.sdr;
  
  const contextualPrompt = productContext 
    ? `\n\nCONTEXTO DO PRODUTO:\n${productContext}` 
    : '';

  const leadContext = leadInfo 
    ? `\n\nINFO DO LEAD:\nNome: ${leadInfo.name}\nEmpresa: ${leadInfo.company || 'N/A'}\nScore: ${leadInfo.score || 0}` 
    : '';

  const messages = [
    { role: "system", content: systemPrompt + contextualPrompt + leadContext },
    ...conversationHistory.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    })),
    { role: "user", content: message }
  ];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (response.status === 402) {
      throw new Error("Payment required. Please add credits to your workspace.");
    }
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      conversation_id, 
      message, 
      lead_id,
      product_id 
    } = await req.json();

    if (!conversation_id || !message) {
      return new Response(
        JSON.stringify({ error: 'conversation_id and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get conversation history
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content, agent_type')
      .eq('conversation_id', conversation_id)
      .order('created_at', { ascending: true });

    const conversationHistory = messages || [];

    // Get lead info
    let leadInfo = null;
    if (lead_id) {
      const { data: lead } = await supabase
        .from('leads')
        .select('name, company, score, sentiment')
        .eq('id', lead_id)
        .single();
      leadInfo = lead;
    }

    // Store user message
    await supabase.from('messages').insert({
      conversation_id,
      role: 'user',
      content: message
    });

    // Route to appropriate agent
    const agentType = await routeToAgent(
      message, 
      conversationHistory, 
      leadInfo?.score || 0,
      LOVABLE_API_KEY
    );

    // Get product context if available
    let productContext = '';
    if (product_id) {
      productContext = await retrieveContext(supabase, product_id, message);
    }

    // Generate agent response
    const agentResponse = await generateAgentResponse(
      agentType,
      message,
      conversationHistory,
      productContext,
      leadInfo,
      LOVABLE_API_KEY
    );

    // Store agent response
    await supabase.from('messages').insert({
      conversation_id,
      role: 'assistant',
      content: agentResponse,
      agent_type: agentType
    });

    // Update lead score based on interaction
    if (lead_id && leadInfo) {
      const newScore = Math.min(100, (leadInfo.score || 0) + 5);
      await supabase
        .from('leads')
        .update({ 
          score: newScore, 
          last_contact_at: new Date().toISOString(),
          assigned_agent: agentType
        })
        .eq('id', lead_id);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        agent_type: agentType,
        response: agentResponse
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in sales-agent:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
