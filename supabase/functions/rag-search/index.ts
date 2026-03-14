import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Generate query embedding using Gemini
 */
async function generateQueryEmbedding(query: string, apiKey: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: {
          parts: [{ text: query }]
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini embedding API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

/**
 * LLM-based re-ranking of retrieved chunks
 * Uses Gemini to score relevance of each chunk to the query
 */
async function rerankChunks(
  query: string,
  chunks: any[],
  apiKey: string,
  topK: number = 5
): Promise<any[]> {
  if (!chunks || chunks.length === 0) {
    return chunks;
  }

  console.log(`Re-ranking ${chunks.length} chunks for query: "${query}"`);

  // Build re-ranking prompt
  const rerankPrompt = `You are a relevance scoring system. Given a user query and a list of document chunks, score each chunk's relevance to the query on a scale of 0-10.

Query: "${query}"

For each chunk below, provide ONLY a relevance score (0-10) where:
- 10 = Perfectly answers the query
- 7-9 = Highly relevant, contains key information
- 4-6 = Somewhat relevant, contains related information
- 1-3 = Marginally relevant, tangentially related
- 0 = Not relevant at all

Respond with ONLY a JSON array of scores in the same order as the chunks. Format: [score1, score2, score3, ...]

Chunks to score:
${chunks.map((chunk, idx) => `
[${idx + 1}] Title: ${chunk.title}
Content: ${chunk.content.substring(0, 500)}...
`).join('\n')}

Respond with ONLY the JSON array of scores, nothing else.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: rerankPrompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 200,
          }
        })
      }
    );

    if (!response.ok) {
      console.error("Re-ranking API error:", response.status);
      return chunks.slice(0, topK); // Fallback to original order
    }

    const data = await response.json();
    const scoresText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON array from response
    const jsonMatch = scoresText.match(/\[[\d\s,\.]+\]/);
    if (!jsonMatch) {
      console.error("Failed to parse re-ranking scores, using original order");
      return chunks.slice(0, topK);
    }

    const scores: number[] = JSON.parse(jsonMatch[0]);
    
    if (scores.length !== chunks.length) {
      console.error(`Score count mismatch: ${scores.length} vs ${chunks.length}`);
      return chunks.slice(0, topK);
    }

    // Attach scores and sort by relevance
    const rankedChunks = chunks.map((chunk, idx) => ({
      ...chunk,
      rerank_score: scores[idx] || 0
    })).sort((a, b) => b.rerank_score - a.rerank_score);

    console.log("Re-ranking scores:", scores);
    console.log("Top ranked chunks:", rankedChunks.slice(0, topK).map(c => ({
      title: c.title,
      score: c.rerank_score
    })));

    return rankedChunks.slice(0, topK);
  } catch (error) {
    console.error("Re-ranking error:", error);
    return chunks.slice(0, topK); // Fallback to original order
  }
}

type ChunkMeta = { url: string; title: string; snippet: string; content_type: 'webpage' | 'pdf' | 'table' };

// Convert Gemini SSE stream to OpenAI-compatible format
async function convertGeminiStreamToOpenAI(geminiStream: ReadableStream, sourceUrls: string[] = [], chunkMeta: ChunkMeta[] = []) {
  const reader = geminiStream.getReader();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      let fullResponse = '';
      
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
                fullResponse += text;
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
        
        // Append sources if not already included and we have source URLs
        if (sourceUrls.length > 0 && !fullResponse.includes('---SOURCES---')) {
          const sourcesSection = '\n\n---SOURCES---\n' + sourceUrls.map(url => `- ${url}`).join('\n');
          const openaiFormat = {
            choices: [{
              delta: { content: sourcesSection },
              index: 0,
              finish_reason: null
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
        }

        // Append chunk metadata for dynamic citation previews
        if (chunkMeta.length > 0) {
          const metaSection = '\n\n---CHUNK_META---\n' + JSON.stringify(chunkMeta);
          const openaiFormat = {
            choices: [{
              delta: { content: metaSection },
              index: 0,
              finish_reason: null
            }]
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(openaiFormat)}\n\n`));
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

### 1. STRICT GROUNDING - NO HALLUCINATION
- Answer ONLY using the retrieved context provided below
- If NO context is provided or context is insufficient, you MUST respond: "I could not find specific information about this topic in the BIS database. Please visit https://www.bis.gov.in or contact BIS directly for the most accurate and up-to-date information."
- NEVER make up information, statistics, dates, fees, or procedures
- NEVER answer from general knowledge when context is missing
- If context is partial, acknowledge what you know and what you don't know

### 2. OUT-OF-SCOPE DETECTION
If a question is NOT about BIS, respond: "I can only answer questions related to the Bureau of Indian Standards (BIS) and its services."

### 3. CITATION REQUIREMENT
- Cite sources using the URLs from the retrieved chunks
- If no chunks were retrieved, do NOT include a ---SOURCES--- section

### 4. CONVERSATION CONTEXT
Maintain multi-turn conversation context from previous messages.

## FORMATTING
- Use markdown for rich formatting (headers, lists, bold, tables)
- For comparison questions, use markdown tables
- Keep answers informative and well-structured

## RESPONSE STRUCTURE

### When Context IS Available:
1. Answer the question using ONLY the provided context
2. Add the ---SOURCES--- section with all relevant URLs
3. Add the ---SUGGESTIONS--- section with 3 follow-up questions

### When Context IS NOT Available:
1. State clearly: "I could not find specific information about this topic in the BIS database."
2. Suggest visiting https://www.bis.gov.in or contacting BIS directly
3. DO NOT include ---SOURCES--- section
4. DO NOT include ---SUGGESTIONS--- section

## CITATIONS FORMAT (only when context exists)
---SOURCES---
- [URL from context chunk 1]
- [URL from context chunk 2]
- [URL from context chunk 3]

## SUGGESTIONS FORMAT (only when context exists)
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

    // Generate query embedding for semantic search
    let queryEmbedding: number[] | null = null;
    try {
      queryEmbedding = await generateQueryEmbedding(searchQuery, GEMINI_API_KEY);
      console.log("Generated query embedding");
    } catch (embeddingError) {
      console.error("Error generating query embedding:", embeddingError);
      // Fall back to FTS-only search if embedding generation fails
    }

    // Perform hybrid search with RRF fusion if embedding is available
    // Retrieve more chunks initially (12) for re-ranking
    let chunks;
    let searchError;
    
    if (queryEmbedding) {
      console.log("Using hybrid search (FTS + Semantic with RRF)");
      const result = await supabase.rpc('search_bis_chunks_hybrid', {
        search_query: searchQuery,
        query_embedding: queryEmbedding,
        match_count: 12, // Retrieve more for re-ranking
        filter_type: topic_filter && topic_filter !== 'all' ? topic_filter : null,
        rrf_k: 60,
      });
      chunks = result.data;
      searchError = result.error;
    } else {
      console.log("Using FTS-only search (fallback)");
      // Fallback to FTS-only search
      const result = await supabase.rpc('search_bis_chunks', {
        search_query: searchQuery,
        match_count: 12,
        filter_type: topic_filter && topic_filter !== 'all' ? topic_filter : null,
      });
      chunks = result.data;
      searchError = result.error;
    }

    if (searchError) {
      console.error("Search error:", searchError);
    }

    // If FTS/hybrid returned nothing, do a broad keyword scan as last resort
    if (!chunks || chunks.length === 0) {
      console.log("No chunks from search, trying broad keyword scan...");
      const keywords = searchQuery.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 3);
      if (keywords.length > 0) {
        const likeConditions = keywords.map(k => `content ILIKE '%${k.replace(/'/g, "''")}%'`).join(' OR ');
        const { data: broadChunks } = await supabase
          .from('bis_knowledge_chunks')
          .select('id, url, title, content_type, content, chunk_index')
          .or(likeConditions)
          .limit(6);
        if (broadChunks && broadChunks.length > 0) {
          console.log(`Broad scan found ${broadChunks.length} chunks`);
          chunks = broadChunks;
        }
      }
    }

    // --- RE-RANK: Use LLM to re-rank retrieved chunks for better relevance ---
    if (chunks && chunks.length > 0) {
      const rawChunks = chunks; // keep original in case re-ranking wipes everything
      try {
        chunks = await rerankChunks(searchQuery, chunks, GEMINI_API_KEY, 6);
        console.log(`Re-ranked to top ${chunks.length} chunks`);
        
        // Filter out chunks with very low relevance scores (< 2.0)
        const relevantChunks = chunks.filter(chunk => (chunk.rerank_score || 0) >= 2.0);
        
        if (relevantChunks.length === 0) {
          // Re-ranker was too aggressive — fall back to raw FTS results
          console.log("Re-ranker filtered everything out, falling back to raw FTS results");
          chunks = rawChunks.slice(0, 6);
        } else {
          chunks = relevantChunks;
          console.log(`Filtered to ${chunks.length} chunks above relevance threshold`);
        }
      } catch (rerankError) {
        console.error("Re-ranking failed, using original order:", rerankError);
        chunks = rawChunks.slice(0, 6);
      }
    }

    // --- BUILD CONTEXT ---
    let contextBlock = '';
    const sourceUrls: string[] = [];
    const chunkMeta: ChunkMeta[] = [];
    let hasContext = false;
    
    if (chunks && chunks.length > 0) {
      hasContext = true;
      contextBlock = '\n\n## RETRIEVED CONTEXT (use this to answer)\n\n';
      for (const chunk of chunks) {
        contextBlock += `### ${chunk.title}${chunk.url ? ` (Source: ${chunk.url})` : ''}\n`;
        contextBlock += `${chunk.content}\n\n`;
        
        // Collect unique source URLs
        if (chunk.url && !sourceUrls.includes(chunk.url)) {
          sourceUrls.push(chunk.url);
          // Detect content type from URL and content
          let content_type: 'webpage' | 'pdf' | 'table' = 'webpage';
          if (chunk.url.toLowerCase().includes('.pdf') || chunk.content_type === 'pdf') {
            content_type = 'pdf';
          } else if (chunk.content_type === 'table' || (chunk.content && chunk.content.includes('|') && chunk.content.includes('---'))) {
            content_type = 'table';
          }
          // Use first 300 chars of chunk content as snippet
          const snippet = chunk.content ? chunk.content.replace(/\s+/g, ' ').trim().slice(0, 300) : '';
          chunkMeta.push({ url: chunk.url, title: chunk.title || chunk.url, snippet, content_type });
        }
      }
    } else {
      hasContext = false;
      contextBlock = '\n\n## RETRIEVED CONTEXT\n⚠️ NO RELEVANT INFORMATION FOUND IN THE BIS DATABASE FOR THIS QUERY.\n\nYou MUST respond with:\n"I could not find specific information about this topic in the BIS database. Please visit https://www.bis.gov.in or contact BIS directly for the most accurate and up-to-date information."\n\nDO NOT attempt to answer from general knowledge. DO NOT make up information.\n';
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

    const convertedStream = await convertGeminiStreamToOpenAI(response.body!, sourceUrls, chunkMeta);
    
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

