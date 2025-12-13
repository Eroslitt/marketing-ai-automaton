import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Default safety rules
const DEFAULT_RULES = [
  {
    name: 'max_discount_20',
    rule_type: 'price_limit',
    condition: { max_discount_percent: 20 },
    action: 'escalate',
    check: (message: string, context: any) => {
      const discountMatch = message.match(/(\d+)%\s*(de\s+)?desconto/i);
      if (discountMatch) {
        const discount = parseInt(discountMatch[1]);
        if (discount > 20) {
          return { violated: true, reason: `Desconto de ${discount}% excede o limite de 20%` };
        }
      }
      return { violated: false };
    }
  },
  {
    name: 'no_competitor_mention',
    rule_type: 'forbidden_topic',
    condition: { forbidden_words: ['concorrente', 'competidor'] },
    action: 'regenerate',
    check: (message: string, context: any) => {
      const competitors = context.competitors || [];
      const lowerMessage = message.toLowerCase();
      
      for (const competitor of competitors) {
        if (lowerMessage.includes(competitor.toLowerCase())) {
          return { violated: true, reason: `Menção a concorrente: ${competitor}` };
        }
      }
      
      // Check for negative competitor mentions
      const negativePatterns = [
        /melhor (do )?que .+/i,
        /ao contrário (de|do|da) .+/i,
        /diferente (de|do|da) .+/i
      ];
      
      for (const pattern of negativePatterns) {
        if (pattern.test(message)) {
          return { violated: true, reason: 'Possível comparação com concorrente' };
        }
      }
      
      return { violated: false };
    }
  },
  {
    name: 'verify_price_exists',
    rule_type: 'content_filter',
    condition: { verify_price: true },
    action: 'block',
    check: (message: string, context: any) => {
      const priceMatch = message.match(/R\$\s*([\d.,]+)/g);
      if (priceMatch && context.products) {
        for (const priceStr of priceMatch) {
          const price = parseFloat(priceStr.replace('R$', '').replace('.', '').replace(',', '.').trim());
          const validPrice = context.products.some((p: any) => 
            Math.abs((p.price || 0) - price) < 0.01 ||
            Math.abs((p.price || 0) * 0.8 - price) < 0.01 // 20% discount
          );
          if (!validPrice && price > 100) { // Ignore small amounts
            return { violated: true, reason: `Preço R$ ${price} não encontrado na tabela de produtos` };
          }
        }
      }
      return { violated: false };
    }
  },
  {
    name: 'no_false_promises',
    rule_type: 'content_filter',
    condition: { forbidden_phrases: ['garantia de resultado', '100% garantido', 'sem risco'] },
    action: 'regenerate',
    check: (message: string, context: any) => {
      const forbiddenPhrases = [
        'garantia de resultado',
        '100% garantido',
        'sem risco',
        'retorno garantido',
        'sucesso garantido',
        'prometo',
        'certamente vai',
        'com certeza absoluta'
      ];
      
      const lowerMessage = message.toLowerCase();
      for (const phrase of forbiddenPhrases) {
        if (lowerMessage.includes(phrase)) {
          return { violated: true, reason: `Promessa exagerada: "${phrase}"` };
        }
      }
      return { violated: false };
    }
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, user_id, conversation_id, context = {} } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user's custom rules
    let customRules: any[] = [];
    if (user_id) {
      const { data: rules } = await supabase
        .from('safety_rules')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_active', true);
      customRules = rules || [];
    }

    // Get products for price validation
    let products: any[] = [];
    if (user_id) {
      const { data: prods } = await supabase
        .from('products')
        .select('name, price')
        .eq('user_id', user_id);
      products = prods || [];
    }

    const enrichedContext = { ...context, products };

    // Check all rules
    const violations: any[] = [];

    // Check default rules
    for (const rule of DEFAULT_RULES) {
      const result = rule.check(message, enrichedContext);
      if (result.violated) {
        violations.push({
          rule_name: rule.name,
          rule_type: rule.rule_type,
          action: rule.action,
          reason: result.reason
        });
      }
    }

    // Check custom rules
    for (const rule of customRules) {
      if (rule.rule_type === 'forbidden_topic' && rule.condition.keywords) {
        const lowerMessage = message.toLowerCase();
        for (const keyword of rule.condition.keywords) {
          if (lowerMessage.includes(keyword.toLowerCase())) {
            violations.push({
              rule_id: rule.id,
              rule_name: rule.name,
              rule_type: rule.rule_type,
              action: rule.action,
              reason: `Palavra proibida: "${keyword}"`
            });
            break;
          }
        }
      }
    }

    // Log violations
    for (const violation of violations) {
      if (violation.rule_id) {
        await supabase.from('safety_violations').insert({
          rule_id: violation.rule_id,
          conversation_id,
          original_message: message,
          violation_reason: violation.reason,
          action_taken: violation.action
        });

        // Increment violation count
        await supabase
          .from('safety_rules')
          .update({ violations_count: supabase.rpc('increment', { row_id: violation.rule_id }) })
          .eq('id', violation.rule_id);
      }
    }

    const isSafe = violations.length === 0;
    const shouldBlock = violations.some(v => v.action === 'block');
    const shouldRegenerate = violations.some(v => v.action === 'regenerate');
    const shouldEscalate = violations.some(v => v.action === 'escalate');

    return new Response(
      JSON.stringify({
        is_safe: isSafe,
        violations,
        actions: {
          block: shouldBlock,
          regenerate: shouldRegenerate,
          escalate: shouldEscalate
        },
        recommendation: shouldBlock 
          ? 'Mensagem bloqueada. Requer intervenção humana.'
          : shouldRegenerate 
          ? 'Regenerar mensagem com restrições aplicadas.'
          : shouldEscalate
          ? 'Escalar para aprovação humana antes de enviar.'
          : 'Mensagem aprovada para envio.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in safety-layer:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
