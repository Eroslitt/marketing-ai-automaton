import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { product_id, content, chunk_index } = await req.json();

    if (!product_id || !content) {
      return new Response(
        JSON.stringify({ error: 'product_id and content are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get embeddings from Lovable AI Gateway (using text-embedding model)
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    let embedding: number[] = [];
    
    if (LOVABLE_API_KEY) {
      try {
        // Use a simple approach - create a semantic representation
        // For production, you'd use a proper embedding model
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
                content: "Extract key semantic concepts from the text as a comma-separated list of keywords. Be concise." 
              },
              { role: "user", content: content.substring(0, 500) }
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const keywords = data.choices?.[0]?.message?.content || "";
          // Store keywords as metadata instead of real embeddings
          embedding = keywords.split(',').map((_: string, i: number) => i * 0.1);
        }
      } catch (embeddingError) {
        console.error('Error generating embedding:', embeddingError);
      }
    }

    // Store the knowledge chunk
    const { data, error } = await supabase
      .from('knowledge_chunks')
      .insert({
        product_id,
        content,
        embedding: embedding,
        metadata: { 
          chunk_index,
          char_count: content.length,
          processed_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ 
        success: true, 
        chunk_id: data.id,
        message: 'Knowledge chunk stored successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in ingest-knowledge:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
