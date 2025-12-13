import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WhatsApp Business API verification token
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'salescore_webhook_verify';

serve(async (req) => {
  const url = new URL(req.url);

  // Handle webhook verification (GET request from Meta)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      return new Response(challenge, { status: 200 });
    }
    return new Response('Forbidden', { status: 403 });
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle incoming messages (POST request)
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log('Received webhook:', JSON.stringify(body));

      // Initialize Supabase
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Extract message data from WhatsApp webhook format
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        // This might be a status update, not a message
        return new Response(JSON.stringify({ status: 'ok' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const message = messages[0];
      const from = message.from; // Phone number
      const messageText = message.text?.body || '';
      const messageType = message.type;

      // Handle different message types
      let processedContent = messageText;
      if (messageType === 'image') {
        processedContent = '[Imagem recebida]';
      } else if (messageType === 'audio') {
        processedContent = '[Áudio recebido]';
      } else if (messageType === 'document') {
        processedContent = '[Documento recebido]';
      }

      // Find or create lead by phone number
      let { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('phone', from)
        .single();

      // Get a user to associate (in production, this would be based on the WhatsApp business account)
      const { data: users } = await supabase
        .from('products')
        .select('user_id')
        .limit(1);
      
      const defaultUserId = users?.[0]?.user_id;

      if (!lead && defaultUserId) {
        // Create new lead
        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert({
            user_id: defaultUserId,
            name: `WhatsApp ${from}`,
            phone: from,
            source: 'whatsapp',
            status: 'new',
            score: 10
          })
          .select()
          .single();

        if (leadError) {
          console.error('Error creating lead:', leadError);
          throw leadError;
        }
        lead = newLead;
      }

      if (!lead) {
        return new Response(JSON.stringify({ error: 'Could not create or find lead' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Find or create conversation
      let { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('status', 'active')
        .single();

      if (!conversation) {
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            lead_id: lead.id,
            channel: 'whatsapp',
            status: 'active'
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          throw convError;
        }
        conversation = newConv;
      }

      // Process message with sales agent (background task)
      (globalThis as any).EdgeRuntime?.waitUntil?.((async () => {
        try {
          const agentResponse = await fetch(`${supabaseUrl}/functions/v1/sales-agent`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              conversation_id: conversation.id,
              message: processedContent,
              lead_id: lead.id
            })
          });

          const result = await agentResponse.json();

          if (result.success) {
            // Send response back via WhatsApp API
            const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
            const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

            if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
              await fetch(
                `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: from,
                    type: 'text',
                    text: { body: result.response }
                  })
                }
              );
            }
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      })());

      return new Response(JSON.stringify({ status: 'processing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error: unknown) {
      console.error('Webhook error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
