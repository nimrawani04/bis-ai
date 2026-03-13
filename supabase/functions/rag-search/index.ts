import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Convert Gemini SSE stream to OpenAI-compatible format
async function convertGeminiStreamToOpenAI(geminiStream: ReadableStream) {
  const reader = geminiStream.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue;
            if (!line.startsWith('data: ')) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') continue;
            
            try {
              const geminiData = JSON.parse(jsonStr);
              const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
              
              if (text) {
                const openaiFormat = {
                  choices: [{
                    delta: { content: text },
                    index: 0,
                    finish_reason: null
                  }]
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

const groundingPrompt = `You are the BIS Smart Assistant — an expert AI grounded in real Bureau of Indian Standards (BIS) website content.

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

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured. Please set it in Supabase project settings." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // Convert messages to Gemini format
    const geminiContents = [
      { role: "user", parts: [{ text: finalPrompt }] },
      { role: "model", parts: [{ text: "Understood. I'll answer based on the BIS context provided." }] },
    ];
    
    for (const msg of messages) {
      geminiContents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
      });
    }

    // --- ANSWER: Pass context + conversation to LLM ---
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: `AI service error: ${response.status} - ${errorText}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const convertedStream = await convertGeminiStreamToOpenAI(response.body!);
    
    return new Response(convertedStream, {
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

