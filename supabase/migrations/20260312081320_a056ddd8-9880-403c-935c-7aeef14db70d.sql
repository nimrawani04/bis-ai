
-- Fix search function with immutable search path
CREATE OR REPLACE FUNCTION public.search_bis_chunks(
  search_query TEXT,
  match_count INTEGER DEFAULT 5,
  filter_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  url TEXT,
  title TEXT,
  content_type TEXT,
  content TEXT,
  chunk_index INTEGER,
  rank REAL
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.url,
    c.title,
    c.content_type,
    c.content,
    c.chunk_index,
    ts_rank(c.fts, websearch_to_tsquery('english', search_query)) AS rank
  FROM public.bis_knowledge_chunks c
  WHERE c.fts @@ websearch_to_tsquery('english', search_query)
    AND (filter_type IS NULL OR c.content_type = filter_type)
  ORDER BY rank DESC
  LIMIT match_count;
$$;
