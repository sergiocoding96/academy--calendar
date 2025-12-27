# Academy Calendar - Claude Code Context

## Project Overview
Tennis academy management system with AI-powered scheduling, player management, tournament coordination, and analytics. Built with Next.js, Supabase, and AI agents.

**Repository:** https://github.com/sergiocoding96/academy--calendar
**Live:** https://academy-calendar.vercel.app

---

## 🎯 ACTIVE FEATURE
> **UPDATE THIS WHEN SWITCHING FEATURES**

```
CURRENT: Tournament Agent (Phase 4 - AI Recommendations)
SPEC: .claude/plans/vectorized-roaming-fairy.md
BRANCH: feature/tournament-agent
```

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

### Phase 4 TODO (AI Recommendations):
- [ ] Create `src/lib/agent/recommendation/engine.ts` - Core recommendation logic
- [ ] Create `src/lib/agent/recommendation/scoring.ts` - Tournament scoring algorithm
- [ ] Implement scoring factors: age match, level, distance, availability, deadline
- [ ] Create `/api/agent/recommend/route.ts` - Recommendations API
- [ ] Create recommendation UI components (player-selector, recommendation-card)
- [ ] Create `useRecommendations` hook for state management
- [ ] Update `recommendTournaments()` action with real implementation

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

- [ ] _None documented yet_

---

## 📅 Last Updated
> Update this when making significant changes to this file

**Date:** 2025-12-27
**By:** Claude Code
**Changes:** Phase 2 COMPLETE - Chat interface with agentic loop, UI components, useChat hook, dedicated page
