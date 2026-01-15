import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This edge function handles ElevenLabs Conversational AI operations
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent_id, action, text, voice_id } = await req.json();
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');

    // Check configuration status
    if (action === 'check_config') {
      return new Response(
        JSON.stringify({ configured: !!ELEVENLABS_API_KEY }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'ELEVENLABS_API_KEY not configured',
          setup_required: true,
          message: 'Configure sua chave API do ElevenLabs nos secrets do projeto'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate conversation token for WebRTC
    if (action === 'get_token') {
      if (!agent_id) {
        return new Response(
          JSON.stringify({ error: 'agent_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Requesting token for agent:', agent_id);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${agent_id}`,
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('ElevenLabs token error:', error);
        throw new Error(`Failed to get conversation token: ${error}`);
      }

      const data = await response.json();
      console.log('Token received successfully');
      
      return new Response(
        JSON.stringify({ token: data.token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get signed URL for WebSocket connection
    if (action === 'get_signed_url') {
      if (!agent_id) {
        return new Response(
          JSON.stringify({ error: 'agent_id is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Requesting signed URL for agent:', agent_id);

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agent_id}`,
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('ElevenLabs signed URL error:', error);
        throw new Error(`Failed to get signed URL: ${error}`);
      }

      const data = await response.json();
      console.log('Signed URL received successfully');
      
      return new Response(
        JSON.stringify({ signed_url: data.signed_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Text to Speech
    if (action === 'tts') {
      const voiceIdToUse = voice_id || 'JBFqnCBsd6RMkjVDRZzb'; // George voice as default
      
      if (!text) {
        return new Response(
          JSON.stringify({ error: 'text is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Generating TTS for text:', text.substring(0, 50) + '...');

      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceIdToUse}/stream?output_format=mp3_44100_128`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_turbo_v2_5',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('TTS error:', error);
        throw new Error(`TTS error: ${error}`);
      }

      console.log('TTS audio generated successfully');

      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'audio/mpeg',
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // List available voices
    if (action === 'list_voices') {
      const response = await fetch(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list voices: ${error}`);
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ voices: data.voices }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List conversational agents
    if (action === 'list_agents') {
      const response = await fetch(
        'https://api.elevenlabs.io/v1/convai/agents',
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to list agents: ${error}`);
      }

      const data = await response.json();
      
      return new Response(
        JSON.stringify({ agents: data.agents || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: check_config, get_token, get_signed_url, tts, list_voices, list_agents' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in voice-realtime:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
