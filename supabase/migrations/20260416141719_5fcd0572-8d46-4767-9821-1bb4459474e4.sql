
DROP POLICY "Authenticated users can update alerts" ON public.alerts;
CREATE POLICY "Authenticated users can update alerts"
  ON public.alerts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY "Authenticated users can update incidents" ON public.incidents;
CREATE POLICY "Authenticated users can update incidents"
  ON public.incidents FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
