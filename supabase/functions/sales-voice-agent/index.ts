import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Extract user from JWT
    const token = authHeader?.replace("Bearer ", "");
    let userId: string | null = null;
    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    const body = await req.json();
    const { action } = body;

    // ACTION: generate_script - Generate a sales script based on product knowledge
    if (action === "generate_script") {
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "AI não configurado" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { product_id, tone, language, target_audience, objective, custom_instructions } = body;

      // Fetch product info
      let productContext = "";
      if (product_id && userId) {
        const { data: product } = await supabase
          .from("products")
          .select("*")
          .eq("id", product_id)
          .eq("user_id", userId)
          .single();

        if (product) {
          productContext += `\n## Produto: ${product.name}\nDescrição: ${product.description || "N/A"}\nPreço: R$ ${product.price || "N/A"}\nLink de checkout: ${product.checkout_link || "N/A"}\n`;
          if (product.metadata && typeof product.metadata === "object") {
            productContext += `Metadados: ${JSON.stringify(product.metadata)}\n`;
          }
        }

        // Fetch knowledge chunks for this product
        const { data: chunks } = await supabase
          .from("knowledge_chunks")
          .select("content")
          .eq("product_id", product_id)
          .limit(20);

        if (chunks && chunks.length > 0) {
          productContext += "\n## Base de Conhecimento do Produto:\n";
          productContext += chunks.map((c, i) => `[${i + 1}] ${c.content}`).join("\n\n");
        }
      }

      // Fetch all products if no specific product selected
      if (!product_id && userId) {
        const { data: products } = await supabase
          .from("products")
          .select("name, description, price")
          .eq("user_id", userId)
          .limit(10);

        if (products && products.length > 0) {
          productContext += "\n## Catálogo de Produtos:\n";
          productContext += products.map((p, i) => `${i + 1}. ${p.name} - ${p.description || ""} - R$ ${p.price || "N/A"}`).join("\n");
        }
      }

      const toneMap: Record<string, string> = {
        professional: "profissional, confiante e corporativo",
        friendly: "amigável, caloroso e acessível",
        urgent: "urgente, com senso de escassez e FOMO",
        consultative: "consultivo, educativo e empático",
        aggressive: "agressivo, direto e focado em fechamento",
      };

      const toneDescription = toneMap[tone] || toneMap.professional;

      const systemPrompt = `Você é um especialista em vendas por telefone/voz com mais de 20 anos de experiência. Seu trabalho é criar scripts de vendas COMPLETOS e PROFISSIONAIS para serem usados em chamadas de voz com IA.

REGRAS:
- Crie um script natural para ser FALADO (não lido), com pausas naturais indicadas por "..."
- Inclua saudação, qualificação, apresentação do produto, tratamento de objeções, e fechamento
- Use o tom: ${toneDescription}
- Idioma: ${language || "Português brasileiro"}
- O script deve durar entre 2-5 minutos quando falado
- Inclua variações para respostas positivas e negativas do prospect
- Inclua perguntas de qualificação (BANT: Budget, Authority, Need, Timeline)
- Termine sempre com um CTA claro (agendar demo, enviar proposta, link de checkout)
- NÃO use formatação markdown complexa - use texto plano com marcações simples

${custom_instructions ? `\nINSTRUÇÕES ADICIONAIS DO USUÁRIO:\n${custom_instructions}` : ""}
${target_audience ? `\nPÚBLICO-ALVO: ${target_audience}` : ""}
${objective ? `\nOBJETIVO DA CHAMADA: ${objective}` : ""}`;

      const userPrompt = `Crie um script de vendas completo para ligação de voz baseado no seguinte contexto de produto:

${productContext || "Nenhum produto cadastrado. Crie um script genérico de vendas consultivas."}

Estruture o script com as seguintes seções:
1. ABERTURA (saudação + hook de atenção)
2. QUALIFICAÇÃO (perguntas BANT)
3. APRESENTAÇÃO (benefícios do produto, não features)
4. OBJEÇÕES (3-5 objeções comuns com respostas)
5. FECHAMENTO (CTA + urgência)
6. FOLLOW-UP (se não fechar na ligação)`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errorText = await response.text();
        console.error("AI error:", response.status, errorText);
        throw new Error("Erro ao gerar script com IA");
      }

      const aiData = await response.json();
      const script = aiData.choices?.[0]?.message?.content || "Erro ao gerar script";

      return new Response(
        JSON.stringify({ script, product_context: !!productContext }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ACTION: tts_script - Convert a script section to speech via ElevenLabs
    if (action === "tts_script") {
      if (!ELEVENLABS_API_KEY) {
        return new Response(
          JSON.stringify({ error: "ELEVENLABS_API_KEY não configurada" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { text, voice_id } = body;
      if (!text) {
        return new Response(
          JSON.stringify({ error: "text is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const voiceIdToUse = voice_id || "JBFqnCBsd6RMkjVDRZzb";

      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceIdToUse}/stream?output_format=mp3_44100_128`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2_5",
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.8,
              style: 0.3,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const error = await ttsResponse.text();
        console.error("ElevenLabs TTS error:", error);
        throw new Error(`TTS error: ${error}`);
      }

      return new Response(ttsResponse.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "audio/mpeg",
          "Transfer-Encoding": "chunked",
        },
      });
    }

    // ACTION: list_products - List user's products for selection
    if (action === "list_products") {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: "Não autenticado" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: products } = await supabase
        .from("products")
        .select("id, name, description, price")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Also count knowledge chunks per product
      const productsWithKnowledge = await Promise.all(
        (products || []).map(async (p) => {
          const { count } = await supabase
            .from("knowledge_chunks")
            .select("*", { count: "exact", head: true })
            .eq("product_id", p.id);
          return { ...p, knowledge_count: count || 0 };
        })
      );

      return new Response(
        JSON.stringify({ products: productsWithKnowledge }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida. Use: generate_script, tts_script, list_products" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sales-voice-agent:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
