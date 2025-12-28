# Feature 01: Player Database (CORE)

> **Priority:** 🔴 Critical - Build First
> **Dependencies:** None
> **Dependents:** All other features

## Overview
The Player Database is the **central hub** of the entire system. Every other feature connects to and pulls from this database. Each player has their own comprehensive profile containing all relevant data about their training, health, availability, performance, and tournament activity.

## Data Components

### 1. Player Identity
- player_id, name, email, phone
- date_of_birth, gender, category (U12, U14, etc.)
- coach_id (assigned primary coach)
- profile_photo

### 2. Training Loads (Daily/Weekly)
After each session, the player logs:
- **Date** — Session date
- **Perceived Effort (RPE)** — Scale 1-10, how hard did it feel?
- **Duration** — Minutes/hours
- **Session Type** — Practice, match, fitness, etc.
- **Notes** — Optional comments

### 3. Injuries
- Body part + side (left/right)
- Injury type, severity (minor/moderate/severe)
- Date occurred, expected return
- Status: Active → Recovering → Cleared
- Treatment notes
- **Visibility:** Shared with S&C coach, Physio, Tennis coach

### 4. Notes (Natural Language Context)
Free-form notes for AI agent context:
- "Cannot play on clay courts - knee issue"
- "Not available before 2 PM on weekdays"
- "Prefers morning practice slots"
- "College recruiting focus - needs competitive matches"

### 5. UTR Data
- Current UTR rating
- UTR history with dates
- Source (official/manual/API)

### 6. Whereabouts (Tournaments, Holidays, Camps)
- Event type, name, location
- Start/end dates
- Status (planned/confirmed/completed)
- **Affects scheduling** — Auto-removes from sessions

### 7. Tournament Results
- Round reached, wins/losses
- Match scores with holds/breaks
- Links to academy_tournaments

### 8. Attendance
- Daily status: Present, Absent, Tournament, Holiday, Injured
- Auto-populated from whereabouts
- Manual entry for unexpected absences

## Business Rules

```
IF player is ON HOLIDAY:
   → Do NOT add to tournaments
   → Do NOT add to practices
   → Do NOT include in UTR Matchplay

IF player is IN TOURNAMENT that week:
   → Do NOT add to practices
   → Do NOT include in UTR Matchplay
   → Mark as "Away - Tournament" in schedule

IF player has ACTIVE INJURY:
   → Do NOT add to any sessions
   → Show injury status to relevant staff
```

## User Interface

### Player Profile View
```
┌─────────────────────────────────────────────────────┐
│ PLAYER PROFILE: [Name]                              │
├─────────────────────────────────────────────────────┤
│ [Photo]  Name: Carlos Martinez                      │
│          Category: U16 | Coach: Roberto García      │
│          UTR: 12.45 (↑ 0.12 this month)            │
├─────────────────────────────────────────────────────┤
│ TABS: [Overview] [Training] [Injuries] [Analytics] │
│       [Tournaments] [Schedule] [Notes]              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 🏋️ THIS WEEK'S LOAD                                │
│ Mon: RPE 7, 2h | Tue: RPE 8, 3h | Wed: RPE 6, 2h  │
│ Weekly Total: 23 (Normal ✓)                        │
│                                                     │
│ 🩹 INJURIES: None active ✓                         │
│                                                     │
│ 📅 UPCOMING                                         │
│ • Jan 10: UTR Matchplay vs. Pablo                  │
│ • Jan 15-22: Junior Orange Bowl (Miami)            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## API Endpoints

```
GET    /api/players              - List all players (filtered by coach)
GET    /api/players/:id          - Get player profile
POST   /api/players              - Create player
PATCH  /api/players/:id          - Update player
DELETE /api/players/:id          - Soft delete player

GET    /api/players/:id/loads    - Get training loads
POST   /api/players/:id/loads    - Add training load

GET    /api/players/:id/injuries - Get injuries
POST   /api/players/:id/injuries - Report injury
PATCH  /api/injuries/:id         - Update injury status

GET    /api/players/:id/whereabouts - Get whereabouts
POST   /api/players/:id/whereabouts - Add whereabout

GET    /api/players/:id/availability?date=YYYY-MM-DD - Check if available
```

## Database Tables
See `docs/DATABASE_SCHEMA.md`:
- `players`
- `training_loads`
- `injuries`
- `player_notes`
- `whereabouts`
- `utr_history`
- `attendance`

## Implementation Phases

### Phase 1: Core Data
- [ ] Create all Supabase tables
- [ ] Set up RLS policies
- [ ] Generate TypeScript types

### Phase 2: Basic UI
- [ ] Player list view
- [ ] Player profile page
- [ ] Create/edit player form

### Phase 3: Tracking Features
- [ ] Training load entry
- [ ] Injury reporting
- [ ] Notes management
- [ ] Whereabouts entry

### Phase 4: Intelligence
- [ ] Availability checking function
- [ ] Load alerts (high load warning)
- [ ] Integration hooks for other features

## Files to Create
```
src/features/player-database/
├── README.md
├── components/
│   ├── PlayerList.tsx
│   ├── PlayerCard.tsx
│   ├── PlayerProfile.tsx
│   ├── TrainingLoadForm.tsx
│   ├── InjuryForm.tsx
│   ├── NotesManager.tsx
│   └── WhereaboutsCalendar.tsx
├── hooks/
│   ├── usePlayer.ts
│   ├── usePlayers.ts
│   ├── useTrainingLoads.ts
│   └── useInjuries.ts
├── api/
│   └── (routes in src/app/api/players/)
└── types.ts
```
