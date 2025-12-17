-- SotoTennis Academy Database Schema
-- Run this SQL in Supabase SQL Editor to create the tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PLAYERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  age_group TEXT, -- 'U10', 'U12', 'U14', 'U16', 'U18', 'Adult'
  gender TEXT, -- 'M', 'F'
  ranking TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'trial'
  notes TEXT
);

-- =============================================
-- COACHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  role TEXT, -- 'Head Coach', 'Coach', 'Assistant', 'S&C', 'Physio'
  specializations TEXT[],
  color_code TEXT, -- Hex color for calendar display
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active'
);

-- =============================================
-- COURTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  surface_type TEXT NOT NULL, -- 'Hard', 'Clay', 'Grass'
  location TEXT,
  status TEXT DEFAULT 'active'
);

-- =============================================
-- SESSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  session_type TEXT DEFAULT 'training', -- 'training', 'private', 'group', 'fitness', 'physio'
  notes TEXT,
  is_private BOOLEAN DEFAULT FALSE
);

-- =============================================
-- SESSION_PLAYERS TABLE (Many-to-Many)
-- =============================================
CREATE TABLE IF NOT EXISTS session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed', -- 'confirmed', 'pending', 'cancelled'
  UNIQUE(session_id, player_id)
);

-- =============================================
-- TOURNAMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT NOT NULL, -- 'U10', 'U12', 'U14', 'U16', 'U18', 'Adults'
  level TEXT, -- 'ITF J100', 'ITF J60', 'TE Cat 1', 'Regional', etc.
  entry_deadline DATE,
  zone INTEGER, -- 1-4 for travel distance categorization
  tournament_type TEXT DEFAULT 'proximity', -- 'proximity', 'national', 'international'
  notes TEXT,
  status TEXT DEFAULT 'upcoming' -- 'upcoming', 'ongoing', 'completed', 'cancelled'
);

-- =============================================
-- TOURNAMENT_ASSIGNMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS tournament_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player', -- 'player', 'coach', 'trip_manager'
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'withdrawn'
  CONSTRAINT at_least_one_person CHECK (player_id IS NOT NULL OR coach_id IS NOT NULL)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_coach ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_court ON sessions(court_id);
CREATE INDEX IF NOT EXISTS idx_session_players_session ON session_players(session_id);
CREATE INDEX IF NOT EXISTS idx_session_players_player ON session_players(player_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_dates ON tournaments(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_category ON tournaments(category);
CREATE INDEX IF NOT EXISTS idx_tournament_assignments_tournament ON tournament_assignments(tournament_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (adjust as needed)
-- For now, allow all operations for authenticated users

CREATE POLICY "Allow all for authenticated users" ON players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON coaches
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON courts
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON session_players
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON tournaments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON tournament_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- =============================================
-- SEED DATA: COURTS
-- =============================================
INSERT INTO courts (name, surface_type, location) VALUES
  ('HC 1', 'Hard', 'Main Complex'),
  ('HC 2', 'Hard', 'Main Complex'),
  ('Clay 1', 'Clay', 'Clay Courts Area'),
  ('Clay 2', 'Clay', 'Clay Courts Area'),
  ('Clay 3', 'Clay', 'Clay Courts Area'),
  ('HC 3', 'Hard', 'Main Complex')
ON CONFLICT DO NOTHING;

-- =============================================
-- SEED DATA: COACHES
-- =============================================
INSERT INTO coaches (name, role, color_code) VALUES
  ('Tom P', 'Head Coach', '#3B82F6'),
  ('Andris', 'Coach', '#22C55E'),
  ('Tomy', 'Coach', '#A855F7'),
  ('Sergio', 'Coach', '#EF4444'),
  ('DK', 'Head Coach', '#F97316'),
  ('Joe D', 'Coach', '#14B8A6'),
  ('Mike D', 'Coach', '#6366F1'),
  ('Reece', 'Coach', '#EC4899'),
  ('Billy', 'S&C', '#EAB308'),
  ('Kate', 'S&C', '#06B6D4'),
  ('Sophie', 'Coach', '#F43F5E')
ON CONFLICT DO NOTHING;

-- =============================================
-- USER PROFILES TABLE (Links Supabase Auth to app roles)
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('player', 'coach', 'admin')),
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  avatar_url TEXT,
  CONSTRAINT valid_role_assignment CHECK (
    (role = 'player' AND player_id IS NOT NULL AND coach_id IS NULL) OR
    (role = 'coach' AND coach_id IS NOT NULL AND player_id IS NULL) OR
    (role = 'admin')
  )
);

-- =============================================
-- PLAYER-COACH ASSIGNMENTS (Primary Coach per Player)
-- =============================================
CREATE TABLE IF NOT EXISTS player_coach_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(player_id, coach_id)
);

-- Ensure only one primary coach per player
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_primary_coach
  ON player_coach_assignments(player_id) WHERE is_primary = true;

-- =============================================
-- GOALS TABLE (Practice & Fitness Goals)
-- =============================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('practice', 'strength', 'conditioning', 'flexibility')),
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC,
  target_unit TEXT, -- 'reps', 'kg', 'minutes', 'meters', etc.
  current_value NUMERIC DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- GOAL PROGRESS TABLE (Track progress over time)
