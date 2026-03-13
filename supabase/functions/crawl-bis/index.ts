import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Key BIS pages to scrape for the knowledge base
const BIS_URLS = [
  "https://www.bis.gov.in/about-bis/",
  "https://www.bis.gov.in/about-bis/organization/",
  "https://www.bis.gov.in/about-bis/vision-mission/",
  "https://www.bis.gov.in/product-certification/",
  "https://www.bis.gov.in/product-certification/isi-mark-scheme/",
  "https://www.bis.gov.in/product-certification/compulsory-registration-scheme/",
  "https://www.bis.gov.in/product-certification/foreign-manufacturers-certification-scheme-fmcs/",
  "https://www.bis.gov.in/product-certification/eco-mark-scheme/",
  "https://www.bis.gov.in/hallmarking/",
  "https://www.bis.gov.in/hallmarking/hallmarking-overview/",
  "https://www.bis.gov.in/hallmarking/hallmarking-of-gold-jewellery/",
  "https://www.bis.gov.in/hallmarking/hallmarking-of-silver-jewellery/",
  "https://www.bis.gov.in/hallmarking/huid/",
  "https://www.bis.gov.in/standardization/",
  "https://www.bis.gov.in/standardization/how-standards-are-formulated/",
  "https://www.bis.gov.in/standardization/national-standards-body/",
  "https://www.bis.gov.in/management-system-certification/",
  "https://www.bis.gov.in/laboratory-services/",
  "https://www.bis.gov.in/consumer-affairs/",
  "https://www.bis.gov.in/consumer-affairs/lodge-complaint/",
  "https://www.bis.gov.in/consumer-affairs/consumer-engagement/",
  "https://www.bis.gov.in/bis-care-app/",
  "https://www.bis.gov.in/standardization/indian-standards/",
  "https://www.bis.gov.in/product-certification/mandatory-certification/",
];

// Map URL to content_type for categorization
function getContentType(url: string): string {
  if (url.includes("hallmark")) return "hallmarking";
  if (url.includes("product-certification") || url.includes("isi-mark") || url.includes("fmcs") || url.includes("eco-mark") || url.includes("mandatory-certification")) return "certification";
  if (url.includes("standard")) return "standards";
  if (url.includes("consumer") || url.includes("complaint") || url.includes("bis-care")) return "consumer";
  if (url.includes("laboratory")) return "laboratory";
  if (url.includes("management-system")) return "management";
  if (url.includes("about-bis") || url.includes("organization") || url.includes("vision")) return "about";
  return "general";
}

/**
 * Chunk text into ~500-token overlapping passages.
 */
function chunkText(text: string, maxTokens = 500, overlap = 50): string[] {
  const lines = text.split('\n');
  const chunks: string[] = [];
  let currentChunk: string[] = [];
  let currentLength = 0;
  let lastHeading = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#') || (trimmed.startsWith('**') && trimmed.endsWith('**'))) {
      lastHeading = trimmed;
    }

    const lineTokens = trimmed.split(/\s+/).length;

    if (currentLength + lineTokens > maxTokens && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));

      const overlapLines: string[] = [];
      let overlapLen = 0;
      for (let i = currentChunk.length - 1; i >= 0 && overlapLen < overlap; i--) {
        overlapLines.unshift(currentChunk[i]);
        overlapLen += currentChunk[i].split(/\s+/).length;
      }

      currentChunk = lastHeading ? [lastHeading, ...overlapLines] : [...overlapLines];
      currentLength = currentChunk.reduce((s, l) => s + l.split(/\s+/).length, 0);
    }

    currentChunk.push(trimmed);
    currentLength += lineTokens;
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) {
      return new Response(JSON.stringify({ error: "Firecrawl connector not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Accept optional custom URLs from request body
    let urlsToScrape = BIS_URLS;
    try {
      const body = await req.json();
      if (body?.urls && Array.isArray(body.urls) && body.urls.length > 0) {
        urlsToScrape = body.urls;
      }
    } catch {
      // No body or invalid JSON — use defaults
    }

    const results: { url: string; status: string; chunks?: number; error?: string }[] = [];
    let totalChunks = 0;

    for (const url of urlsToScrape) {
      try {
        console.log(`Scraping: ${url}`);

        const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
            onlyMainContent: true,
            waitFor: 3000,
          }),
        });

        const scrapeData = await scrapeRes.json();

        if (!scrapeRes.ok || !scrapeData.success) {
          console.error(`Failed to scrape ${url}:`, scrapeData);
          results.push({ url, status: "failed", error: scrapeData.error || `HTTP ${scrapeRes.status}` });
          continue;
        }

        const markdown = scrapeData.data?.markdown || scrapeData.markdown || "";
        const title = scrapeData.data?.metadata?.title || scrapeData.metadata?.title || url;

        if (!markdown || markdown.length < 50) {
          results.push({ url, status: "skipped", error: "Content too short" });
          continue;
        }

        // Chunk the content
        const chunks = chunkText(markdown);
        const contentType = getContentType(url);

        const rows = chunks.map((chunk, index) => ({
          url,
          title,
          content_type: contentType,
          content: chunk,
          chunk_index: index,
        }));

        // Delete existing chunks for this URL to avoid duplicates
        await supabase
          .from("bis_knowledge_chunks")
          .delete()
          .eq("url", url);

        const { error: insertError } = await supabase
          .from("bis_knowledge_chunks")
          .insert(rows);

        if (insertError) {
          console.error(`Insert error for ${url}:`, insertError);
          results.push({ url, status: "failed", error: insertError.message });
          continue;
        }

        totalChunks += chunks.length;
        results.push({ url, status: "success", chunks: chunks.length });
        console.log(`✓ ${url} → ${chunks.length} chunks`);
      } catch (err) {
        console.error(`Error processing ${url}:`, err);
        results.push({ url, status: "failed", error: err instanceof Error ? err.message : "Unknown" });
      }

      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 1000));
    }

    return new Response(JSON.stringify({
      success: true,
      total_chunks: totalChunks,
      pages_processed: results.length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("crawl-bis error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
