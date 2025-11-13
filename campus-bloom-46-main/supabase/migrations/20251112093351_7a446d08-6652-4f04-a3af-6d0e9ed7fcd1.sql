-- Drop policies that depend on coordinator_id first
DROP POLICY IF EXISTS "Coordinators can create events" ON public.events;
DROP POLICY IF EXISTS "Coordinators can update own events" ON public.events;
DROP POLICY IF EXISTS "Coordinators can delete own events" ON public.events;

-- Drop results table as it's not needed
DROP TABLE IF EXISTS public.results CASCADE;

-- Now we can safely drop the columns
ALTER TABLE public.events DROP COLUMN IF EXISTS coordinator_id;
ALTER TABLE public.events DROP COLUMN IF EXISTS max_participants;

-- Create simpler policies - anyone authenticated can create/manage events
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (true);