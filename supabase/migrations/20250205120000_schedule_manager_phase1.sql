-- Schedule Manager Phase 1: Database & Absence Support
-- Run this migration on an existing DB that already has schema.sql applied.

-- =============================================
-- 1.1 Extend session_players for absences
-- =============================================
ALTER TABLE session_players
  ADD COLUMN IF NOT EXISTS absent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS absent_reason TEXT;

-- status: 'confirmed' | 'pending' | 'cancelled' | 'absent'
COMMENT ON COLUMN session_players.status IS 'confirmed, pending, cancelled, absent';

-- =============================================
-- 1.2 Schedule change requests & audit log
-- =============================================
CREATE TABLE IF NOT EXISTS schedule_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  proposer_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL CHECK (change_type IN (
    'move_time', 'change_court', 'cancel_session', 'add_session', 'remove_player', 'add_player'
  )),
  target_session_id UUID REFERENCES sessions(id) ON DELETE CASCADE, -- null for add_session
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'modified_approved')),
  proposed_payload JSONB,
  approved_payload JSONB,
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  reject_reason TEXT
);

CREATE TABLE IF NOT EXISTS schedule_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  change_request_id UUID REFERENCES schedule_change_requests(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  performed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_status ON schedule_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_proposer ON schedule_change_requests(proposer_id);
CREATE INDEX IF NOT EXISTS idx_schedule_change_requests_session ON schedule_change_requests(target_session_id);
CREATE INDEX IF NOT EXISTS idx_schedule_audit_log_request ON schedule_audit_log(change_request_id);

-- =============================================
-- 1.3 Master schedule (weekly template)
-- =============================================
CREATE TABLE IF NOT EXISTS master_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  session_type TEXT NOT NULL DEFAULT 'training' CHECK (session_type IN ('training', 'private', 'group', 'fitness', 'physio')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS master_schedule_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_schedule_id UUID NOT NULL REFERENCES master_schedule(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  UNIQUE(master_schedule_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_master_schedule_day ON master_schedule(day_of_week);
CREATE INDEX IF NOT EXISTS idx_master_schedule_players_slot ON master_schedule_players(master_schedule_id);
CREATE INDEX IF NOT EXISTS idx_master_schedule_players_player ON master_schedule_players(player_id);

-- =============================================
-- 1.4 RLS: Enable on new tables
-- =============================================
ALTER TABLE schedule_change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_schedule_players ENABLE ROW LEVEL SECURITY;

-- Schedule change requests: coaches can create; approvers (admin/coach) can list/update
CREATE POLICY "Authenticated can list change requests" ON schedule_change_requests
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Coaches and admin can create change requests" ON schedule_change_requests
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );
CREATE POLICY "Coaches and admin can update change requests" ON schedule_change_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Audit log: authenticated read; coaches/admin insert
CREATE POLICY "Authenticated can read audit log" ON schedule_audit_log
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Coaches and admin can insert audit log" ON schedule_audit_log
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Master schedule: coaches and admin full access
CREATE POLICY "Coaches and admin manage master_schedule" ON master_schedule
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );
CREATE POLICY "Coaches and admin manage master_schedule_players" ON master_schedule_players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- =============================================
-- 1.4 RLS: session_players — player can mark own absence only
-- =============================================
-- Drop the permissive policy so we can restrict player updates
DROP POLICY IF EXISTS "Allow all for authenticated users" ON session_players;

-- Everyone authenticated can read session_players (for schedule views)
CREATE POLICY "Authenticated can read session_players" ON session_players
  FOR SELECT USING (auth.role() = 'authenticated');

-- Coaches and admin can insert/delete (assign/unassign players to sessions)
CREATE POLICY "Coaches and admin can insert session_players" ON session_players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );
CREATE POLICY "Coaches and admin can delete session_players" ON session_players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Coaches and admin can update any row
CREATE POLICY "Coaches and admin can update session_players" ON session_players
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('coach', 'admin'))
  );

-- Players can update only their own row (to mark absent / set reason)
CREATE POLICY "Players can update own session_players" ON session_players
  FOR UPDATE USING (
    player_id = (SELECT player_id FROM user_profiles WHERE id = auth.uid())
  );
