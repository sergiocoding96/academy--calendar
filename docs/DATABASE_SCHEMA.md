# Academy Calendar - Database Schema

> **Complete Supabase PostgreSQL Schema**
> All tables, relationships, and RLS policies

---

## Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   players   │────<│training_loads│     │   coaches   │
└──────┬──────┘     └─────────────┘     └──────┬──────┘
       │                                        │
       │            ┌─────────────┐            │
       ├───────────<│  injuries   │            │
       │            └─────────────┘            │
       │                                        │
       │            ┌─────────────┐            │
       ├───────────<│player_notes │            │
       │            └─────────────┘            │
       │                                        │
       │            ┌─────────────┐            │
       ├───────────<│ whereabouts │            │
       │            └─────────────┘            │
       │                                        │
       │            ┌─────────────┐            │
       ├───────────<│ attendance  │            │
       │            └─────────────┘            │
       │                                        │
       │     ┌──────────────────────────┐      │
       └────>│    schedule_sessions     │<─────┘
             └──────────────────────────┘
                         │
                         ▼
             ┌──────────────────────────┐
             │ schedule_change_requests │
             └──────────────────────────┘
```

---

## Core Tables

### users (Supabase Auth)
```sql
-- Managed by Supabase Auth
-- Extended with profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'coach', 'player', 'parent')),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### players
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id), -- If player has login
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  coach_id UUID REFERENCES profiles(id),
  current_utr DECIMAL(4,2),
  category TEXT, -- 'U12', 'U14', 'U16', 'U18', 'Open'
  profile_photo_url TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_players_coach ON players(coach_id);
CREATE INDEX idx_players_category ON players(category);
```

### training_loads
```sql
CREATE TABLE training_loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  perceived_effort INTEGER CHECK (perceived_effort BETWEEN 1 AND 10), -- RPE
  duration_minutes INTEGER,
  session_type TEXT, -- 'tennis', 'fitness', 'match', 'recovery'
  session_id UUID REFERENCES schedule_sessions(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(player_id, date, session_type) -- One entry per session type per day
);

CREATE INDEX idx_training_loads_player_date ON training_loads(player_id, date);
```

### injuries
```sql
CREATE TABLE injuries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  body_part TEXT NOT NULL,
  side TEXT CHECK (side IN ('left', 'right', 'both', 'n/a')),
  injury_type TEXT, -- 'strain', 'sprain', 'fracture', 'tendinitis', 'other'
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'severe')),
  description TEXT,
  date_occurred DATE,
  date_reported DATE DEFAULT CURRENT_DATE,
  expected_return DATE,
  actual_return DATE,
  status TEXT CHECK (status IN ('active', 'recovering', 'cleared')) DEFAULT 'active',
  treatment_notes TEXT,
  reported_by UUID REFERENCES profiles(id),
  cleared_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_injuries_player_status ON injuries(player_id, status);
```

### player_notes
```sql
CREATE TABLE player_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  note_type TEXT CHECK (note_type IN (
    'availability',  -- "Not available before 2 PM"
    'preference',    -- "Prefers clay courts"
    'medical',       -- "Allergic to..."
    'strategic',     -- "Focus on serve development"
    'personal',      -- "Has exams next week"
    'other'
  )),
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  valid_from DATE,
  valid_until DATE, -- NULL = indefinite
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_player_notes_player_active ON player_notes(player_id, is_active);
```

### whereabouts
```sql
CREATE TABLE whereabouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  event_type TEXT CHECK (event_type IN ('tournament', 'holiday', 'camp', 'sick', 'other')),
  event_name TEXT,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  affects_schedule BOOLEAN DEFAULT TRUE, -- Should this block training?
  status TEXT CHECK (status IN ('planned', 'confirmed', 'completed', 'cancelled')) DEFAULT 'planned',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),

  CHECK (end_date >= start_date)
);

