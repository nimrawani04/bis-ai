import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const groundingPrompt = `You are the BIS AI — an expert AI grounded in real Bureau of Indian Standards (BIS) website content.

## CRITICAL RULES
1. Answer ONLY using the retrieved context provided below. If the context doesn't contain enough information, say so honestly.
2. NEVER hallucinate or make up information not present in the context.
3. If a question is NOT about BIS, respond: "I can only answer questions related to the Bureau of Indian Standards (BIS) and its services."
4. Cite sources using the URLs from the retrieved chunks.
5. Maintain multi-turn conversation context from previous messages.

## FORMATTING
- Use markdown for rich formatting (headers, lists, bold, tables)
- For comparison questions, use markdown tables
- Keep answers informative and well-structured

## CITATIONS FORMAT
ALWAYS include at the end:
---SOURCES---
- [URL from context chunk 1]
- [URL from context chunk 2]

## SUGGESTIONS FORMAT
ALWAYS include exactly 3 follow-up questions:
---SUGGESTIONS---
- First suggested question
- Second suggested question
- Third suggested question

## MULTILINGUAL SUPPORT
If the user writes in Hindi, Hinglish, or other Indian languages, respond in the same language. Keep technical terms (BIS, ISI, FMCS) in English.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, topic_filter, language, simple_mode } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // --- RETRIEVE: Get the user's latest query ---
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    const query = lastUserMsg?.content || '';

    // Extract text query (ignore image content)
    const searchQuery = typeof query === 'string'
      ? query
      : Array.isArray(query)
        ? query.find((c: any) => c.type === 'text')?.text || ''
        : '';

    // Full-text search for top-K relevant chunks
    const { data: chunks, error: searchError } = await supabase.rpc('search_bis_chunks', {
      search_query: searchQuery,
      match_count: 8,
      filter_type: topic_filter && topic_filter !== 'all' ? topic_filter : null,
    });

    if (searchError) {
      console.error("Search error:", searchError);
    }

    // --- BUILD CONTEXT ---
    let contextBlock = '';
    if (chunks && chunks.length > 0) {
      contextBlock = '\n\n## RETRIEVED CONTEXT (use this to answer)\n\n';
      for (const chunk of chunks) {
        contextBlock += `### ${chunk.title}${chunk.url ? ` (Source: ${chunk.url})` : ''}\n`;
        contextBlock += `${chunk.content}\n\n`;
      }
    } else {
      contextBlock = '\n\n## RETRIEVED CONTEXT\nNo specific chunks found for this query. Answer from your general BIS knowledge if applicable, or indicate that information was not found.\n';
    }

    // Build final system prompt
    let finalPrompt = groundingPrompt + contextBlock;

    if (simple_mode) {
      finalPrompt += `\n\nSIMPLE MODE: Explain as if talking to a 10-year-old. Use emojis, short sentences, and fun analogies.`;
    }

    const langMap: Record<string, string> = {
      hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu", ur: "Urdu",
      ks: "Kashmiri", mr: "Marathi", gu: "Gujarati", kn: "Kannada",
      ml: "Malayalam", pa: "Punjabi"
    };
    if (language && language !== "en" && langMap[language]) {
      finalPrompt += `\n\nRESPOND IN ${langMap[language]}. Keep technical terms in English.`;
    }

    // --- ANSWER: Pass context + conversation to LLM ---
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: finalPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("rag-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

