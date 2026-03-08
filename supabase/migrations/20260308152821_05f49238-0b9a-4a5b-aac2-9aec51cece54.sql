
CREATE TABLE public.scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  product_name text,
  brand text,
  category text,
  risk_level text DEFAULT 'medium',
  summary text,
  certification_marks text[] DEFAULT '{}',
  safety_observations text[] DEFAULT '{}',
  recommendation text,
  analysis_json jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can read scan history"
ON public.scan_history FOR SELECT
USING (true);

-- Public insert access (no auth required for this public tool)
CREATE POLICY "Anyone can insert scan history"
ON public.scan_history FOR INSERT
WITH CHECK (true);
