import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Chunk text into ~500-token overlapping passages.
 * Preserves headings and structural units.
 */
function chunkText(text: string, maxTokens = 500, overlap = 50): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;
  let lastHeading = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect headings
    if (trimmed.startsWith('#') || trimmed.startsWith('**') && trimmed.endsWith('**')) {
      lastHeading = trimmed;
    }

    const lineTokens = trimmed.split(/\s+/).length;

    if (currentLength + lineTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));

      // Overlap: keep last few lines
      const overlapLines: string[] = [];
      let overlapLen = 0;
      for (let i = currentChunk.length - 1; i >= 0 && overlapLen < overlap; i--) {
        overlapLines.unshift(currentChunk[i]);
        overlapLen += currentChunk[i].split(/\s+/).length;
      }

      currentChunk = lastHeading ? [lastHeading, ...overlapLines] : [...overlapLines];
      currentLength = currentChunk.reduce((s, l) => s + l.split(/\s+/).length, 0);
    }

    currentChunk.push(trimmed);
    currentLength += lineTokens;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { documents } = await req.json();

    if (!documents || !Array.isArray(documents)) {
      return new Response(JSON.stringify({ error: "Missing documents array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalChunks = 0;

    for (const doc of documents) {
      const { url, title, content_type, content } = doc;
      if (!title || !content) continue;

      const chunks = chunkText(content);

      const rows = chunks.map((chunk, index) => ({
        url: url || null,
        title,
        content_type: content_type || 'general',
        content: chunk,
        chunk_index: index,
      }));

      const { error } = await supabase
        .from('bis_knowledge_chunks')
        .insert(rows);

      if (error) {
        console.error(`Error inserting chunks for "${title}":`, error);
        throw error;
      }

      totalChunks += chunks.length;
    }

    return new Response(JSON.stringify({ success: true, chunks_created: totalChunks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("rag-ingest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
