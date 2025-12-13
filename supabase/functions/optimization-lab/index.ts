import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, user_id, agent_type, variant_id, converted } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ACTION: Get script for A/B testing
    if (action === 'get_script') {
      // Get all variants for this agent type
      const { data: variants } = await supabase
        .from('sales_script_variants')
        .select('*')
        .eq('user_id', user_id)
        .eq('agent_type', agent_type)
        .order('is_champion', { ascending: false });

      if (!variants || variants.length === 0) {
        return new Response(
          JSON.stringify({ script: null, variant_id: null }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // A/B Testing logic: 80% champion, 10% variant A, 10% variant B
      const random = Math.random();
      let selectedVariant;

      const champion = variants.find(v => v.is_champion);
      const challengers = variants.filter(v => !v.is_champion);

      if (random < 0.8 && champion) {
        selectedVariant = champion;
      } else if (random < 0.9 && challengers.length > 0) {
        selectedVariant = challengers[0];
      } else if (challengers.length > 1) {
        selectedVariant = challengers[1];
      } else {
        selectedVariant = champion || variants[0];
      }

      // Increment impressions
      await supabase
        .from('sales_script_variants')
        .update({ impressions: (selectedVariant.impressions || 0) + 1 })
        .eq('id', selectedVariant.id);

      return new Response(
        JSON.stringify({
          script: selectedVariant.content,
          variant_id: selectedVariant.id,
          is_champion: selectedVariant.is_champion
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Record conversion
    if (action === 'record_conversion' && variant_id) {
      const { data: variant } = await supabase
        .from('sales_script_variants')
        .select('*')
        .eq('id', variant_id)
        .single();

      if (variant) {
        const newConversions = (variant.conversions || 0) + (converted ? 1 : 0);
        const newImpressions = variant.impressions || 1;
        const newRate = newConversions / newImpressions;

        await supabase
          .from('sales_script_variants')
          .update({
            conversions: newConversions,
            conversion_rate: newRate
          })
          .eq('id', variant_id);

        // Check if this variant should become champion
        if (!variant.is_champion && newImpressions >= 50) {
          const { data: champion } = await supabase
            .from('sales_script_variants')
            .select('*')
            .eq('user_id', variant.user_id)
            .eq('agent_type', variant.agent_type)
            .eq('is_champion', true)
            .single();

          if (champion && newRate > champion.conversion_rate * 1.1) { // 10% better
            // Promote this variant to champion
            await supabase
              .from('sales_script_variants')
              .update({ is_champion: false })
              .eq('id', champion.id);

            await supabase
              .from('sales_script_variants')
              .update({ is_champion: true })
              .eq('id', variant_id);

            // Log evolution
            await supabase
              .from('script_evolution_log')
              .insert({
                variant_id,
                event_type: 'promotion',
                old_champion_id: champion.id,
                new_champion_id: variant_id,
                metrics: {
                  old_rate: champion.conversion_rate,
                  new_rate: newRate,
                  improvement: ((newRate - champion.conversion_rate) / champion.conversion_rate * 100).toFixed(2) + '%'
                }
              });

            return new Response(
              JSON.stringify({
                success: true,
                event: 'new_champion',
                message: `Variant ${variant.name} is now the champion with ${(newRate * 100).toFixed(2)}% conversion rate!`
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Generate new variant
    if (action === 'generate_variant' && LOVABLE_API_KEY) {
      const { data: champion } = await supabase
        .from('sales_script_variants')
        .select('*')
        .eq('user_id', user_id)
        .eq('agent_type', agent_type)
        .eq('is_champion', true)
        .single();

      if (!champion) {
        return new Response(
          JSON.stringify({ error: 'No champion script found' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const tones = ['aggressive', 'consultive', 'empathetic', 'urgent', 'casual'];
      const randomTone = tones[Math.floor(Math.random() * tones.length)];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você é um especialista em copywriting de vendas. Reescreva scripts mantendo a essência mas alterando o tom."
            },
            {
              role: "user",
              content: `Reescreva este script de vendas com tom ${randomTone}:

SCRIPT ORIGINAL:
${champion.content}

Mantenha os principais pontos mas altere:
- Tom de voz (${randomTone})
- Estrutura das frases
- CTAs

Retorne APENAS o novo script, sem explicações.`
            }
          ],
        }),
      });

      const aiData = await response.json();
      const newContent = aiData.choices?.[0]?.message?.content || champion.content;

      const { data: newVariant } = await supabase
        .from('sales_script_variants')
        .insert({
          user_id,
          agent_type,
          name: `Variant ${randomTone} - ${new Date().toISOString().split('T')[0]}`,
          content: newContent,
          tone: randomTone,
          parent_id: champion.id
        })
        .select()
        .single();

      // Log creation
      await supabase
        .from('script_evolution_log')
        .insert({
          variant_id: newVariant?.id,
          event_type: 'created',
          metrics: { tone: randomTone, parent: champion.name }
        });

      return new Response(
        JSON.stringify({
          success: true,
          variant: newVariant
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in optimization-lab:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
