-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to bis_knowledge_chunks
ALTER TABLE bis_knowledge_chunks 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS bis_knowledge_chunks_embedding_idx 
ON bis_knowledge_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function for semantic search using cosine similarity
CREATE OR REPLACE FUNCTION search_bis_chunks_semantic(
  query_embedding vector(768),
  match_count int DEFAULT 10,
  filter_type text DEFAULT NULL
)
RETURNS TABLE (
  id bigint,
  url text,
  title text,
  content_type text,
  content text,
  chunk_index int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bkc.id,
    bkc.url,
    bkc.title,
    bkc.content_type,
    bkc.content,
    bkc.chunk_index,
    1 - (bkc.embedding <=> query_embedding) as similarity
  FROM bis_knowledge_chunks bkc
  WHERE 
    bkc.embedding IS NOT NULL
    AND (filter_type IS NULL OR bkc.content_type = filter_type)
  ORDER BY bkc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Hybrid search with Reciprocal Rank Fusion (RRF)
CREATE OR REPLACE FUNCTION search_bis_chunks_hybrid(
  search_query text,
  query_embedding vector(768),
  match_count int DEFAULT 10,
  filter_type text DEFAULT NULL,
  rrf_k int DEFAULT 60
)
RETURNS TABLE (
  id bigint,
  url text,
  title text,
  content_type text,
  content text,
  chunk_index int,
  fts_rank float,
  semantic_rank float,
  rrf_score float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH fts_results AS (
    SELECT
      bkc.id,
      bkc.url,
      bkc.title,
      bkc.content_type,
      bkc.content,
      bkc.chunk_index,
      ts_rank(to_tsvector('english', bkc.content), websearch_to_tsquery('english', search_query)) as rank,
      ROW_NUMBER() OVER (ORDER BY ts_rank(to_tsvector('english', bkc.content), websearch_to_tsquery('english', search_query)) DESC) as fts_rank_position
    FROM bis_knowledge_chunks bkc
    WHERE 
      to_tsvector('english', bkc.content) @@ websearch_to_tsquery('english', search_query)
      AND (filter_type IS NULL OR bkc.content_type = filter_type)
    ORDER BY rank DESC
    LIMIT match_count * 2
  ),
  semantic_results AS (
    SELECT
      bkc.id,
      bkc.url,
      bkc.title,
      bkc.content_type,
      bkc.content,
      bkc.chunk_index,
      1 - (bkc.embedding <=> query_embedding) as similarity,
      ROW_NUMBER() OVER (ORDER BY bkc.embedding <=> query_embedding) as semantic_rank_position
    FROM bis_knowledge_chunks bkc
    WHERE 
      bkc.embedding IS NOT NULL
      AND (filter_type IS NULL OR bkc.content_type = filter_type)
    ORDER BY bkc.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  combined_results AS (
    SELECT
      COALESCE(fts.id, sem.id) as id,
      COALESCE(fts.url, sem.url) as url,
      COALESCE(fts.title, sem.title) as title,
      COALESCE(fts.content_type, sem.content_type) as content_type,
      COALESCE(fts.content, sem.content) as content,
      COALESCE(fts.chunk_index, sem.chunk_index) as chunk_index,
      COALESCE(fts.rank, 0) as fts_rank,
      COALESCE(sem.similarity, 0) as semantic_rank,
      -- RRF formula: 1 / (k + rank_position)
      COALESCE(1.0 / (rrf_k + fts.fts_rank_position), 0.0) + 
      COALESCE(1.0 / (rrf_k + sem.semantic_rank_position), 0.0) as rrf_score
    FROM fts_results fts
    FULL OUTER JOIN semantic_results sem ON fts.id = sem.id
  )
  SELECT
    cr.id,
    cr.url,
    cr.title,
    cr.content_type,
    cr.content,
    cr.chunk_index,
    cr.fts_rank,
    cr.semantic_rank,
    cr.rrf_score
  FROM combined_results cr
  ORDER BY cr.rrf_score DESC
  LIMIT match_count;
END;
$$;
