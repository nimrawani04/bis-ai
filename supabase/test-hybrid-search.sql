-- Test script for hybrid search functionality
-- Run this after applying the migration and ingesting some data with embeddings

-- 1. Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 2. Check table structure
\d bis_knowledge_chunks

-- 3. Count total chunks and chunks with embeddings
SELECT 
  COUNT(*) as total_chunks,
  COUNT(embedding) as chunks_with_embeddings,
  COUNT(*) - COUNT(embedding) as chunks_without_embeddings
FROM bis_knowledge_chunks;

-- 4. Sample embedding dimensions (should be 768)
SELECT 
  id, 
  title,
  array_length(embedding::float[], 1) as embedding_dimensions
FROM bis_knowledge_chunks 
WHERE embedding IS NOT NULL 
LIMIT 5;

-- 5. Test FTS search function (existing)
SELECT 
  id, 
  title, 
  LEFT(content, 100) as content_preview,
  rank
FROM search_bis_chunks('BIS standards', 5, NULL);

-- 6. Test semantic search function (new)
-- Note: You need to provide an actual embedding vector here
-- This is just a placeholder to show the function signature
-- SELECT * FROM search_bis_chunks_semantic(
--   '[0.1, 0.2, ...]'::vector(768),
--   5,
--   NULL
-- );

-- 7. Test hybrid search function (new)
-- Note: You need to provide an actual embedding vector here
-- This is just a placeholder to show the function signature
-- SELECT 
--   id,
--   title,
--   LEFT(content, 100) as content_preview,
--   fts_rank,
--   semantic_rank,
--   rrf_score
-- FROM search_bis_chunks_hybrid(
--   'BIS standards',
--   '[0.1, 0.2, ...]'::vector(768),
--   10,
--   NULL,
--   60
-- );

-- 8. Check index on embedding column
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'bis_knowledge_chunks' 
  AND indexname LIKE '%embedding%';

-- 9. Sample query to see RRF scoring in action (conceptual)
-- This shows how different ranking methods might produce different results
WITH sample_query AS (
  SELECT 'BIS certification process' as query_text
)
SELECT 
  'FTS would rank by keyword match' as method,
  'Semantic would rank by meaning similarity' as note,
  'RRF combines both for best results' as benefit;

-- 10. Performance check - count chunks by content type
SELECT 
  content_type,
  COUNT(*) as chunk_count,
  COUNT(embedding) as with_embeddings,
  ROUND(100.0 * COUNT(embedding) / COUNT(*), 2) as embedding_coverage_pct
FROM bis_knowledge_chunks
GROUP BY content_type
ORDER BY chunk_count DESC;