CREATE INDEX idx_whereabouts_player_dates ON whereabouts(player_id, start_date, end_date);
```

### utr_history
```sql
CREATE TABLE utr_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  utr_value DECIMAL(4,2) NOT NULL,
  utr_type TEXT CHECK (utr_type IN ('singles', 'doubles')) DEFAULT 'singles',
  recorded_date DATE DEFAULT CURRENT_DATE,
  source TEXT CHECK (source IN ('official', 'manual', 'api')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_utr_history_player_date ON utr_history(player_id, recorded_date DESC);
```

### attendance
```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  session_id UUID REFERENCES schedule_sessions(id),
  status TEXT CHECK (status IN (
    'present',
    'absent_excused',
    'absent_unexcused',
    'late',
    'tournament',
    'holiday',
    'injured'
  )),
  reason TEXT,
  marked_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(player_id, session_id)
);

CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_player ON attendance(player_id);
```

---

## Schedule Tables

### master_schedule
```sql
CREATE TABLE master_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT CHECK (session_type IN ('individual', 'dual', 'group')),
  session_name TEXT, -- 'Group A', 'Individual - Slot 1'
  coach_id UUID REFERENCES profiles(id),
  courts TEXT[], -- Array: ['Court 1', 'Court 2']
  max_players INTEGER,
  surface TEXT CHECK (surface IN ('clay', 'hard', 'indoor', 'any')),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CHECK (end_time > start_time)
);

CREATE INDEX idx_master_schedule_day ON master_schedule(day_of_week);
```

### master_schedule_players
```sql
CREATE TABLE master_schedule_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_schedule_id UUID REFERENCES master_schedule(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(master_schedule_id, player_id)
);
```

### weekly_schedules
```sql
CREATE TABLE weekly_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL, -- Monday of the week
  status TEXT CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  generated_at TIMESTAMP,
  published_at TIMESTAMP,
  published_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(week_start)
);

CREATE INDEX idx_weekly_schedules_week ON weekly_schedules(week_start);
```

### schedule_sessions
```sql
CREATE TABLE schedule_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekly_schedule_id UUID REFERENCES weekly_schedules(id) ON DELETE CASCADE,
  master_schedule_id UUID REFERENCES master_schedule(id), -- Source template
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type TEXT,
  session_name TEXT,
  coach_id UUID REFERENCES profiles(id),
  courts TEXT[],
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_schedule_sessions_date ON schedule_sessions(session_date);
CREATE INDEX idx_schedule_sessions_coach ON schedule_sessions(coach_id);
```

### session_players
```sql
CREATE TABLE session_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES schedule_sessions(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN (
    'confirmed',
    'pending',
    'removed_manual',    -- Coach removed
    'removed_tournament', -- Auto: tournament
    'removed_holiday',    -- Auto: holiday
    'removed_injury'      -- Auto: injury
  )) DEFAULT 'confirmed',
  removal_reason TEXT,
  added_manually BOOLEAN DEFAULT FALSE, -- TRUE if not from template
  added_by UUID REFERENCES profiles(id),
  removed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(session_id, player_id)
);

CREATE INDEX idx_session_players_session ON session_players(session_id);
CREATE INDEX idx_session_players_player ON session_players(player_id);
```

### schedule_change_requests
```sql
CREATE TABLE schedule_change_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_type TEXT CHECK (request_type IN (
    'add_player',
    'remove_player',
    'swap_players',
    'move_player',
    'cancel_session',
    'reschedule_session',
    'change_coach'
  )),
  session_id UUID REFERENCES schedule_sessions(id),
  target_session_id UUID REFERENCES schedule_sessions(id), -- For moves/swaps
  player_id UUID REFERENCES players(id),
  secondary_player_id UUID REFERENCES players(id), -- For swaps
  requested_by UUID REFERENCES profiles(id),
  request_source TEXT CHECK (request_source IN ('web_app', 'slack', 'api')),
  reason TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  slack_channel TEXT,
  slack_message_ts TEXT,
  expires_at TIMESTAMP, -- Auto-expire old requests
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_change_requests_status ON schedule_change_requests(status);
CREATE INDEX idx_change_requests_session ON schedule_change_requests(session_id);
```

### schedule_audit_log
```sql
CREATE TABLE schedule_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  session_id UUID REFERENCES schedule_sessions(id),
  player_id UUID REFERENCES players(id),
  change_request_id UUID REFERENCES schedule_change_requests(id),
  performed_by UUID REFERENCES profiles(id),
  previous_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_session ON schedule_audit_log(session_id);
