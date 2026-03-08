
-- Create a public storage bucket for product verification images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload images (no auth required for this public tool)
CREATE POLICY "Anyone can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- Allow anyone to read product images
CREATE POLICY "Anyone can read product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');
