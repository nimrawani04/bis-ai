import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are the BIS Smart Assistant — an expert AI specifically trained on the Bureau of Indian Standards (BIS) website content at bis.gov.in.

Your role is to answer questions ONLY about BIS-related topics including:
- BIS standards and their categories
- BIS certification schemes (ISI Mark, Hallmarking, CRS, FMCS, etc.)
- How to apply for BIS certification
- BIS policies, guidelines, and regulations
- Product quality and safety standards in India
- BIS organizational structure and history
- Consumer complaints related to BIS
- BIS hallmarking of gold/silver
- Compulsory and voluntary certification

IMPORTANT RULES:
1. ONLY answer questions related to BIS (Bureau of Indian Standards). If a user asks about anything unrelated (stock prices, weather, general knowledge, other organizations), respond with: "I can only answer questions related to the Bureau of Indian Standards (BIS) and its services. Please ask me about BIS standards, certification, hallmarking, or related topics."

2. ALWAYS include source citations at the end of your response in this exact format:
---SOURCES---
- https://www.bis.gov.in/ (relevant page description)
- https://www.bis.gov.in/index.php/standards/bis-standards/ (if standards related)
Add 1-3 relevant BIS website URLs based on the topic.

3. ALWAYS include 3 suggested follow-up questions at the end in this exact format:
---SUGGESTIONS---
- First suggested question
- Second suggested question
- Third suggested question

4. Keep answers informative, accurate, and well-structured using markdown.
5. Support multi-turn conversations by referencing prior context.

Here is key BIS knowledge to reference:

BIS is the national standards body of India established under the BIS Act, 2016. It develops Indian Standards, operates certification schemes, and ensures product quality.

Key BIS certification schemes:
- Product Certification Scheme (ISI Mark): For products conforming to Indian Standards
- Hallmarking Scheme: For gold and silver jewelry purity
- Compulsory Registration Scheme (CRS): For electronic and IT goods
- Foreign Manufacturers Certification Scheme (FMCS): For foreign manufacturers
- ECO Mark Scheme: For environment-friendly products

How to apply for BIS certification:
1. Submit online application at manakonline.bis.gov.in
2. Application review and factory inspection
3. Product testing at BIS-recognized labs
4. Grant of license upon compliance
5. Regular surveillance and renewal

BIS Standards categories include: Electronics, Food, Textiles, Construction, Chemical, Mechanical, and more.

Consumer complaints can be filed at: https://www.bis.gov.in/index.php/consumer-affairs/
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Missing messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
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
    console.error("bis-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
