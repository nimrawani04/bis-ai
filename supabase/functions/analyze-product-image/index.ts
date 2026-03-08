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

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a product safety analysis assistant for Indian consumers. Analyze the product image and provide:
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
}`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Analyze this product image for safety verification:" },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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
