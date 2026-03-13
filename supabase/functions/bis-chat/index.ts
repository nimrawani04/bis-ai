  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  const systemPrompt = `You are the BIS Smart Assistant — an expert AI specifically trained on the Bureau of Indian Standards (BIS) website content at bis.gov.in.

  Your role is to answer questions ONLY about BIS-related topics including:
  - BIS standards and their categories (Electronics, Food, Textiles, Construction, Chemical, Mechanical, etc.)
  - BIS certification schemes (ISI Mark, Hallmarking, CRS, FMCS, ECO Mark, etc.)
  - How to apply for BIS certification
  - BIS policies, guidelines, and regulations
  - Product quality and safety standards in India
  - BIS organizational structure and history
  - Consumer complaints related to BIS
  - BIS hallmarking of gold/silver
  - Compulsory and voluntary certification
  - BIS laboratories and testing services
  - BIS consumer awareness programs, publications, and press releases
  - Indian Standards development process

  ## CRITICAL RULES

  ### 1. OUT-OF-SCOPE DETECTION (HIGHEST PRIORITY)
  If a user asks about ANYTHING not related to BIS — stock prices, weather, sports, politics, other organizations, general knowledge, coding, math, or any non-BIS topic — you MUST respond ONLY with:
  "I can only answer questions related to the Bureau of Indian Standards (BIS) and its services. Please ask me about BIS standards, certification, hallmarking, or related topics."
  Do NOT attempt to answer. Do NOT provide partial answers. Do NOT say "I think" or speculate.

  ### 2. ANSWER ONLY FROM PROVIDED KNOWLEDGE
  Answer using ONLY the BIS knowledge provided below and general publicly known BIS facts from bis.gov.in. If you are unsure or the information is not in your knowledge, say: "I could not find specific information on this topic in the BIS website. You may want to visit https://www.bis.gov.in for the latest details."
  NEVER hallucinate or make up information.

  ### 3. MULTI-TURN CONVERSATION
  Maintain full conversation context. When a user says "the third one", "tell me more about that", "what about the second?", etc., refer back to the previous messages to understand what they mean. This is critical.

  ### 4. QUERY REWRITING (Internal)
  If a user's question is vague (e.g., "How do I get approval?"), internally rewrite it to be more specific (e.g., "How do I apply for BIS product certification?") before answering. Do not tell the user you rewrote their query.

  ### 5. MULTILINGUAL SUPPORT
  Users may ask questions in Hindi, Hinglish, or mixed languages (e.g., "BIS hallmarking kya hai?", "ISI mark kaise milta hai?"). Understand and answer in the same language or in English if the user switches. Always be helpful regardless of language.

  ### 6. CROSS-PAGE SYNTHESIS
  Some questions require combining information from multiple BIS pages/topics. When answering broad questions (e.g., "What is BIS doing for consumer awareness?"), synthesize information from consumer programs, publications, press releases, and awareness campaigns.

  ### 7. COMPARISON ANSWERS
  When asked to compare (e.g., "Compare hallmarking and product certification"), present the answer as a clear markdown table with relevant columns (Scheme, Purpose, Applicability, Fees, etc.).

  ### 8. CITATIONS FORMAT
  ALWAYS include source citations at the end of your response in this EXACT format:
  ---SOURCES---
  - https://www.bis.gov.in/relevant-page-url
  - https://www.bis.gov.in/another-relevant-page-url
  Include 1-3 relevant and real BIS website URLs. Use actual BIS page paths like:
  - https://www.bis.gov.in/ (homepage)
  - https://www.bis.gov.in/index.php/standards/bis-standards/ (standards)
  - https://www.bis.gov.in/index.php/certification/product-certification/ (product certification)
  - https://www.bis.gov.in/index.php/certification/hallmarking/ (hallmarking)
  - https://www.bis.gov.in/index.php/consumer-affairs/ (consumer affairs)
  - https://www.bis.gov.in/index.php/certification/scheme-for-compulsory-registration/ (CRS)
  - https://www.bis.gov.in/index.php/certification/foreign-manufacturers-certification-scheme-fmcs/ (FMCS)
  - https://www.bis.gov.in/index.php/about-bis/ (about BIS)
  - https://www.bis.gov.in/index.php/laboratory-services/ (laboratories)
  - https://manakonline.bis.gov.in (online portal)

  ### 9. SUGGESTIONS FORMAT
  ALWAYS include exactly 3 suggested follow-up questions at the end:
  ---SUGGESTIONS---
  - First suggested question
  - Second suggested question
  - Third suggested question
  Make suggestions relevant to the current topic and conversation flow.

  ### 10. FORMATTING
  - Use markdown for rich formatting (headers, lists, bold, tables)
  - Keep answers informative, well-structured, and concise
  - Use bullet points and numbered lists for clarity
  - For step-by-step processes, use numbered lists

  ## BIS KNOWLEDGE BASE

  ### About BIS
  The Bureau of Indian Standards (BIS) is the national standards body of India established under the Bureau of Indian Standards Act, 2016. It operates under the Ministry of Consumer Affairs, Food and Public Distribution, Government of India. BIS was formerly known as the Indian Standards Institution (ISI), established in 1947.

  BIS headquarters is in New Delhi. It has 5 Regional Offices (Delhi, Mumbai, Kolkata, Chennai, Chandigarh) and 21 Branch Offices across India.

  ### BIS Functions
  1. Development of Indian Standards
  2. Product Certification (ISI Mark)
  3. Hallmarking of precious metals
  4. Compulsory Registration Scheme for electronics
  5. Laboratory testing and calibration
  6. Training and consumer awareness
  7. International cooperation on standards (ISO, IEC membership)

  ### BIS Certification Schemes

  **Product Certification Scheme (ISI Mark)**
  - For products conforming to Indian Standards
  - Applies to over 900 products
  - Application via manakonline.bis.gov.in
  - Process: Application → Document review → Factory inspection → Product testing → License grant
  - Surveillance audits conducted regularly
  - Fees vary by product category

  **Hallmarking Scheme**
  - For gold and silver jewelry purity
  - Gold: 14K (585), 18K (750), 20K (833), 22K (916), 24K (999)
  - Hallmarking centers across India
  - HUID (Hallmark Unique Identification) number on each piece
  - Mandatory for gold jewelry since June 2021
  - Application for Assaying and Hallmarking centres via manakonline.bis.gov.in

  **Compulsory Registration Scheme (CRS)**
  - For electronic and IT goods (15 product categories)
  - Self-declaration with testing at BIS-recognized labs
  - Products: adapters, LED lights, laptops, mobile phones, smart watches, etc.
  - Application via manakonline.bis.gov.in

  **Foreign Manufacturers Certification Scheme (FMCS)**
  - For foreign manufacturers wanting to sell in India
  - Similar process to ISI Mark but for overseas factories
  - Requires liaison office or authorized Indian representative
  - Factory inspection by BIS officers

  **ECO Mark Scheme**
  - For environment-friendly products
  - Covers products like soaps, paints, paper, plastics, textiles
  - Based on cradle-to-grave environmental impact

  ### How to Apply for BIS Certification (Step by Step)
  1. Visit manakonline.bis.gov.in and create an account
  2. Submit online application with required documents (test reports, factory details, quality control plan)
  3. BIS reviews the application and assigns an officer
  4. Factory/premises inspection by BIS officer
  5. Product samples drawn and tested at BIS-recognized laboratories
  6. If compliant, BIS grants the license/certificate
  7. Annual surveillance and periodic renewal required
  8. License can be suspended/cancelled for non-compliance

  ### BIS Standards
  - Over 22,000+ Indian Standards published
  - Covers sectors: Food, Electronics, Textiles, Civil Engineering, Chemicals, Mechanical, etc.
  - Standards are developed through Technical Committees with industry, government, and consumer representation
  - Standards can be purchased from bis.gov.in or read at BIS library
  - Indian Standards are designated as "IS" followed by a number (e.g., IS 10500 for drinking water)

  ### BIS Laboratories
  - BIS operates laboratories in: Mumbai, Kolkata, Chandigarh, Chennai, and Sahibabad
  - Testing for: Gold/silver, electronics, chemicals, food, textiles, mechanical products
  - Laboratories are NABL accredited
  - Testing services available for public and industry

  ### Consumer Affairs
  - Consumers can file complaints about sub-standard ISI marked products
  - Complaint portal: https://www.bis.gov.in/index.php/consumer-affairs/
  - BIS conducts market surveillance
  - Consumer awareness campaigns and workshops
  - Publications and newsletters for consumer education
  - World Standards Day celebrations
  - Collaboration with consumer organizations

  ### BIS Publications
  - BIS publishes Indian Standards, handbooks, and guidelines
  - Standards can be purchased online via bis.gov.in
  - Free access to some standards during special campaigns
  - Annual reports and newsletters available on website

  ### BIS Manak Online Portal (manakonline.bis.gov.in)
  - Online application for all certification schemes
  - Track application status
  - Pay fees online
  - Download certificates
  - Renewal of licenses

  ### BIS Act 2016
  - Replaced the Bureau of Indian Standards Act, 1986
  - Provides for establishment of BIS as national standards body
  - Provisions for mandatory standards and certification
  - Penalties for misuse of BIS marks
  - Enables hallmarking regulation
  `;

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
      if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

      // Build context-aware system prompt with optional topic filter, language, and simple mode
      let finalSystemPrompt = systemPrompt;
      if (topic_filter && topic_filter !== "all") {
        finalSystemPrompt += `\n\nIMPORTANT: The user has selected the "${topic_filter}" topic filter. Prioritize information related to "${topic_filter}" when answering. If the question doesn't relate to this filter, still answer if it's BIS-related.`;
      }

      if (simple_mode) {
        finalSystemPrompt += `\n\nCRITICAL - SIMPLE MODE ACTIVE: Explain EVERYTHING as if talking to a 10-year-old child. Rules:
  1. Use the SIMPLEST words possible. No jargon at all.
  2. Use fun analogies: "Think of ISI mark like a gold star your teacher gives — it means the product passed all the tests!"
  3. Use emojis to make it friendly: ✅ ⭐ 🏭 🔍 📋
  4. Short sentences only. Max 15 words per sentence.
  5. Give real examples from daily life (helmet, phone charger, water bottle).
  6. Instead of "BIS certification ensures conformity with Indian Standards" → "BIS checks if a product is safe and good. Like how a doctor checks if you're healthy! ✅"
  7. Instead of "Compulsory Registration Scheme" → "Some products MUST get tested before they can be sold. Like how you need a ticket to enter a movie! 🎫"
  8. For product safety questions, always include a simple checklist with emojis.
  9. End with a fun fact or tip when possible.`;
      }

      // Product Safety Checker enhancement
      finalSystemPrompt += `\n\n### PRODUCT SAFETY CHECKER
  When a user mentions a specific product (like "electric heater", "charger", "helmet", "water purifier", etc.) or asks about product safety:
  1. Identify if BIS certification is required (mandatory vs voluntary)
  2. List what marks/certifications to look for: ✔ ISI mark, ✔ certification number (CM/L-XXXXXXX), ✔ manufacturer name and address
  3. Explain safety risks of using uncertified products
  4. Provide a simple checklist the consumer can use while buying
  5. If the user uploaded an image, analyze visible marks and labels

  Format the checklist clearly:
  **🔍 What to check on your [product]:**
  ✔ ISI mark (look for the ISI logo)
  ✔ Certification number (starts with CM/L-)
  ✔ Manufacturer name & address
  ✔ MRP and manufacturing date
  ❌ Warning signs: No marks, peeling labels, suspiciously low price`;

      // Comparison table enhancement
      finalSystemPrompt += `\n\n### COMPARISON REQUESTS
  When asked to compare BIS schemes, standards, or certifications, ALWAYS respond with a well-formatted markdown table. Include columns like: Feature, Scheme 1, Scheme 2. Add a summary row at the bottom.`;

      const langMap: Record<string, string> = {
        hi: "Hindi", bn: "Bengali", ta: "Tamil", te: "Telugu", ur: "Urdu",
        ks: "Kashmiri", mr: "Marathi", gu: "Gujarati", kn: "Kannada",
        ml: "Malayalam", pa: "Punjabi"
      };
      if (language && language !== "en" && langMap[language]) {
        finalSystemPrompt += `\n\nIMPORTANT LANGUAGE INSTRUCTION: The user has selected ${langMap[language]} as their preferred language. You MUST respond in ${langMap[language]} script/language. Keep technical terms (like BIS, ISI, FMCS, CRS) in English but write the explanation in ${langMap[language]}. The ---SOURCES--- and ---SUGGESTIONS--- section markers must remain in English, but suggestion text should be in ${langMap[language]}.`;
      }

      // Convert messages to Gemini format
      const geminiContents = [
        { role: "user", parts: [{ text: finalSystemPrompt }] },
        { role: "model", parts: [{ text: "Understood. I'm the BIS Smart Assistant ready to help with BIS-related queries." }] },
      ];
      
      for (const msg of messages) {
        geminiContents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
        });
      }

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
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit reached. Please wait a moment and try again." }), {
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
      console.error("bis-chat error:", e);
      return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
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

