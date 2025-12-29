# Player Database Feature

Feature for managing player profiles, training loads, injuries, notes, whereabouts, UTR tracking, and attendance.

## Structure

```
src/features/player-database/
├── README.md           # This file
├── types.ts            # Feature-specific types
├── hooks/              # React hooks for data fetching
│   ├── index.ts
│   ├── usePlayer.ts
│   ├── usePlayers.ts
│   ├── useTrainingLoads.ts
│   ├── useInjuries.ts
│   ├── usePlayerNotes.ts
│   ├── useWhereabouts.ts
│   ├── useUtrHistory.ts
│   └── useAttendance.ts
├── components/         # UI components
│   ├── index.ts
│   ├── PlayerList.tsx
│   ├── PlayerCard.tsx
│   ├── PlayerTable.tsx
│   ├── PlayerFilters.tsx
│   ├── PlayerSearch.tsx
│   ├── PlayerProfile.tsx
│   ├── PlayerHeader.tsx
│   ├── PlayerStats.tsx
│   ├── PlayerTabs.tsx
│   ├── PlayerQuickActions.tsx
│   ├── PlayerForm.tsx
│   ├── TrainingLoadForm.tsx
│   ├── InjuryForm.tsx
│   ├── NotesManager.tsx
│   ├── WhereaboutsCalendar.tsx
│   ├── UtrChart.tsx
│   ├── UtrForm.tsx
│   ├── UtrComparison.tsx
│   ├── AttendanceStats.tsx
│   ├── AttendanceCalendar.tsx
│   └── QuickAttendance.tsx
└── lib/                # Utility functions
    ├── queries.ts
    └── mutations.ts
```

## Usage

### Hooks

```tsx
import {
  usePlayer,
  usePlayers,
  useInjuries,
  useUtrHistory,
  useAttendance
} from '@/features/player-database/hooks'

// Fetch single player
const { player, loading, error } = usePlayer(playerId)

// Fetch all players with filters
const { players, loading } = usePlayers({ category: 'U14', coachId: '...' })

// Manage injuries
const { injuries, addInjury, updateInjury } = useInjuries(playerId)

// UTR history
const { history, addEntry, currentUtr, utrChange } = useUtrHistory(playerId)

// Attendance tracking
const { attendance, stats, markPresent, markAbsent, markStatus } = useAttendance(playerId)
```

### Components

```tsx
import {
  PlayerList,
  PlayerProfile,
  PlayerForm,
  UtrChart,
  AttendanceCalendar,
  QuickAttendance
} from '@/features/player-database/components'

// Display player list with card/table toggle
<PlayerList players={players} onSelect={handleSelect} />

// Display player profile
<PlayerProfile playerId={id} />

// Create/edit player
<PlayerForm player={player} onSubmit={handleSubmit} />

// UTR history chart
<UtrChart history={utrHistory} />

// Attendance calendar view
<AttendanceCalendar attendance={attendance} onMarkAttendance={handleMark} />

// Quick attendance buttons for list view
<QuickAttendance playerId={id} playerName={name} onMark={handleMark} />
```

## Database Tables

- `players` - Core player data (name, category, UTR, contact info)
- `training_loads` - Daily RPE and session tracking
- `injuries` - Injury tracking with body part, severity, dates
- `player_notes` - Notes with AI context flag for inclusion in recommendations
- `whereabouts` - Player availability/location calendar
- `utr_history` - UTR rating history with sources
- `attendance` - Session attendance (present/absent/late/excused/tournament/injured/holiday)

## Pages

### Coach Dashboard
- `/dashboard/coach/players` - Player list with filters
- `/dashboard/coach/players/[id]` - Player profile
- `/dashboard/coach/players/[id]/training` - Training loads
- `/dashboard/coach/players/[id]/injuries` - Injury management
- `/dashboard/coach/players/[id]/notes` - Notes management
- `/dashboard/coach/players/[id]/whereabouts` - Whereabouts calendar
- `/dashboard/coach/players/[id]/utr` - UTR history
- `/dashboard/coach/players/[id]/attendance` - Player attendance
- `/dashboard/coach/attendance` - Daily attendance for all players

### Player Dashboard
- `/dashboard/player/training` - Self-report training loads
- `/dashboard/player/injuries` - View own injuries
- `/dashboard/player/whereabouts` - Update own availability

## Security Notes

The feature relies on Supabase RLS policies for data access control. Key security considerations:

1. **Role-Based Access**: Coach and player dashboards use `requireRole()` for layout protection
2. **Input Validation**: Forms validate required fields, email format, and numeric ranges
3. **XSS Protection**: React JSX auto-escapes output

### Known Issues for Production
- RLS policies should be tightened to verify coach-player assignments
- Add ownership verification in mutation functions as defense-in-depth
- Consider rate limiting on form submissions
