-- Health data table for worker health snapshots
CREATE TABLE public.health_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  age INTEGER,
  blood_group TEXT,
  allergies TEXT,
  conditions TEXT,
  emergency_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.health_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own health data"
ON public.health_data FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can view health data"
ON public.health_data FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Users insert own health data"
ON public.health_data FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own health data"
ON public.health_data FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_health_data_updated_at
BEFORE UPDATE ON public.health_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();