CREATE INDEX idx_audit_log_created ON schedule_audit_log(created_at);
```

---

## UTR Matchplay Tables

### utr_matchplay_weeks
```sql
CREATE TABLE utr_matchplay_weeks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_date DATE NOT NULL, -- The Friday
  status TEXT CHECK (status IN ('planning', 'confirmed', 'in_progress', 'completed')) DEFAULT 'planning',
  matches JSONB, -- Final confirmed matches
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(week_date)
);
```

### utr_matches
```sql
CREATE TABLE utr_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matchplay_week_id UUID REFERENCES utr_matchplay_weeks(id) ON DELETE CASCADE,
  player_1_id UUID REFERENCES players(id),
  player_2_id UUID REFERENCES players(id),
  player_1_utr DECIMAL(4,2), -- UTR at time of match
  player_2_utr DECIMAL(4,2),
  scheduled_time TIME,
  court TEXT,
  surface TEXT,
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
  winner_id UUID REFERENCES players(id),
  score TEXT, -- '6-4, 6-3'
  score_detail JSONB, -- {sets: [{p1: 6, p2: 4}, ...]}
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  CHECK (player_1_id != player_2_id)
);

CREATE INDEX idx_utr_matches_week ON utr_matches(matchplay_week_id);
```

### utr_match_history
```sql
-- Track who played whom to avoid repeats
CREATE TABLE utr_match_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_1_id UUID REFERENCES players(id),
  player_2_id UUID REFERENCES players(id),
  match_date DATE,
  match_id UUID REFERENCES utr_matches(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_history_players ON utr_match_history(player_1_id, player_2_id);
```

---

## Tournament Tables

### discovered_tournaments
```sql
CREATE TABLE discovered_tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT, -- 'RFET', 'FCT', 'ITF', etc.
  external_id TEXT, -- ID from source system
  name TEXT NOT NULL,
  category TEXT, -- 'U12', 'U14', etc.
  level TEXT, -- 'regional', 'national', 'itf'
  location_city TEXT,
  location_venue TEXT,
  venue_address TEXT,
  start_date DATE,
  end_date DATE,
  registration_deadline DATE,
  surface TEXT,
  draw_size INTEGER,
  entry_fee DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  website_url TEXT,
  raw_data JSONB,
  is_relevant BOOLEAN DEFAULT TRUE, -- Can be hidden if not relevant
  scraped_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(source, external_id)
);

