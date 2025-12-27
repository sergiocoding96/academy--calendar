# Academy Calendar - Claude Code Context

## Project Overview
Tennis academy management system with AI-powered scheduling, player management, tournament coordination, and analytics. Built with Next.js, Supabase, and AI agents.

**Repository:** https://github.com/sergiocoding96/academy--calendar
**Live:** https://academy-calendar.vercel.app

---

## 🎯 ACTIVE FEATURE
> **UPDATE THIS WHEN SWITCHING FEATURES**

```
CURRENT: Player Database UI - COMPLETE
SPEC: docs/features/01-player-database.md
SUPABASE PROJECT: dhisrdvfocenhfarblxd
PHASE: 6 - Security review & documentation (FINAL)
```

---

## 🔧 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Styling:** Tailwind CSS
- **AI:** Claude API for natural language agent
- **Deployment:** Vercel

---

## 📁 Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── (auth)/            # Auth pages
│   └── (dashboard)/       # Main app pages
├── components/            # Shared components
├── features/              # Feature-based modules
│   ├── player-database/
│   ├── schedule-manager/
│   ├── utr-matchplay/
│   ├── tournament-agent/
│   ├── dartfish-analytics/
│   └── van-manager/
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   └── utils.ts
├── types/                 # TypeScript types
│   └── database.ts       # Supabase generated types
└── hooks/                 # Custom React hooks

docs/
├── features/             # Feature specifications (READ THESE)
├── materials/            # Current Excel files, screenshots, etc.
└── DATABASE_SCHEMA.md    # Complete Supabase schema
```

---

## 🚨 CRITICAL RULES

### After EVERY Task Completion:
1. **Update TODO.md** - Mark completed tasks, add new ones discovered
2. **Update CLAUDE.md** - If architecture decisions were made, document them
3. **Commit with conventional commits** - `feat:`, `fix:`, `docs:`, `refactor:`

### Code Standards:
- All database queries through Supabase client (never raw SQL in components)
- Types generated from Supabase schema (`npx supabase gen types typescript`)
- Feature code lives in `src/features/[feature-name]/`
- Shared components in `src/components/`
- API routes follow REST conventions

### When Starting a Task:
1. Read the feature spec in `docs/features/`
2. Check TODO.md for current priorities
3. Review related database tables in `docs/DATABASE_SCHEMA.md`
4. Look at existing patterns in similar features

---

## 🔌 USE THESE TOOLS (MCPs, Plugins, Subagents)

### Available MCPs - USE THEM:
- **Supabase MCP** - For database operations, migrations, querying
- **GitHub MCP** - For issues, PRs, branch management
- **Filesystem MCP** - For file operations
- **Brave Search / Web Search** - For documentation lookups, API research

### When to Use Subagents:
- **Complex refactoring** - Spawn subagent for isolated refactor tasks
- **Test generation** - Subagent to write comprehensive tests
- **Documentation** - Subagent to update docs after implementation
- **Code review** - Subagent to review changes before commit

### Plugin Usage:
- Use available plugins for linting, formatting, type-checking
- Run `npm run lint` and `npm run type-check` before committing
- Use Prettier for consistent formatting

---

## 📦 Player Database Feature

### Hooks (src/features/player-database/hooks/)
| Hook | Purpose | Returns |
|------|---------|---------|
| `usePlayer(id)` | Single player with CRUD | player, update, remove, toggleActive |
| `usePlayers(filters)` | List with filters | players, setFilters, addPlayer |
| `useTrainingLoads(playerId)` | Training load management | trainingLoads, addLoad, updateLoad, removeLoad, averageRpe, totalMinutes |
| `useInjuries(playerId)` | Injury tracking | injuries, activeInjuries, hasActiveInjury, addInjury, clearInjury |
| `usePlayerNotes(playerId)` | Notes with AI context | notes, aiContextNotes, addNote, toggleAiContext |
| `useWhereabouts(playerId)` | Calendar/availability | whereabouts, upcomingWhereabouts, getWhereaboutsForDate |
| `useUtrHistory(playerId)` | UTR tracking | utrHistory, stats (currentUtr, highestUtr, utrChange) |
| `useAttendance(playerId)` | Attendance tracking | attendance, stats, markPresent, markAbsent, markStatus, getDateStatus |

### Query Functions (src/features/player-database/lib/queries.ts)
- `getPlayer`, `getPlayers`, `getPlayerWithDetails`
- `getPlayerTrainingLoads`, `getPlayerInjuries`, `getActiveInjuries`
- `getPlayerNotes`, `getPlayerWhereabouts`, `getUpcomingWhereabouts`
- `getPlayerUtrHistory`, `getPlayerAttendance`, `getCoaches`

### Mutation Functions (src/features/player-database/lib/mutations.ts)
- Player: `createPlayer`, `updatePlayer`, `deletePlayer`, `togglePlayerActive`
- Training: `createTrainingLoad`, `updateTrainingLoad`, `deleteTrainingLoad`
- Injuries: `createInjury`, `updateInjury`, `clearInjury`, `deleteInjury`
- Notes: `createNote`, `updateNote`, `deleteNote`, `toggleNoteAiContext`
- Whereabouts: `createWhereabouts`, `updateWhereabouts`, `deleteWhereabouts`
- UTR: `addUtrEntry`, `deleteUtrEntry`
- Attendance: `markAttendance`, `updateAttendance`, `deleteAttendance`, `markBulkAttendance`

---

## 🗄️ Database Quick Reference

### Core Tables:
| Table | Purpose |
|-------|---------|
| `players` | Player profiles, UTR, coach assignment |
| `training_loads` | Daily RPE and session duration |
| `injuries` | Injury tracking with status |
| `player_notes` | Natural language context for AI |
| `whereabouts` | Tournaments, holidays, camps |
| `master_schedule` | Weekly template (repeats) |
| `schedule_sessions` | Actual scheduled sessions |
| `schedule_change_requests` | Pending approval workflow |
| `academy_tournaments` | Tournament logistics |
| `vehicles` | Van tracking |
| `business_cards` | Card tracking |
| `dartfish_imports` | Match video analysis data |

**Full schema:** `docs/DATABASE_SCHEMA.md`

---

## 🔗 Feature Dependencies

```
┌─────────────────────────────────────────────────────────┐
│                  PLAYER DATABASE                        │
│                   (Build First)                         │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│ Schedule  │  │    UTR    │  │Tournament │
│ Manager   │  │ Matchplay │  │   Agent   │
└─────┬─────┘  └───────────┘  └─────┬─────┘
      │                             │
      └──────────┬──────────────────┘
                 ▼
          ┌───────────┐
          │    Van    │
          │  Manager  │
          └───────────┘
                 │
                 ▼
          ┌───────────┐
          │ Dartfish  │
          │ Analytics │
          └───────────┘
