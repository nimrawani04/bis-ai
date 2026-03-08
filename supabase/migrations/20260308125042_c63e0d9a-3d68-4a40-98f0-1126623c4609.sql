
CREATE TABLE public.safety_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  category TEXT NOT NULL,
  affected_products TEXT,
  source TEXT,
  alert_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read safety alerts"
  ON public.safety_alerts FOR SELECT
  TO anon, authenticated
  USING (true);
