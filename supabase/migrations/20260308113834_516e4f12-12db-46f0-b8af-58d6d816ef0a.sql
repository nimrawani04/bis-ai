-- Create product_reports table
CREATE TABLE public.product_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  purchase_place TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reports ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a report (anonymous reporting)
CREATE POLICY "Anyone can submit reports"
  ON public.product_reports FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read reports (for transparency / dashboard)
CREATE POLICY "Anyone can read reports"
  ON public.product_reports FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create storage bucket for report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-photos', 'report-photos', true);

-- Anyone can upload report photos
CREATE POLICY "Anyone can upload report photos"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'report-photos');

-- Anyone can view report photos
CREATE POLICY "Anyone can view report photos"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'report-photos');