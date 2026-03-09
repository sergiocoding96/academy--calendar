-- Performance indexes for frequently queried tables

-- Session players: frequently queried by session_id and (session_id, player_id)
CREATE INDEX IF NOT EXISTS idx_session_players_session_id ON session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_session_players_session_player ON session_players(session_id, player_id);

-- Attendance: frequently queried by (player_id, attendance_date)
CREATE INDEX IF NOT EXISTS idx_attendance_player_date ON attendance(player_id, attendance_date);

-- Player coach assignments: used in RLS function can_access_player_rls()
CREATE INDEX IF NOT EXISTS idx_player_coach_assignments_coach_player ON player_coach_assignments(coach_id, player_id);

-- Sessions: frequently filtered by date and coach_id
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_coach_date ON sessions(coach_id, date);

-- Schedule change requests: filtered by status
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON schedule_change_requests(status);
