-- RLS: Tighten policies on player-related tables
-- Coaches see only their assigned players; players see only their own data; admins see all.
-- Run after 20250211000000_player_database_schema.sql

-- Helper: check if the calling user may access a given player's data.
-- Admin: always. Player: only their own. Coach: via player_coach_assignments.
CREATE OR REPLACE FUNCTION public.can_access_player_rls(target_player_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = auth.uid()
    AND (
      up.role = 'admin'
      OR (up.role = 'player' AND up.player_id = target_player_id)
      OR (up.role = 'coach' AND EXISTS (
        SELECT 1 FROM player_coach_assignments pca
        WHERE pca.player_id = target_player_id AND pca.coach_id = up.coach_id
      ))
    )
  );
$$;

-- =============================================
-- PLAYERS
-- =============================================
DROP POLICY IF EXISTS "Allow all for authenticated users" ON players;
DROP POLICY IF EXISTS "Authenticated can manage players" ON players;

CREATE POLICY "Players select own or coached" ON players
  FOR SELECT USING (public.can_access_player_rls(id));

CREATE POLICY "Coaches and admin insert players" ON players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

CREATE POLICY "Players update own or coached" ON players
  FOR UPDATE USING (public.can_access_player_rls(id));

CREATE POLICY "Coaches and admin delete players" ON players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- =============================================
-- TRAINING_LOADS
-- =============================================
DROP POLICY IF EXISTS "Authenticated can manage training_loads" ON training_loads;

CREATE POLICY "Training loads access by player" ON training_loads
  FOR ALL USING (public.can_access_player_rls(player_id))
  WITH CHECK (public.can_access_player_rls(player_id));

-- =============================================
-- INJURIES
-- =============================================
DROP POLICY IF EXISTS "Authenticated can manage injuries" ON injuries;

CREATE POLICY "Injuries access by player" ON injuries
  FOR ALL USING (public.can_access_player_rls(player_id))
  WITH CHECK (public.can_access_player_rls(player_id));

-- =============================================
-- PLAYER_NOTES
-- =============================================
DROP POLICY IF EXISTS "Authenticated can manage player_notes" ON player_notes;

CREATE POLICY "Player notes access by player" ON player_notes
  FOR ALL USING (public.can_access_player_rls(player_id))
  WITH CHECK (public.can_access_player_rls(player_id));

-- =============================================
-- WHEREABOUTS
-- =============================================
DROP POLICY IF EXISTS "Authenticated can manage whereabouts" ON whereabouts;

CREATE POLICY "Whereabouts access by player" ON whereabouts
  FOR ALL USING (public.can_access_player_rls(player_id))
  WITH CHECK (public.can_access_player_rls(player_id));

-- =============================================
-- ATTENDANCE
-- =============================================
DROP POLICY IF EXISTS "Authenticated can manage attendance" ON attendance;

CREATE POLICY "Attendance access by player" ON attendance
  FOR ALL USING (public.can_access_player_rls(player_id))
  WITH CHECK (public.can_access_player_rls(player_id));

-- =============================================
-- UTR_HISTORY
-- =============================================
DROP POLICY IF EXISTS "Authenticated can manage utr_history" ON utr_history;

CREATE POLICY "Utr history access by player" ON utr_history
  FOR ALL USING (public.can_access_player_rls(player_id))
  WITH CHECK (public.can_access_player_rls(player_id));
