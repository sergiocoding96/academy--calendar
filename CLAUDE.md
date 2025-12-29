# Academy Calendar - Claude Code Context

## Project Overview
Tennis academy management system with AI-powered scheduling, player management, tournament coordination, and analytics. Built with Next.js, Supabase, and AI agents.

**Repository:** https://github.com/sergiocoding96/academy--calendar
**Live:** https://academy-calendar.vercel.app

---

## 🎯 ACTIVE FEATURE
> **UPDATE THIS WHEN SWITCHING FEATURES**

```
CURRENT: Tournament Calendar Integration (Phase 1 - UI Foundation)
SPEC: .claude/plans/tournament-calendar-integration.md
BRANCH: feature/tournament-calendar-integration
SUPABASE PROJECT: dhisrdvfocenhfarblxd
```

### Tournament Calendar Integration - Phase 1 Tasks:
1. **Create SourcesSelector component** - Multi-select for 15 circuits (HTTP vs Scrapfly)
2. **Create DateRangePicker component** - From/To date inputs with presets
3. **Create useTournamentSources hook** - State management + localStorage
4. **Update tournament calendar page layout** - Add filter bar
5. **Documentation updates** - CLAUDE.md + TODO.md

### Phase 1 COMPLETE (Foundation Setup):
- ✅ Dependencies: @anthropic-ai/sdk, ai, cheerio, puppeteer-core, @sparticuz/chromium
- ✅ Types: `src/types/agent.ts` - All agent type definitions
- ✅ Claude Client: `src/lib/agent/claude/client.ts` - API wrapper with streaming
- ✅ System Prompts: `src/lib/agent/claude/prompts.ts` - Agent personality
- ✅ Tool Definitions: `src/lib/agent/claude/tools.ts` - 7 Claude tools
- ✅ Database Schema: 8 new agent tables created in Supabase
- ✅ Build: TypeScript compilation verified (no errors)
- ⏳ Environment: ANTHROPIC_API_KEY, CRON_SECRET (add to .env.local)

### Phase 2 COMPLETE (Chat Interface):
- ✅ `/api/agent/chat/route.ts` - Chat endpoint with agentic loop
- ✅ Chat UI: agent-chat, chat-input, chat-message, chat-suggestions
- ✅ `useChat` hook - State management for messages, loading, errors
- ✅ `/tournaments/agent/page.tsx` - Dedicated chat page
- ✅ Navigation - AI Agent link added with Bot icon
- ✅ Build: TypeScript compilation verified

### Phase 3 COMPLETE (Natural Language Queries):
- ✅ `src/lib/agent/actions/tournament-actions.ts` - Server actions with 7 tools
- ✅ `queryTournaments()` - Filter by category, dates, location, level
- ✅ `getTournamentDetails()` - Single tournament with coach/player assignments
- ✅ `listPlayers()` - Filter by category, status, coach
- ✅ `getPlayerInfo()` - Player details with upcoming tournaments
- ✅ `getCalendarSummary()` - Weekly/date range tournament summary
- ✅ Query parser for natural language (dates, categories, locations, levels)
- ✅ Chat API updated to use real tool handlers
- ✅ Guest mode mock data fallback for all queries

### Phase 4 COMPLETE (AI Recommendations):
- ✅ `src/lib/agent/recommendation/scoring.ts` - Tournament scoring algorithm
  - 6 scoring factors: categoryMatch(25), levelMatch(25), travelDistance(20), availability(15), entryDeadline(10), prestige(5)
  - Total score: 0-100 points with recommendation levels
- ✅ `src/lib/agent/recommendation/engine.ts` - Core recommendation logic
  - Fetches player profile and availability from Supabase
  - Scores and ranks tournaments for personalized recommendations
  - Guest mode fallback with mock recommendations
- ✅ Updated `recommendTournaments()` action with real implementation
- ✅ Build: TypeScript compilation verified

