
-- Drop the overly permissive insert policy and replace with a constrained one
DROP POLICY IF EXISTS "Anyone can upload product images" ON storage.objects;

CREATE POLICY "Anyone can upload product images with constraints"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'jpeg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'webp')
);
