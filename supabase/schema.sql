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