CREATE INDEX idx_discovered_tournaments_dates ON discovered_tournaments(start_date, end_date);
CREATE INDEX idx_discovered_tournaments_category ON discovered_tournaments(category);
```

### academy_tournaments
```sql
CREATE TABLE academy_tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discovered_tournament_id UUID REFERENCES discovered_tournaments(id),
  -- Manual entry fields (if not from scraper):
  name TEXT NOT NULL,
  category TEXT,
  level TEXT,
  location_city TEXT,
  venue_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  surface TEXT,
  entry_fee DECIMAL(10,2),
  -- Logistics:
  coach_in_charge UUID REFERENCES profiles(id),
  hotel_name TEXT,
  hotel_address TEXT,
  hotel_cost_per_night DECIMAL(10,2),
  hotel_nights INTEGER,
  hotel_rooms INTEGER,
  transport_method TEXT CHECK (transport_method IN ('van', 'individual', 'train', 'flight', 'mixed')),
  vehicle_id UUID REFERENCES vehicles(id),
  card_id UUID REFERENCES business_cards(id),
  departure_datetime TIMESTAMP,
  return_datetime TIMESTAMP,
  -- Costs:
  distance_km INTEGER,
  fuel_cost DECIMAL(10,2),
  depreciation_cost DECIMAL(10,2),
  total_transport_cost DECIMAL(10,2),
  total_accommodation_cost DECIMAL(10,2),
  total_entry_fees DECIMAL(10,2),
  other_costs DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  cost_split_method TEXT CHECK (cost_split_method IN ('equal', 'by_category', 'custom')),
  -- Status:
  status TEXT CHECK (status IN ('planning', 'registration_open', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'planning',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_academy_tournaments_dates ON academy_tournaments(start_date, end_date);
```

### tournament_registrations
```sql
CREATE TABLE tournament_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES academy_tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  status TEXT CHECK (status IN ('invited', 'pending', 'confirmed', 'declined', 'withdrawn', 'waitlist')) DEFAULT 'invited',
  cost_share DECIMAL(10,2),
  cost_paid BOOLEAN DEFAULT FALSE,
  registration_submitted BOOLEAN DEFAULT FALSE, -- Registered with federation
  draw_position TEXT, -- Seed number or position
  confirmed_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(tournament_id, player_id)
);
```

### tournament_matches
```sql
CREATE TABLE tournament_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES academy_tournaments(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id),
  round TEXT, -- 'Q1', 'Q2', 'R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F'
  match_number INTEGER,
  opponent_name TEXT,
  opponent_seed TEXT,
  result TEXT CHECK (result IN ('won', 'lost', 'retired', 'walkover_for', 'walkover_against', 'pending')),
  score TEXT,
  score_detail JSONB,
  -- Stats:
  service_games_played INTEGER,
  service_games_held INTEGER,
  return_games_played INTEGER,
  return_games_won INTEGER, -- Breaks
  -- Scheduling:
  scheduled_datetime TIMESTAMP,
  court TEXT,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  -- Meta:
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tournament_matches_tournament ON tournament_matches(tournament_id);
CREATE INDEX idx_tournament_matches_player ON tournament_matches(player_id);
```

---

## Vehicle & Card Tables

### vehicles
```sql
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Van 1', 'Van 2'
  license_plate TEXT,
  make TEXT,
  model TEXT,
  year INTEGER,
  capacity INTEGER, -- Passenger capacity
  fuel_type TEXT CHECK (fuel_type IN ('diesel', 'petrol', 'electric', 'hybrid')),
  fuel_consumption DECIMAL(4,2), -- L/100km
  depreciation_rate DECIMAL(6,4), -- €/km
  current_odometer INTEGER,
  status TEXT CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')) DEFAULT 'available',
  current_location TEXT, -- 'club', 'gym', 'tournament', etc.
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### business_cards
```sql
CREATE TABLE business_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Card #1'
  card_type TEXT, -- 'credit', 'debit', 'fuel'
  last_four TEXT, -- Last 4 digits
  status TEXT CHECK (status IN ('at_base', 'assigned', 'lost', 'cancelled')) DEFAULT 'at_base',
  current_location TEXT,
  assigned_to UUID REFERENCES profiles(id),
  monthly_limit DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### vehicle_assignments
```sql
CREATE TABLE vehicle_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id),
  assignment_type TEXT CHECK (assignment_type IN ('tournament', 'daily_transport', 'maintenance', 'other')),
  tournament_id UUID REFERENCES academy_tournaments(id),
  driver_id UUID REFERENCES profiles(id),
  card_id UUID REFERENCES business_cards(id),
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  start_location TEXT,
  end_location TEXT,
  route_description TEXT,
  distance_km INTEGER,
  passengers JSONB, -- Array of player IDs
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),

  CHECK (end_datetime > start_datetime)
);