### Phase 5 COMPLETE (Web Scraping with Scrapfly):
- ✅ `src/lib/agent/scraper/scrapfly-client.ts` - Scrapfly API wrapper
  - Reliable web scraping without Puppeteer complexity
  - Handles anti-bot, JS rendering, proxy rotation
  - Free tier: 1,000 requests/month (plenty for weekly scrapes)
- ✅ `src/lib/agent/scraper/parser.ts` - Cheerio HTML parsing utilities
  - Date parsing, category normalization, surface mapping
  - Tournament ID generation from scraped data
- ✅ `src/lib/agent/scraper/itf-scraper.ts` - ITF World Tennis Tour scraper
  - Searches by category (U12, U14, U16, U18), country, dates
  - Parses tournament cards from calendar pages
- ✅ `/api/agent/scrape/route.ts` - Weekly cron endpoint
  - Vercel cron compatible (runs every Monday 6 AM UTC)
  - Upserts to scraped_tournaments table
  - Logs scrape results to scrape_logs table
- ✅ Updated `searchExternal()` action with real scraper
  - Falls back to cached data if Scrapfly not configured
  - Live ITF search when API key available
- ✅ Build: TypeScript compilation verified
- ⏳ Environment: Add `SCRAPFLY_API_KEY` to .env.local (sign up at scrapfly.io)

---

## 🔧 Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + Auth + Realtime)
- **Styling:** Tailwind CSS
- **AI:** Claude API (@anthropic-ai/sdk) + Vercel AI SDK for streaming
- **Scraping:** Cheerio (static) + Puppeteer/Chromium (dynamic)
- **Deployment:** Vercel

---

## 📁 Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── agent/         # Agent API routes (Phase 2)
│   │       ├── chat/      # Streaming chat endpoint
│   │       ├── recommend/ # Tournament recommendations
│   │       ├── search/    # Web scraping/search
│   │       └── scrape/    # Scheduled scraping (cron)
│   ├── (auth)/            # Auth pages
│   └── (dashboard)/       # Main app pages
├── components/            # Shared components
│   └── agent/             # Agent UI components (Phase 2)
├── features/              # Feature-based modules
├── lib/                   # Utilities
│   ├── agent/             # 🆕 Tournament Agent module
│   │   ├── claude/        # Claude API integration
│   │   │   ├── client.ts  # API wrapper with streaming
│   │   │   ├── prompts.ts # System prompts
│   │   │   └── tools.ts   # Tool definitions (7 tools)
│   │   ├── scraper/       # Web scrapers (Phase 5)
│   │   ├── recommendation/# AI recommendations (Phase 4)
│   │   ├── actions/       # Server actions (Phase 3)
│   │   └── utils/         # Agent utilities
│   ├── supabase/          # Supabase clients
│   └── utils.ts
├── types/                 # TypeScript types
│   ├── database.ts        # Supabase generated types
│   └── agent.ts           # 🆕 Agent type definitions
└── hooks/                 # Custom React hooks
    └── agent/             # Agent hooks (Phase 2)

docs/
├── features/             # Feature specifications
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

### Agent Tables (✅ Created):
| Table | Purpose |
|-------|---------|
| `tournament_sources` | External tournament data sources (ITF, federations) |
| `scraped_tournaments` | Discovered tournaments awaiting approval |
| `agent_conversations` | Chat conversation history |
| `agent_messages` | Individual chat messages |
| `player_availability` | Player availability for recommendations |
| `tournament_recommendations` | AI-generated tournament suggestions |
| `agent_notifications` | Agent-generated notifications |
| `scrape_logs` | Web scraping job history |

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

**Date:** 2025-12-29
**By:** Claude Code
**Changes:** Started Tournament Calendar Integration feature
- Created feature plan: `.claude/plans/tournament-calendar-integration.md`
- 6 phases: UI Foundation, Enhanced Display, On-Demand Scraping, Player Assignment, Change Detection, Testing
- Branch: `feature/tournament-calendar-integration`

Previous:
- Tournament Agent Phase 5 COMPLETE - Web scraping with Scrapfly
- Player Database UI COMPLETE (all 8 hooks, 21+ components, security audit)
