
-- Create the knowledge chunks table for RAG pipeline
CREATE TABLE public.bis_knowledge_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  fts TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || content)) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GIN index for fast full-text search
CREATE INDEX idx_bis_chunks_fts ON public.bis_knowledge_chunks USING GIN (fts);

-- Index on content_type for filtering
CREATE INDEX idx_bis_chunks_content_type ON public.bis_knowledge_chunks (content_type);

-- Enable RLS
ALTER TABLE public.bis_knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Anyone can read chunks (public knowledge)
CREATE POLICY "Anyone can read knowledge chunks"
  ON public.bis_knowledge_chunks
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role can insert/update/delete (via edge functions)
CREATE POLICY "Service role can manage chunks"
  ON public.bis_knowledge_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create the search function
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