CREATE INDEX idx_vehicle_assignments_vehicle ON vehicle_assignments(vehicle_id);
CREATE INDEX idx_vehicle_assignments_dates ON vehicle_assignments(start_datetime, end_datetime);
```

### locations
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE, -- 'club', 'gym', 'summer'
  address TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  location_type TEXT, -- 'base', 'gym', 'seasonal', 'external'
  is_seasonal BOOLEAN DEFAULT FALSE,
  active_from DATE,
  active_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### location_distances
```sql
CREATE TABLE location_distances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_location_id UUID REFERENCES locations(id),
  to_location_id UUID REFERENCES locations(id),
  distance_km INTEGER,
  typical_duration_minutes INTEGER,
  route_notes TEXT,

  UNIQUE(from_location_id, to_location_id)
);
```

### expenses
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES business_cards(id),
  tournament_id UUID REFERENCES academy_tournaments(id),
  vehicle_assignment_id UUID REFERENCES vehicle_assignments(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  category TEXT CHECK (category IN ('fuel', 'food', 'accommodation', 'parking', 'tolls', 'supplies', 'entry_fee', 'other')),
  description TEXT,
  vendor TEXT,
  receipt_url TEXT,
  expense_date DATE,
  submitted_by UUID REFERENCES profiles(id),
  approved BOOLEAN,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_tournament ON expenses(tournament_id);
CREATE INDEX idx_expenses_card ON expenses(card_id);
```

---

## Dartfish Analytics Tables

### dartfish_imports
```sql
CREATE TABLE dartfish_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id),
  match_type TEXT CHECK (match_type IN ('tournament', 'utr_matchplay', 'practice', 'friendly')),
  tournament_match_id UUID REFERENCES tournament_matches(id),
  utr_match_id UUID REFERENCES utr_matches(id),
  opponent_name TEXT,
  match_date DATE,
  result TEXT,
  score TEXT,
  video_url TEXT,
  csv_filename TEXT,
  csv_data TEXT, -- Raw CSV content
  parsing_status TEXT CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  parsing_error TEXT,
  imported_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### match_events
```sql
CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID REFERENCES dartfish_imports(id) ON DELETE CASCADE,
  event_index INTEGER,
  video_timestamp TEXT, -- '00:15:32'
  video_timestamp_ms INTEGER, -- For seeking
  duration_ms INTEGER,
  set_number INTEGER,
  game_number INTEGER,
  point_number INTEGER,
  point_score TEXT, -- '30-15'
  game_score TEXT, -- '3-2'
  set_score TEXT, -- '1-0'
  server TEXT CHECK (server IN ('player', 'opponent')),
  event_type TEXT, -- 'serve', 'return', 'rally', 'point_end'
  shot_type TEXT, -- 'forehand', 'backhand', 'volley', 'overhead', 'drop_shot'
  shot_number INTEGER, -- Shot number in rally
  position TEXT, -- 'baseline', 'midcourt', 'net'
  court_side TEXT CHECK (court_side IN ('deuce', 'ad')),
  direction TEXT, -- 'cross', 'dtl', 'middle'
  result TEXT, -- 'winner', 'unforced_error', 'forced_error', 'in_play'
  depth TEXT, -- 'deep', 'mid', 'short'
  speed_kmh INTEGER,
  spin TEXT, -- 'flat', 'topspin', 'slice', 'kick'
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_events_import ON match_events(import_id);
```

### match_analyses
```sql
CREATE TABLE match_analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_id UUID REFERENCES dartfish_imports(id),
  player_id UUID REFERENCES players(id),
  analysis_type TEXT CHECK (analysis_type IN ('ai_generated', 'coach_notes', 'auto_stats')),
  -- AI-generated content:
  summary TEXT,
  strengths JSONB,
  weaknesses JSONB,
  recommendations JSONB,
  tactical_patterns JSONB,
  key_stats JSONB,
  flagged_concerns JSONB,
  -- Generated visualizations:
  generated_charts JSONB, -- Array of chart configs
  -- Meta:
  ai_model TEXT,
  ai_prompt_version TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_match_analyses_player ON match_analyses(player_id);
```

### chart_templates
```sql
CREATE TABLE chart_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  chart_type TEXT, -- 'bar', 'line', 'pie', 'heatmap', 'scatter'
  category TEXT, -- 'serve', 'rally', 'mental', 'movement'
  config JSONB NOT NULL, -- Full chart configuration
  is_system BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### player_analytics_trends
