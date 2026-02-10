-- Academy auth tables: players, coaches, user_profiles
-- Run in Supabase SQL Editor if not using CLI, so sign-up and login work.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PLAYERS TABLE (app expects name + email)
-- =============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  email TEXT,
  age_group TEXT,
  gender TEXT,
  ranking TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT
);

-- Ensure email column exists (if players was created from an older schema)
ALTER TABLE players ADD COLUMN IF NOT EXISTS email TEXT;

-- =============================================
-- COACHES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  specializations TEXT[],
  color_code TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active'
);

-- =============================================
-- USER PROFILES (links auth.users to players/coaches)
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
    (role = 'admin' AND player_id IS NULL AND coach_id IS NULL)
  )
);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow any signed-in user to insert/read/update (for registration and app)
-- auth.uid() IS NOT NULL is the reliable check for "logged in" in Supabase
CREATE POLICY "Authenticated can manage players" ON players
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can manage coaches" ON coaches
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow insert during registration" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_player ON user_profiles(player_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_coach ON user_profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
