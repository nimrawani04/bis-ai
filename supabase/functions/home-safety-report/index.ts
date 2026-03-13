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

const systemPrompt = `You are the ISI Guardian Home Safety Analyst. You receive a list of household products with their certification status and safety score.

Generate a personalized home safety analysis in markdown. Be specific about each product. Use this structure:

## 🏠 Your Home Safety Analysis

### Priority Actions
List the most urgent safety actions needed, numbered. Be specific about which product and what to do.

### Product-by-Product Assessment
For each product, give a brief 1-2 line assessment with specific advice.

### Room-by-Room Tips
Based on the product categories, provide 3-4 practical tips for the rooms these products are likely in (kitchen, electrical areas, etc.).

### Your Action Plan
A prioritized 3-step action plan to improve the home safety score.

Keep it concise, practical, and focused on Indian consumer safety standards. Use emojis sparingly for visual clarity.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { products, score } = await req.json();
    if (!products) {
      return new Response(JSON.stringify({ error: "Missing products" }), {
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
          { role: "model", parts: [{ text: "Understood. I'll provide detailed home safety analysis." }] },
          { role: "user", parts: [{ text: `Home Safety Score: ${score}/100\n\nProducts scanned:\n${products}\n\nPlease provide a detailed home safety analysis.` }] },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
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
    console.error("home-safety-report error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
