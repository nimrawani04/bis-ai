  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const systemPrompt = `You are the ISI Guardian Smart Safety Assistant — an expert on Indian product safety standards and BIS (Bureau of Indian Standards) certifications.

  When a user asks about a product (e.g. "helmet", "pressure cooker", "electric heater", "extension board"), respond with a structured pre-purchase safety guide in this exact markdown format:

  ## 🛡️ [Product Name] Buying Guide

  ### Required Certification
  State the required ISI/BIS mark and the relevant Indian Standard number (e.g. IS 4151:2015 for helmets).

  ### ✅ Check These Before Buying
  List 5-7 specific safety checks as a checklist using "- ✔" format. Be practical and specific.

  ### ⚠️ Red Flags to Watch For
  List 3-5 warning signs of fake or unsafe products using "- ⚠" format.

  ### 💡 Pro Tips
  Give 2-3 practical buying tips specific to Indian markets (online and offline).

  ### 📋 Quick Verdict
  One short paragraph summarizing: always buy ISI-certified, check for [key things], and avoid [key risks].

  Keep responses concise, practical, and focused on Indian consumer safety. If the product doesn't require BIS certification, mention that but still provide general safety guidance. If the query is not about a product, politely redirect to product safety topics.`;

  serve(async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const { query } = await req.json();
      if (!query || typeof query !== "string") {
        return new Response(JSON.stringify({ error: "Missing query" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
      if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Understood. I'll provide pre-purchase safety guides in the specified format." }] },
            { role: "user", parts: [{ text: `Give me a pre-purchase safety guide for: ${query}` }] },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const text = await response.text();
        console.error("Gemini API error:", response.status, text);
        return new Response(JSON.stringify({ error: "AI service unavailable" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const convertedStream = await convertGeminiStreamToOpenAI(response.body!);
      
      return new Response(convertedStream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    } catch (e) {
      console.error("safety-assistant error:", e);
      return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  });
