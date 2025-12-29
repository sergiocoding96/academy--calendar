# Tournament Calendar Integration - Feature Plan

## Overview
Enhanced tournament calendar with source selection, date-based scraping, player assignments, and change tracking for cancelled/updated tournaments.

**Branch:** `feature/tournament-calendar-integration`
**Created:** 2025-12-29
**Status:** Planning

---

## Feature Requirements

### 1. Sources Selector
- Multi-select dropdown for tournament circuits (15 available sources)
- Group by type: HTTP (free) vs Scrapfly (requires API)
- Show circuit metadata: name, categories supported, region
- Persist user preferences

### 2. Date Range Selector
- From/To date picker for scraping window
- Default: current week + 8 weeks ahead
- Quick presets: This month, Next 3 months, Custom range
- Validation: min 1 week, max 6 months

### 3. Enhanced Tournament Calendar Display
- Show all tournament details inline:
  - Name, dates, location, venue
  - Category, level, surface
  - Entry deadline, draw size, entry fee
  - Registration status (open/closed/full)
- Visual indicators for tournament status
- Click to expand for full details

### 4. Player Assignment System
- Inside tournament detail modal:
  - "Add Players" button opens player selector
  - Multi-select players by category
  - Show player availability conflicts
  - Cost share calculation preview
- "Add to Calendar" button:
  - Creates `academy_tournament` entry
  - Links to `discovered_tournament`
  - Creates `tournament_registrations` for each player
  - Updates player `whereabouts` table

### 5. Change Detection & Refresh
- "Refresh" button to re-scrape selected sources/dates
- Compare scraped data with existing `discovered_tournaments`
- Visual indicators:
  - **[UPDATE]** badge - Yellow, data changed
  - **[CANCELLED]** badge - Grey, tournament removed from source
  - **[NEW]** badge - Green, newly discovered
- Change log showing what changed (dates, venue, etc.)
- Notification system for tournaments academy has registered for

---

## Technical Architecture

