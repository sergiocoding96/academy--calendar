-- Create goals, goal_progress, and fitness_logs tables
-- These tables support the player dashboard fitness/goals features.

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
  target_unit TEXT,
  current_value NUMERIC DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- GOAL PROGRESS TABLE
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
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_goals_player ON goals(player_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_player ON fitness_logs(player_id);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_date ON fitness_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_fitness_logs_category ON fitness_logs(category);

-- =============================================
-- RLS
-- =============================================
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;

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

-- Goal Progress: Same access as the parent goal
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

-- Fitness Logs: Players manage own, coaches can view assigned players
CREATE POLICY "Players view own fitness logs" ON fitness_logs
  FOR SELECT USING (
    player_id IN (SELECT player_id FROM user_profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM player_coach_assignments pca
      JOIN user_profiles up ON up.coach_id = pca.coach_id
      WHERE up.id = auth.uid() AND pca.player_id = fitness_logs.player_id
    )
  );
CREATE POLICY "Players manage own fitness logs" ON fitness_logs
  FOR ALL USING (
    player_id IN (SELECT player_id FROM user_profiles WHERE id = auth.uid())
  );
