import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// DISC Profile Prompt Injections
const DISC_PROMPTS: Record<string, string> = {
  dominance: `ESTILO DE COMUNICAÇÃO: Lead com perfil DOMINANTE (D)
- Seja direto, objetivo e focado em resultados
- Foque no ROI e benefícios práticos
- Use bullet points e números
- NÃO use emojis ou linguagem floreada
- Vá direto ao ponto, sem rodeios
- Respeite o tempo dele, seja breve
- Fale sobre controle e autoridade`,

  influence: `ESTILO DE COMUNICAÇÃO: Lead com perfil INFLUENTE (I)
- Seja entusiasmado e positivo
- Use storytelling e cases de sucesso
- Emojis são bem-vindos com moderação 🚀
- Foque na visão social e status
- Faça ele se sentir especial e reconhecido
- Use linguagem mais casual e amigável
- Mencione exclusividade e comunidade`,

  steadiness: `ESTILO DE COMUNICAÇÃO: Lead com perfil ESTÁVEL (S)
- Seja calmo, paciente e confiável
- Foque em segurança e garantias
- Não pressione ou crie urgência artificial
- Dê tempo para pensar
- Mostre suporte contínuo e pós-venda
- Enfatize estabilidade e parceria de longo prazo
- Use tom empático e compreensivo`,

  compliance: `ESTILO DE COMUNICAÇÃO: Lead com perfil CONFORME (C)
- Seja preciso e forneça dados detalhados
- Cite fontes, estatísticas e cases com números
- Responda todas as perguntas técnicas
- Não exagere nem faça promessas vagas
- Forneça documentação e provas
- Use linguagem formal e profissional
- Dê tempo para análise racional`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead_id, messages } = await req.json();

    if (!lead_id || !messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'lead_id and messages are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze messages with AI
    const analysisPrompt = `Analise as seguintes mensagens de um potencial cliente e classifique-o segundo o modelo DISC (Dominance, Influence, Steadiness, Compliance).

MENSAGENS DO CLIENTE:
${messages.slice(-5).map((m: any) => m.content).join('\n---\n')}

Responda APENAS no formato JSON:
{
  "disc_profile": "dominance" | "influence" | "steadiness" | "compliance",
  "disc_scores": {
    "dominance": 0-100,
    "influence": 0-100,
    "steadiness": 0-100,
    "compliance": 0-100
  },
  "big5_scores": {
    "openness": 0-100,
    "conscientiousness": 0-100,
    "extraversion": 0-100,
    "agreeableness": 0-100,
    "neuroticism": 0-100
  },
  "communication_style": "descrição breve do estilo de comunicação ideal",
  "key_motivators": ["motivador1", "motivador2"],
  "avoid": ["coisa a evitar 1", "coisa a evitar 2"]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um psicólogo comportamental especializado em vendas e análise DISC. Responda apenas em JSON válido." },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const analysisText = aiData.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');
    } catch {
      analysis = {
        disc_profile: 'influence',
        disc_scores: { dominance: 25, influence: 40, steadiness: 20, compliance: 15 },
        big5_scores: { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 30 },
        communication_style: 'Balanceado'
      };
    }

    const discProfile = analysis.disc_profile || 'influence';
    const promptInjection = DISC_PROMPTS[discProfile] || DISC_PROMPTS.influence;

    // Save to database
    const { data, error } = await supabase
      .from('lead_psychology')
      .upsert({
        lead_id,
        disc_profile: discProfile,
        disc_scores: analysis.disc_scores,
        big5_scores: analysis.big5_scores,
        communication_style: analysis.communication_style,
        prompt_injection: promptInjection,
        analyzed_at: new Date().toISOString()
      }, { onConflict: 'lead_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving psychology:', error);
    }

    // Update lead sentiment
    await supabase
      .from('leads')
      .update({ sentiment: discProfile })
      .eq('id', lead_id);

    return new Response(
      JSON.stringify({
        success: true,
        disc_profile: discProfile,
        prompt_injection: promptInjection,
        analysis
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in psychology-engine:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