### Database Changes
```sql
-- Add change tracking to discovered_tournaments
ALTER TABLE discovered_tournaments ADD COLUMN
  previous_data JSONB,
  change_type TEXT CHECK (change_type IN ('new', 'updated', 'cancelled', 'unchanged')),
  change_detected_at TIMESTAMPTZ,
  change_summary TEXT;

-- Add notification preferences
CREATE TABLE tournament_watch_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discovered_tournament_id UUID REFERENCES discovered_tournaments(id),
  academy_tournament_id UUID REFERENCES academy_tournaments(id),
  notify_on_change BOOLEAN DEFAULT true,
  notify_on_cancel BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### New Components
```
src/components/tournament/
├── sources-selector.tsx      # Multi-select for circuits
├── date-range-picker.tsx     # From/To date selection
├── tournament-card.tsx       # Enhanced tournament display
├── tournament-detail-modal.tsx # Full details + player assignment
├── player-assignment.tsx     # Player selector for tournaments
├── change-indicator.tsx      # UPDATE/CANCELLED/NEW badges
└── refresh-button.tsx        # Re-scrape trigger with status
```

### New Hooks
```
src/hooks/tournament/
├── use-tournament-sources.ts    # Circuit selection state
├── use-tournament-scraper.ts    # Scraping with progress
├── use-tournament-changes.ts    # Change detection
├── use-player-assignment.ts     # Player selection for tournament
└── use-tournament-calendar.ts   # Calendar data with filters
```

### New Server Actions
```
src/lib/agent/actions/
├── scrape-actions.ts            # On-demand scraping
├── change-detection-actions.ts  # Compare & detect changes
└── assignment-actions.ts        # Player-tournament assignments
```

---

## Implementation Phases

### Phase 1: UI Foundation (Sources & Date Selection)
**Goal:** Build the filtering UI for tournament discovery

#### Tasks:
1. **Create SourcesSelector component**
   - [ ] Fetch circuits from `circuits-config.ts`
   - [ ] Group by HTTP vs Scrapfly
   - [ ] Multi-select with checkboxes
   - [ ] "Select All" / "Clear All" buttons
   - [ ] Show category icons per circuit
   - **Tools:** Read, Edit, Write
   - **MCP:** None
   - **Subagent:** frontend-architect (for component design)

2. **Create DateRangePicker component**
   - [ ] From/To date inputs with calendar popover
   - [ ] Quick preset buttons (This month, 3 months, 6 months)
   - [ ] Validation (min 1 week, max 6 months)
   - [ ] Use `date-fns` for date manipulation
   - **Tools:** Read, Edit, Write
   - **Subagent:** frontend-architect

3. **Create useTournamentSources hook**
   - [ ] State management for selected circuits
   - [ ] Persist to localStorage
   - [ ] Filter circuits by category
   - **Tools:** Write
   - **Subagent:** None

4. **Update tournament calendar page layout**
   - [ ] Add filter bar with Sources + Date selectors
   - [ ] Responsive layout (filters collapse on mobile)
   - [ ] Loading states during filter changes
   - **Tools:** Read, Edit
   - **Subagent:** frontend-architect

5. **Documentation updates**
   - [ ] Update CLAUDE.md with Phase 1 status
   - [ ] Update TODO.md with completed tasks
   - **Tools:** Edit

#### Deliverables:
- `src/components/tournament/sources-selector.tsx`
- `src/components/tournament/date-range-picker.tsx`
- `src/hooks/tournament/use-tournament-sources.ts`
- Updated `src/app/tournaments/page.tsx`

---

### Phase 2: Enhanced Tournament Display
**Goal:** Rich tournament cards with full information

#### Tasks:
1. **Create TournamentCard component**
   - [ ] Display all tournament fields
   - [ ] Category/level/surface badges
   - [ ] Entry deadline countdown
   - [ ] Registration status indicator
   - [ ] Expandable details section
   - **Tools:** Read, Edit, Write
   - **Subagent:** frontend-architect

2. **Create TournamentDetailModal component**
   - [ ] Full tournament information
   - [ ] Map/location preview (optional)
   - [ ] Entry requirements section
   - [ ] "Add to Academy Calendar" button
   - [ ] Close on Escape/backdrop click
   - **Tools:** Write
   - **Subagent:** frontend-architect

3. **Update tournament-calendar.tsx**
   - [ ] Replace simple display with TournamentCard
   - [ ] Add click handler for modal
   - [ ] Improve grid layout for new cards
   - **Tools:** Read, Edit
   - **Subagent:** None

4. **Create useTournamentCalendar hook**
   - [ ] Fetch tournaments with filters (sources, dates)
   - [ ] Sort by date, group by week
   - [ ] Handle loading/error states
   - **Tools:** Write
   - **MCP:** Supabase (for queries)
   - **Subagent:** database-architect (for query optimization)

5. **Documentation updates**
   - [ ] Update CLAUDE.md with Phase 2 status
   - [ ] Update TODO.md
   - **Tools:** Edit

#### Deliverables:
- `src/components/tournament/tournament-card.tsx`
- `src/components/tournament/tournament-detail-modal.tsx`
- `src/hooks/tournament/use-tournament-calendar.ts`
- Updated `src/components/tournament/tournament-calendar.tsx`

---

### Phase 3: On-Demand Scraping
**Goal:** Allow coaches to trigger scraping for selected sources/dates

#### Tasks:
1. **Create scrape-actions.ts server actions**
   - [ ] `scrapeCircuits(circuitIds, dateRange)` - Main scrape function
   - [ ] `getScrapingStatus(jobId)` - Check progress
   - [ ] Use existing scraper modules
   - [ ] Rate limiting per circuit
   - **Tools:** Read, Write
   - **MCP:** Supabase (for storing results)
   - **Subagent:** backend-service-architect

2. **Create RefreshButton component**
   - [ ] Trigger scraping for current filters
   - [ ] Show progress indicator (X of Y circuits)
   - [ ] Display results summary
   - [ ] Error handling with retry option
   - **Tools:** Write
   - **Subagent:** frontend-architect

3. **Create useTournamentScraper hook**
   - [ ] Manage scraping state (idle/running/complete/error)
   - [ ] Track progress per circuit
   - [ ] Handle partial failures
   - [ ] Auto-refresh calendar on complete
   - **Tools:** Write
   - **Subagent:** None

4. **Create /api/tournaments/scrape endpoint**
   - [ ] POST endpoint for on-demand scraping
   - [ ] Accept circuit IDs and date range
   - [ ] Return job ID for progress tracking
   - [ ] Use streaming for real-time updates
   - **Tools:** Write
   - **MCP:** None
   - **Subagent:** backend-service-architect

5. **Documentation updates**
   - [ ] Update CLAUDE.md with Phase 3 status
   - [ ] Update TODO.md
   - **Tools:** Edit

#### Deliverables:
- `src/lib/agent/actions/scrape-actions.ts`
- `src/components/tournament/refresh-button.tsx`
- `src/hooks/tournament/use-tournament-scraper.ts`
- `src/app/api/tournaments/scrape/route.ts`

---

### Phase 4: Player Assignment System
**Goal:** Allow coaches to assign players to tournaments

#### Tasks:
1. **Create PlayerAssignment component**
   - [ ] Multi-select player list
   - [ ] Filter by category (match tournament)
   - [ ] Show player availability status
   - [ ] Cost share preview
   - [ ] Confirm button
   - **Tools:** Write
   - **Subagent:** frontend-architect

2. **Create assignment-actions.ts server actions**
   - [ ] `assignPlayersToTournament(tournamentId, playerIds)`
   - [ ] `removePlayerFromTournament(tournamentId, playerId)`
   - [ ] `addTournamentToCalendar(discoveredTournamentId, assignments)`
   - [ ] Create academy_tournament + registrations
   - [ ] Update player whereabouts
   - **Tools:** Write
   - **MCP:** Supabase (for mutations)
   - **Subagent:** database-architect

3. **Create usePlayerAssignment hook**
   - [ ] Fetch eligible players for tournament category
   - [ ] Track selected players
   - [ ] Check availability conflicts
   - [ ] Calculate cost shares
   - **Tools:** Write
   - **MCP:** Supabase
   - **Subagent:** None

4. **Update TournamentDetailModal**
   - [ ] Add "Assign Players" section
   - [ ] Show current assignments
   - [ ] "Add to Academy Calendar" workflow
   - [ ] Success/error feedback
   - **Tools:** Read, Edit
   - **Subagent:** frontend-architect

5. **Documentation updates**
   - [ ] Update CLAUDE.md with Phase 4 status
   - [ ] Update TODO.md
   - **Tools:** Edit

#### Deliverables:
- `src/components/tournament/player-assignment.tsx`
- `src/lib/agent/actions/assignment-actions.ts`
- `src/hooks/tournament/use-player-assignment.ts`
- Updated `src/components/tournament/tournament-detail-modal.tsx`

---

### Phase 5: Change Detection & Notifications
**Goal:** Track tournament changes and notify coaches

#### Tasks:
1. **Database migration for change tracking**
   - [ ] Add columns to discovered_tournaments
   - [ ] Create tournament_watch_list table
   - [ ] Add indexes for change queries
   - **Tools:** Write
   - **MCP:** Supabase (apply_migration)
   - **Subagent:** database-architect

2. **Create change-detection-actions.ts**
   - [ ] `detectChanges(scrapedData, existingData)` - Compare function
   - [ ] `markTournamentChanged(id, changeType, summary)`
   - [ ] `getChangedTournaments(since)` - List recent changes
   - [ ] `notifyWatchers(tournamentId)` - Send notifications
   - **Tools:** Write
   - **MCP:** Supabase
   - **Subagent:** backend-service-architect

3. **Create ChangeIndicator component**
   - [ ] [NEW] - Green badge for new tournaments
   - [ ] [UPDATE] - Yellow badge with tooltip showing changes
   - [ ] [CANCELLED] - Grey badge, strikethrough text
   - [ ] Click to see change details
   - **Tools:** Write
   - **Subagent:** frontend-architect

4. **Create useTournamentChanges hook**
   - [ ] Fetch changed tournaments
   - [ ] Filter by change type
   - [ ] Mark as reviewed
   - [ ] Subscribe to real-time updates
   - **Tools:** Write
   - **MCP:** Supabase (realtime)
   - **Subagent:** None

5. **Update RefreshButton with change detection**
   - [ ] After scrape, run change detection
   - [ ] Show summary of changes found
   - [ ] Highlight changed tournaments in calendar
   - **Tools:** Read, Edit
   - **Subagent:** None

6. **Documentation updates**
   - [ ] Update CLAUDE.md with Phase 5 status
   - [ ] Update TODO.md
   - **Tools:** Edit

#### Deliverables:
- Database migration: `add_tournament_change_tracking`
- `src/lib/agent/actions/change-detection-actions.ts`
- `src/components/tournament/change-indicator.tsx`
- `src/hooks/tournament/use-tournament-changes.ts`
- Updated refresh functionality

---

### Phase 6: Testing & Polish
**Goal:** Ensure quality and handle edge cases

#### Tasks:
1. **Test all components**
   - [ ] Unit tests for hooks
   - [ ] Integration tests for server actions
   - [ ] E2E test for full workflow
   - **Tools:** Write, Bash (npm test)
   - **Subagent:** test-strategist

2. **Security review**
   - [ ] RLS policies for new tables
   - [ ] Input validation
   - [ ] Rate limiting on scrape endpoint
   - **Tools:** Read, Edit
   - **MCP:** Supabase (get_advisors)
   - **Subagent:** security-guardian

3. **Performance optimization**
   - [ ] Optimize tournament queries
   - [ ] Add proper indexes
   - [ ] Implement pagination for large results
   - **Tools:** Read, Edit
   - **MCP:** Supabase
   - **Subagent:** database-architect

4. **Documentation**
   - [ ] Update CLAUDE.md - Final status
   - [ ] Update TODO.md - Mark feature complete
   - [ ] Add user documentation if needed
   - **Tools:** Edit
   - **Subagent:** documentation-specialist

#### Deliverables:
- Test files
- Security policies
- Performance improvements
- Final documentation

---

## Tools & Resources Summary

### MCP Servers Used:
| MCP | Purpose |
|-----|---------|
| Supabase | Database queries, migrations, RLS policies, real-time |
| GitHub | PR creation, branch management, issues |

### Subagents to Invoke:
| Subagent | When to Use |
|----------|-------------|
| frontend-architect | All UI component design/review |
| backend-service-architect | Server actions, API endpoints |
| database-architect | Schema design, query optimization |
| test-strategist | Writing tests after each phase |
| security-guardian | Security review in Phase 6 |
| documentation-specialist | Final documentation |

### Key Skills:
| Skill | Purpose |
|-------|---------|
| /commit | After each phase completion |

### Core Tools:
- Read, Edit, Write - File operations
- Bash - npm commands, git operations
- Glob, Grep - Code search
- WebFetch - External API research if needed

---

## Success Criteria

1. **Sources Selector** - Coach can select any combination of 15 circuits
2. **Date Range** - Coach can specify custom date window for scraping
3. **Rich Display** - All tournament info visible in calendar
4. **Player Assignment** - Coach can add players with one click
5. **Add to Calendar** - Creates proper database entries
6. **Change Detection** - Visual indicators for updates/cancellations
7. **Refresh** - On-demand re-scraping works reliably
8. **Performance** - Calendar loads in < 2 seconds
9. **Mobile Friendly** - Responsive design works on tablets

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Scrapfly API rate limits | Implement queue with exponential backoff |
| Large number of tournaments | Virtual scrolling or pagination |
| Stale data | Auto-refresh option + manual refresh |
| Player conflicts | Clear conflict indicators before assignment |
| Schema changes breaking existing data | Careful migrations with defaults |

---

## Estimated Effort

| Phase | Complexity | Components |
|-------|------------|------------|
| Phase 1 | Medium | 3 components, 1 hook |
| Phase 2 | Medium | 2 components, 1 hook |
| Phase 3 | High | 1 component, 1 hook, 1 API route, 1 action file |
| Phase 4 | High | 1 component, 1 hook, 1 action file |
| Phase 5 | High | 1 migration, 1 component, 1 hook, 1 action file |
| Phase 6 | Medium | Tests, security, polish |

**Total: 8 new components, 5 new hooks, 3 action files, 1 API route, 1 migration**