```

**Build order recommendation:**
1. Player Database (core)
2. Schedule Manager (core)
3. UTR Matchplay
4. Tournament Agent
5. Van Manager
6. Dartfish Analytics

---

## 🧪 Testing Approach
- Unit tests for utilities and hooks
- Integration tests for API routes
- E2E tests for critical flows (Playwright)
- Test files colocated: `feature.test.ts` next to `feature.ts`

---

## 📝 Commit Message Format
```
type(scope): description

feat(player-db): add injury tracking form
fix(schedule): correct timezone handling in session display
docs(readme): update setup instructions
refactor(api): extract supabase queries to separate module
```

---

## 🚀 Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript check
npx supabase gen types typescript --project-id [ID] > src/types/database.ts
```

---

## ⚠️ Known Issues / Tech Debt
> Add items here as you discover them

### Security (from Phase 6 audit)
- [ ] **CRITICAL**: RLS policies use `USING (true)` - must tighten to verify coach-player assignments
- [ ] **HIGH**: Guest mode bypasses server-side authorization - limit to read-only demo data
- [ ] **HIGH**: IDOR in mutations - add ownership verification before update/delete
- [ ] **MEDIUM**: Add input sanitization for text fields that may contain HTML
- [ ] **MEDIUM**: Add rate limiting on form submissions

### Technical Debt
- [ ] Some Supabase client type casts using `as any` for attendance queries

---

## 📅 Last Updated
> Update this when making significant changes to this file

**Date:** 2025-12-27
**By:** Claude Code
**Changes:** Player Database UI feature COMPLETE
- All 8 hooks implemented (including useAttendance)
- 21+ components created (list, profile, forms, UTR, attendance)
- Coach dashboard pages: players list, detail, training, injuries, notes, whereabouts, UTR, attendance
- Player dashboard pages: training, injuries, whereabouts
- Security audit completed with documented findings
