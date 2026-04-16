
-- sensor_data table
CREATE TABLE public.sensor_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  gas_level NUMERIC NOT NULL,
  oxygen_level NUMERIC NOT NULL,
  temperature NUMERIC NOT NULL,
  worker_id TEXT DEFAULT 'W-001',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read sensor data"
  ON public.sensor_data FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sensor data"
  ON public.sensor_data FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  message TEXT NOT NULL,
  location TEXT DEFAULT 'Solapur Zone 1',
  risk TEXT NOT NULL DEFAULT 'SAFE',
  type TEXT DEFAULT 'system',
  worker_name TEXT DEFAULT 'Rajesh Kumar',
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read alerts"
  ON public.alerts FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert alerts"
  ON public.alerts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update alerts"
  ON public.alerts FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'SOS',
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  description TEXT,
  worker_name TEXT DEFAULT 'Rajesh Kumar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read incidents"
  ON public.incidents FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert incidents"
  ON public.incidents FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update incidents"
  ON public.incidents FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'supervisor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for sensor_data and alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
