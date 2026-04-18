
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_to uuid;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);

-- Allow workers to see tasks assigned to them (in addition to existing owner policy)
DROP POLICY IF EXISTS "Workers view assigned tasks" ON public.tasks;
CREATE POLICY "Workers view assigned tasks"
ON public.tasks
FOR SELECT
TO authenticated
USING (auth.uid() = assigned_to);

-- Allow workers to update status of assigned tasks
DROP POLICY IF EXISTS "Workers update assigned tasks" ON public.tasks;
CREATE POLICY "Workers update assigned tasks"
ON public.tasks
FOR UPDATE
TO authenticated
USING (auth.uid() = assigned_to)
WITH CHECK (auth.uid() = assigned_to);

-- Allow supervisors to view all profiles (so they can pick workers + show names on tracking page)
DROP POLICY IF EXISTS "Authenticated can view profiles" ON public.profiles;
CREATE POLICY "Authenticated can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);
