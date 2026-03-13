import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "No image URL provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `You are a product safety analysis assistant for Indian consumers. Analyze the product image and provide:
1. Product name/type identified
2. Any visible ISI/BIS marks or certification numbers
3. Brand name if visible
4. Category (electronics, food, toys, etc.)
5. Safety observations (packaging condition, visible warnings, label quality)
6. Risk assessment (low/medium/high) based on visual inspection

Respond in JSON format:
{
  "productName": "string",
  "brand": "string or null",
  "category": "string",
  "certificationMarks": ["list of visible marks"],
  "certificationNumber": "string or null",
  "safetyObservations": ["list of observations"],
  "riskLevel": "low|medium|high",
  "summary": "Brief 2-sentence summary",
  "recommendation": "What the consumer should do next"
}

Analyze this product image for safety verification:` },
              { 
                inlineData: {
                  mimeType: imageUrl.startsWith('data:') ? imageUrl.split(';')[0].split(':')[1] : 'image/jpeg',
                  data: imageUrl.startsWith('data:') ? imageUrl.split(',')[1] : await (await fetch(imageUrl)).arrayBuffer().then(buf => btoa(String.fromCharCode(...new Uint8Array(buf))))
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Try to parse JSON from the response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: content, riskLevel: "medium" };
    } catch {
      analysis = { summary: content, riskLevel: "medium" };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error analyzing product image:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