-- =============================================
CREATE TABLE IF NOT EXISTS goal_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  value NUMERIC NOT NULL,
  notes TEXT
);

-- =============================================
-- SESSION RATINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS session_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  rated_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  effort_rating INTEGER CHECK (effort_rating >= 1 AND effort_rating <= 5),
  technique_rating INTEGER CHECK (technique_rating >= 1 AND technique_rating <= 5),
  attitude_rating INTEGER CHECK (attitude_rating >= 1 AND attitude_rating <= 5),
  tactical_rating INTEGER CHECK (tactical_rating >= 1 AND tactical_rating <= 5),
  notes TEXT,
  duration_minutes INTEGER,
  intensity_level INTEGER CHECK (intensity_level >= 1 AND intensity_level <= 10),
  UNIQUE(session_id, player_id)
);

-- =============================================
-- MATCH RESULTS TABLE (Tournament Matches)
-- =============================================
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  opponent_name TEXT NOT NULL,
  opponent_ranking TEXT,
  round TEXT, -- 'R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F'
  match_date DATE NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'walkover', 'retired')),
  score TEXT NOT NULL,
  first_serve_pct NUMERIC,
  aces INTEGER DEFAULT 0,
  double_faults INTEGER DEFAULT 0,
  winners INTEGER DEFAULT 0,
  unforced_errors INTEGER DEFAULT 0,
  break_points_won INTEGER DEFAULT 0,
  break_points_faced INTEGER DEFAULT 0,
  holds INTEGER DEFAULT 0,
  breaks INTEGER DEFAULT 0,
  notes TEXT,
  match_type TEXT DEFAULT 'singles' CHECK (match_type IN ('singles', 'doubles'))
);

-- =============================================
-- FITNESS LOGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS fitness_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('strength', 'conditioning', 'flexibility', 'mobility')),
  exercise_name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight_kg NUMERIC,
  duration_seconds INTEGER,
  distance_meters NUMERIC,
  notes TEXT,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10)
);

-- =============================================
-- ADD PRIMARY COACH TO PLAYERS TABLE
-- =============================================
ALTER TABLE players ADD COLUMN IF NOT EXISTS primary_coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL;

-- =============================================
-- INDEXES FOR NEW TABLES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_player ON user_profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_coach ON user_profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_goals_player ON goals(player_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_session_ratings_session ON session_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_ratings_player ON session_ratings(player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_player ON match_results(player_id);
CREATE INDEX IF NOT EXISTS idx_match_results_tournament ON match_results(tournament_id);
CREATE INDEX IF NOT EXISTS idx_match_results_date ON match_results(match_date);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_player ON fitness_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_date ON fitness_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_category ON fitness_logs(category);
CREATE INDEX IF NOT EXISTS idx_player_coach_assignments_coach ON player_coach_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_player_coach_assignments_player ON player_coach_assignments(player_id);

-- =============================================
-- RLS FOR NEW TABLES
-- =============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_coach_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert during registration" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Player Coach Assignments: Allow all for authenticated users (for now)
CREATE POLICY "Allow all for authenticated users" ON player_coach_assignments
  FOR ALL USING (true) WITH CHECK (true);

-- Goals: Players see own, Coaches see assigned players
CREATE POLICY "Players view own goals" ON goals
  FOR SELECT USING (
    player_id IN (SELECT player_id FROM user_profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM player_coach_assignments pca
      JOIN user_profiles up ON up.coach_id = pca.coach_id
      WHERE up.id = auth.uid() AND pca.player_id = goals.player_id
    )
  );
CREATE POLICY "Players manage own goals" ON goals
  FOR ALL USING (
    player_id IN (SELECT player_id FROM user_profiles WHERE id = auth.uid())
  );

-- Goal Progress: Same as goals
CREATE POLICY "View goal progress" ON goal_progress
  FOR SELECT USING (
    goal_id IN (
      SELECT g.id FROM goals g
      WHERE g.player_id IN (SELECT player_id FROM user_profiles WHERE id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM player_coach_assignments pca
        JOIN user_profiles up ON up.coach_id = pca.coach_id
        WHERE up.id = auth.uid() AND pca.player_id = g.player_id
      )
    )
  );
CREATE POLICY "Manage own goal progress" ON goal_progress
  FOR ALL USING (
    goal_id IN (SELECT id FROM goals WHERE player_id IN (SELECT player_id FROM user_profiles WHERE id = auth.uid()))
  );

-- Session Ratings: Allow all for authenticated users (for now)
CREATE POLICY "Allow all for authenticated users" ON session_ratings
  FOR ALL USING (true) WITH CHECK (true);

-- Match Results: Allow all for authenticated users (for now)
CREATE POLICY "Allow all for authenticated users" ON match_results
  FOR ALL USING (true) WITH CHECK (true);

-- Fitness Logs: Allow all for authenticated users (for now)
CREATE POLICY "Allow all for authenticated users" ON fitness_logs
  FOR ALL USING (true) WITH CHECK (true);
