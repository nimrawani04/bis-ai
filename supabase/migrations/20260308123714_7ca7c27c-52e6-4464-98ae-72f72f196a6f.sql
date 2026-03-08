
-- Create product_reviews table for community trust scores
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL,
  reviewer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_complaint BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can submit reviews (anonymous)
CREATE POLICY "Anyone can submit reviews"
  ON public.product_reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Anyone can read reviews
CREATE POLICY "Anyone can read reviews"
  ON public.product_reviews FOR SELECT
  TO anon, authenticated
  USING (true);