```sql
CREATE TABLE player_analytics_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id),
  metric_name TEXT, -- 'first_serve_pct', 'break_points_saved', etc.
  metric_category TEXT, -- 'serve', 'return', 'mental', 'physical'
  period TEXT, -- 'last_5_matches', 'last_10_matches', 'last_30_days'
  value DECIMAL(10,4),
  sample_size INTEGER, -- Number of matches in calculation
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  benchmark DECIMAL(10,4), -- Academy average or target
  calculated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(player_id, metric_name, period)
);

CREATE INDEX idx_analytics_trends_player ON player_analytics_trends(player_id);
```

---

## Communication Tables

### chat_messages
```sql
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT CHECK (platform IN ('whatsapp', 'telegram', 'slack')),
  tournament_id UUID REFERENCES academy_tournaments(id),
  group_id TEXT,
  external_message_id TEXT,
  sender_name TEXT,
  sender_phone TEXT,
  message_type TEXT, -- 'text', 'image', 'document', 'voice'
  content TEXT,
  parsed_intent TEXT, -- AI-detected intent
  agent_response TEXT,
  response_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_tournament ON chat_messages(tournament_id);
```

---

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE injuries ENABLE ROW LEVEL SECURITY;
-- ... (all tables)

-- Example policies:

-- Players: Coaches see their players, players see themselves
CREATE POLICY "Coaches see their players" ON players
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM profiles WHERE id = players.coach_id
    )
  );

CREATE POLICY "Players see themselves" ON players
  FOR SELECT USING (user_id = auth.uid());

-- Admins see everything
CREATE POLICY "Admins full access" ON players
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Training loads: Player can insert their own, coaches can view
CREATE POLICY "Players insert own loads" ON training_loads
  FOR INSERT WITH CHECK (
    player_id IN (SELECT id FROM players WHERE user_id = auth.uid())
  );

-- Schedule change requests: Only managers can approve
CREATE POLICY "Only managers approve" ON schedule_change_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );
```

---

## Functions & Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- ... (apply to all tables with updated_at)

-- Auto-update player's current UTR when new history entry
CREATE OR REPLACE FUNCTION update_player_utr()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET current_utr = NEW.utr_value, updated_at = NOW()
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_utr_on_history
  AFTER INSERT ON utr_history
  FOR EACH ROW EXECUTE FUNCTION update_player_utr();

-- Function to check player availability
CREATE OR REPLACE FUNCTION is_player_available(
  p_player_id UUID,
  p_date DATE
) RETURNS BOOLEAN AS $$
DECLARE
  has_whereabouts BOOLEAN;
  has_injury BOOLEAN;
BEGIN
  -- Check whereabouts
  SELECT EXISTS (
    SELECT 1 FROM whereabouts
    WHERE player_id = p_player_id
      AND affects_schedule = TRUE
      AND status != 'cancelled'
      AND p_date BETWEEN start_date AND end_date
  ) INTO has_whereabouts;

  -- Check active injuries
  SELECT EXISTS (
    SELECT 1 FROM injuries
    WHERE player_id = p_player_id
      AND status = 'active'
  ) INTO has_injury;

  RETURN NOT (has_whereabouts OR has_injury);
END;
$$ LANGUAGE plpgsql;
```

---

## Indexes Summary

Key indexes for performance:
- All foreign keys indexed
- Date range queries optimized
- Status fields indexed for filtering
- Composite indexes for common query patterns

---

## Migration Order

1. `profiles` (extends auth.users)
2. `players`
3. `training_loads`, `injuries`, `player_notes`, `whereabouts`, `attendance`, `utr_history`
4. `master_schedule`, `master_schedule_players`
5. `weekly_schedules`, `schedule_sessions`, `session_players`
6. `schedule_change_requests`, `schedule_audit_log`
7. `utr_matchplay_weeks`, `utr_matches`, `utr_match_history`
8. `discovered_tournaments`, `academy_tournaments`, `tournament_registrations`, `tournament_matches`
9. `vehicles`, `business_cards`, `locations`, `location_distances`, `vehicle_assignments`, `expenses`
10. `dartfish_imports`, `match_events`, `match_analyses`, `chart_templates`, `player_analytics_trends`
11. `chat_messages`
