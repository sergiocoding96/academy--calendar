# Academy Calendar - Claude Code Context

## Project Overview
Tennis academy management system with AI-powered scheduling, player management, tournament coordination, and analytics. Built with Next.js, Supabase, and AI agents.

**Repository:** https://github.com/sergiocoding96/academy--calendar
**Live:** https://academy-calendar.vercel.app

---

## 🎯 ACTIVE FEATURE
> **UPDATE THIS WHEN SWITCHING FEATURES**

```
CURRENT: [FEATURE_NAME]
SPEC: docs/features/[XX-feature-name].md
BRANCH: feature/[feature-name]
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

- [ ] _None documented yet_

---

## 📅 Last Updated
> Update this when making significant changes to this file

**Date:** 2025-12-27
**By:** Claude Code
**Changes:** Initial setup
