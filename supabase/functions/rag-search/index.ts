import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
        
        // Always append our structured sources block from DB chunk URLs.
        // Gemini may write its own ---SOURCES--- inline; we ignore that and
        // always emit the canonical block so parseSources() on the frontend
        // reliably finds bare "- https://..." lines.
        if (sourceUrls.length > 0) {
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

const groundingPrompt = `You are the BIS Smart Assistant — an expert AI on the Bureau of Indian Standards (BIS).

## PRIORITY ORDER FOR ANSWERING
1. FIRST: Use the RETRIEVED CONTEXT section below if it contains relevant information
2. SECOND: Use the BUILT-IN BIS KNOWLEDGE BASE below for common BIS topics
3. LAST RESORT: If neither has relevant info, say you couldn't find it

## CRITICAL RULES

### 1. OUT-OF-SCOPE DETECTION
If a question is NOT about BIS, respond: "I can only answer questions related to the Bureau of Indian Standards (BIS) and its services."

### 2. CITATION REQUIREMENT
- When answering from RETRIEVED CONTEXT, cite the source URLs from those chunks
- When answering from BUILT-IN KNOWLEDGE, cite the relevant bis.gov.in URL from the knowledge base
- Only say "I could not find information" if BOTH the retrieved context AND built-in knowledge lack the answer

### 3. CONVERSATION CONTEXT
Maintain multi-turn conversation context from previous messages.

### 4. NO HALLUCINATION
Never make up fees, dates, or procedures not present in the context or knowledge base.

## FORMATTING
- Use markdown for rich formatting (headers, lists, bold, tables)
- For comparison questions, use markdown tables

## RESPONSE STRUCTURE
1. Answer using retrieved context (preferred) or built-in knowledge
2. Add ---SOURCES--- with relevant URLs
3. Add ---SUGGESTIONS--- with 3 follow-up questions

## CITATIONS FORMAT
---SOURCES---
- [relevant URL]

## SUGGESTIONS FORMAT
---SUGGESTIONS---
- First suggested question
- Second suggested question
- Third suggested question

## MULTILINGUAL SUPPORT
If the user writes in Hindi, Hinglish, or other Indian languages, respond in the same language. Keep technical terms (BIS, ISI, FMCS) in English.

---

## BUILT-IN BIS KNOWLEDGE BASE

### About BIS
The Bureau of Indian Standards (BIS) is the national standards body of India established under the BIS Act, 2016. It operates under the Ministry of Consumer Affairs, Food and Public Distribution, Government of India. BIS was formerly known as the Indian Standards Institution (ISI), established in 1947. BIS headquarters is in New Delhi with 5 Regional Offices (Delhi, Mumbai, Kolkata, Chennai, Chandigarh) and 21 Branch Offices across India.

### BIS Functions
1. Development of Indian Standards
2. Product Certification (ISI Mark)
3. Hallmarking of precious metals
4. Compulsory Registration Scheme (CRS) for electronics
5. Laboratory testing and calibration
6. Training and consumer awareness
7. International cooperation (ISO, IEC membership)

### BIS Certification Schemes

**Product Certification (ISI Mark)**
- For products conforming to Indian Standards; applies to 900+ products
- Application via manakonline.bis.gov.in
- Process: Application → Document review → Factory inspection → Product testing → License grant
- Surveillance audits conducted regularly
- Source: https://www.bis.gov.in/index.php/certification/product-certification/

**Hallmarking Scheme**
- For gold and silver jewelry purity certification
- Gold grades: 14K (585), 18K (750), 20K (833), 22K (916), 24K (999)
- Each piece gets a HUID (Hallmark Unique Identification) number
- Mandatory for gold jewelry since June 2021
- Source: https://www.bis.gov.in/index.php/certification/hallmarking/

**Compulsory Registration Scheme (CRS)**
- For electronic and IT goods (adapters, LED lights, laptops, mobile phones, smart watches, etc.)
- Self-declaration with testing at BIS-recognized labs
- Source: https://www.bis.gov.in/index.php/certification/scheme-for-compulsory-registration/

**Foreign Manufacturers Certification Scheme (FMCS)**
- For foreign manufacturers wanting to sell in India
- Requires liaison office or authorized Indian representative
- Source: https://www.bis.gov.in/index.php/certification/foreign-manufacturers-certification-scheme-fmcs/

**ECO Mark Scheme**
- For environment-friendly products (soaps, paints, paper, plastics, textiles)

### How to Apply for BIS Certification
1. Visit manakonline.bis.gov.in and create an account
2. Submit online application with documents (test reports, factory details, quality control plan)
3. BIS reviews and assigns an officer
4. Factory/premises inspection by BIS officer
5. Product samples tested at BIS-recognized laboratories
6. If compliant, BIS grants the license/certificate
7. Annual surveillance and periodic renewal required
- Source: https://manakonline.bis.gov.in

### Consumer Affairs & Complaints
- Consumers can file complaints about sub-standard ISI marked products via the BIS Consumer Affairs portal
- Visit: https://www.bis.gov.in/index.php/consumer-affairs/
- BIS conducts market surveillance to check compliance
- Consumer awareness campaigns, workshops, and publications
- Collaboration with consumer organizations
- World Standards Day celebrations annually
- Complaint process: Visit portal → Provide product details and issue → BIS investigates

### BIS Standards
- 22,000+ Indian Standards published
- Covers: Food, Electronics, Textiles, Civil Engineering, Chemicals, Mechanical, Medical, etc.
- Developed through Technical Committees with industry, government, and consumer representation
- Designated as "IS" followed by a number (e.g., IS 10500 for drinking water)
- Can be purchased from bis.gov.in or read at BIS library
- Source: https://www.bis.gov.in/index.php/standards/bis-standards/

### BIS Laboratories
- Operates labs in: Mumbai, Kolkata, Chandigarh, Chennai, and Sahibabad
- Testing for: Gold/silver, electronics, chemicals, food, textiles, mechanical products
- NABL accredited laboratories
- Source: https://www.bis.gov.in/index.php/laboratory-services/

### Manak Online Portal
- manakonline.bis.gov.in — for all certification applications, status tracking, fee payment, certificate download, and license renewal

### BIS Act 2016
- Replaced the Bureau of Indian Standards Act, 1986
- Provides for mandatory standards and certification
- Penalties for misuse of BIS marks
- Enables hallmarking regulation`;

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

    // --- RETRIEVE: FTS search ---
    const searchQuery = typeof query === 'string'
      ? query
      : Array.isArray(query)
        ? (query as any[]).find((c) => c.type === 'text')?.text || ''
        : '';

    let chunks: any[] = [];

    // 1. Try FTS via RPC
    const { data: ftsData, error: ftsError } = await supabase.rpc('search_bis_chunks', {
      search_query: searchQuery,
      match_count: 10,
      filter_type: topic_filter && topic_filter !== 'all' ? topic_filter : null,
    });

    if (ftsError) {
      console.error("FTS search error:", ftsError);
    } else if (ftsData && ftsData.length > 0) {
      chunks = ftsData;
      console.log(`FTS returned ${chunks.length} chunks`);
    }

    // 2. Fallback: ILIKE scan on meaningful keywords
    if (chunks.length === 0) {
      console.log("FTS returned nothing, trying ILIKE fallback...");
      const keywords = searchQuery
        .toLowerCase()
        .split(/\s+/)
        .filter((w: string) => w.length > 3)
        .slice(0, 4);

      if (keywords.length > 0) {
        // Build individual ILIKE filters and OR them via multiple .select calls
        let q = supabase
          .from('bis_knowledge_chunks')
          .select('id, url, title, content_type, content, chunk_index');

        // Use the first keyword as primary filter, then filter in JS for others
        q = q.ilike('content', `%${keywords[0]}%`);

        const { data: likeData } = await q.limit(20);
        if (likeData && likeData.length > 0) {
          // Score by how many keywords appear in the content
          const scored = likeData.map((row: any) => ({
            ...row,
            _score: keywords.filter((k: string) => row.content.toLowerCase().includes(k)).length,
          }));
          scored.sort((a: any, b: any) => b._score - a._score);
          chunks = scored.slice(0, 8);
          console.log(`ILIKE fallback found ${chunks.length} chunks`);
        }
      }
    }

    // --- BUILD CONTEXT ---
    let contextBlock = '';
    const sourceUrls: string[] = [];
    const chunkMeta: ChunkMeta[] = [];
    
    if (chunks && chunks.length > 0) {
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
      contextBlock = '\n\n## RETRIEVED CONTEXT\nNo specific chunks were retrieved from the database for this query. Use the BUILT-IN BIS KNOWLEDGE BASE above to answer if the topic is covered there. If the topic is not covered in either source, then say you could not find the information.\n';
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

