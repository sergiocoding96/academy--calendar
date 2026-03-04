-- Player Database Schema Migration
-- Aligns the actual Supabase DB with the TypeScript types in database.ts
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- =============================================
-- 1. PROFILES TABLE (person identity for coaches/staff)
-- The app joins players.coach_id -> profiles for coach name/avatar.
-- We create profiles from existing coaches data.
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'coach',
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Seed profiles from existing coaches
INSERT INTO profiles (id, email, full_name, role, phone, created_at)
SELECT id, email, name, 'coach', phone, created_at
FROM coaches
ON CONFLICT (id) DO NOTHING;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read profiles" ON profiles
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 2. EXTEND PLAYERS TABLE
-- Add columns the TypeScript types and UI expect.
-- =============================================
ALTER TABLE players ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS category TEXT; -- 'U10','U12','U14','U16','U18','Open','Adult'
ALTER TABLE players ADD COLUMN IF NOT EXISTS current_utr NUMERIC;
ALTER TABLE players ADD COLUMN IF NOT EXISTS utr_last_updated TIMESTAMPTZ;
ALTER TABLE players ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE players ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS parent_name TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS parent_phone TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS parent_email TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW());

-- Copy old columns into new ones (only where new columns are still NULL)
UPDATE players SET full_name = name WHERE full_name IS NULL AND name IS NOT NULL;
UPDATE players SET category = age_group WHERE category IS NULL AND age_group IS NOT NULL;
UPDATE players SET coach_id = primary_coach_id WHERE coach_id IS NULL AND primary_coach_id IS NOT NULL;
UPDATE players SET is_active = (COALESCE(status, 'active') = 'active') WHERE is_active IS NULL;

-- Ensure full_name is never null (it's required by the Player type)
UPDATE players SET full_name = COALESCE(full_name, name, 'Unknown') WHERE full_name IS NULL;

-- Index on coach_id for the join
CREATE INDEX IF NOT EXISTS idx_players_coach_id ON players(coach_id);

-- =============================================
-- 3. TRAINING LOADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS training_loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  rpe INTEGER NOT NULL CHECK (rpe >= 1 AND rpe <= 10),
  duration_minutes INTEGER,
  session_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_training_loads_player ON training_loads(player_id);
CREATE INDEX IF NOT EXISTS idx_training_loads_date ON training_loads(session_date);

ALTER TABLE training_loads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage training_loads" ON training_loads
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 4. INJURIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS injuries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  body_part TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'minor' CHECK (severity IN ('minor', 'moderate', 'severe')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'recovering', 'cleared')),
  injury_date DATE DEFAULT CURRENT_DATE,
  expected_return DATE,
  actual_return DATE,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_injuries_player ON injuries(player_id);
CREATE INDEX IF NOT EXISTS idx_injuries_status ON injuries(status);

ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage injuries" ON injuries
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 5. PLAYER NOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS player_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  category TEXT,
  is_ai_context BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_player_notes_player ON player_notes(player_id);

ALTER TABLE player_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage player_notes" ON player_notes
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 6. WHEREABOUTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS whereabouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  whereabouts_type TEXT NOT NULL CHECK (whereabouts_type IN ('tournament', 'holiday', 'camp', 'injured', 'other')),
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  affects_scheduling BOOLEAN DEFAULT TRUE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_whereabouts_player ON whereabouts(player_id);
CREATE INDEX IF NOT EXISTS idx_whereabouts_dates ON whereabouts(start_date, end_date);

ALTER TABLE whereabouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage whereabouts" ON whereabouts
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 7. ATTENDANCE TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused', 'tournament', 'injured', 'holiday')),
  notes TEXT,
  marked_by UUID,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_attendance_player ON attendance(player_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage attendance" ON attendance
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- 8. UTR HISTORY TABLE (if not already created)
-- =============================================
CREATE TABLE IF NOT EXISTS utr_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  utr_value NUMERIC NOT NULL,
  recorded_date DATE DEFAULT CURRENT_DATE,
  source TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);
CREATE INDEX IF NOT EXISTS idx_utr_history_player ON utr_history(player_id);

ALTER TABLE utr_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can manage utr_history" ON utr_history
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
