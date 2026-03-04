-- Fix RLS on players/coaches so inserts work during registration
-- Run in Supabase SQL Editor if you get "new row violates row-level security policy"

DROP POLICY IF EXISTS "Authenticated can manage players" ON players;
CREATE POLICY "Authenticated can manage players" ON players
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated can manage coaches" ON coaches;
CREATE POLICY "Authenticated can manage coaches" ON coaches
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
