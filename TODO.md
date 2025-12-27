# Academy Calendar - TODO

> **⚠️ UPDATE THIS FILE AFTER EVERY TASK COMPLETION**
> - Mark completed items with [x]
> - Add new tasks discovered during implementation
> - Move items between sections as priorities change
> - Add time estimates when starting a task

---

## 🔥 Current Sprint
> What we're working on RIGHT NOW

| Task | Feature | Status | Est. Hours | Notes |
|------|---------|--------|------------|-------|
| _Add your current task here_ | | 🔄 In Progress | | |

---

## 📋 Backlog - Phase 1: Foundation

### Player Database (Core)
- [ ] Create Supabase tables for players schema
- [ ] Create training_loads table
- [ ] Create injuries table
- [ ] Create player_notes table
- [ ] Create whereabouts table
- [ ] Create utr_history table
- [ ] Create attendance table
- [ ] Set up Row Level Security policies
- [ ] Generate TypeScript types from schema
- [ ] Build player list view component
- [ ] Build player profile page
- [ ] Build training load entry form
- [ ] Build injury reporting form
- [ ] Build notes management UI
- [ ] Build whereabouts/calendar entry
- [ ] Implement player search/filter
- [ ] Add player profile photo upload

### Schedule Manager (Core)
- [ ] Create master_schedule table
- [ ] Create master_schedule_players table
- [ ] Create weekly_schedules table
- [ ] Create schedule_sessions table
- [ ] Create session_players table
- [ ] Create schedule_change_requests table
- [ ] Create schedule_audit_log table
- [ ] Build master schedule template editor
- [ ] Build weekly schedule view (calendar)
- [ ] Build session detail view
- [ ] Implement auto-removal based on whereabouts
- [ ] Implement auto-removal for injuries
- [ ] Build "suggest mode" for coaches
- [ ] Build manager approval dashboard
- [ ] Implement approve/reject workflow
- [ ] Add player notifications for schedule changes
- [ ] Build player's "my schedule" view

---

## 📋 Backlog - Phase 2: Features

### UTR Matchplay
- [ ] Create utr_matchplay_weeks table
- [ ] Create utr_matches table
- [ ] Build matching algorithm
- [ ] Implement coach preferences (surface)
- [ ] Implement time availability constraints
- [ ] Implement "no repeat opponent" logic
- [ ] Build match suggestion UI
- [ ] Build hold/remix functionality
- [ ] Connect to Schedule Manager

### Tournament Calendar Agent
- [ ] Research Spanish federation websites to scrape
- [ ] Build tournament scraper (RFET)
- [ ] Build tournament scraper (regional federations)
- [ ] Create discovered_tournaments table
- [ ] Create academy_tournaments table
- [ ] Create tournament_registrations table
- [ ] Create tournament_matches table
- [ ] Build unified calendar UI with filters
- [ ] Build "add to academy" flow
- [ ] Build logistics management form
- [ ] Implement cost calculator (fuel + depreciation)
- [ ] Implement cost splitting logic
- [ ] Build player confirmation flow
- [ ] Build results entry form (holds/breaks)
- [ ] Research fuel price API for Spain

### Van & Card Manager
- [ ] Create vehicles table
- [ ] Create business_cards table
- [ ] Create vehicle_assignments table
- [ ] Create locations table
- [ ] Create location_distances table
- [ ] Build van status dashboard
- [ ] Build card tracker
- [ ] Build assignment UI
- [ ] Implement conflict detection
- [ ] Build calendar view for van schedules
- [ ] Connect to Tournament Agent

### Dartfish Analytics
- [ ] Research Dartfish CSV export format
- [ ] Create dartfish_imports table
- [ ] Create match_events table
- [ ] Create match_analyses table
- [ ] Create chart_templates table
- [ ] Create player_analytics_trends table
- [ ] Build CSV upload and parser
- [ ] Build AI analysis prompt engineering
- [ ] Build dynamic chart generation
- [ ] Build chart template library
- [ ] Build analytics tab in player profile
- [ ] Implement trend tracking

---

## 📋 Backlog - Phase 3: Integrations

### Slack Integration
- [ ] Set up Slack app
- [ ] Implement message parsing (natural language)
- [ ] Connect to schedule change requests
- [ ] Implement confirmation posting
- [ ] Build "find replacement" suggestions

### WhatsApp/Telegram Integration
- [ ] Decide platform (WhatsApp Business vs Telegram)
- [ ] Set up bot
- [ ] Implement tournament Q&A
- [ ] Implement PDF schedule parsing
- [ ] Implement result auto-posting
- [ ] Implement reminders

### Deep Research Agent (Tournaments)
- [ ] Design scraping architecture
- [ ] Implement rate limiting / politeness
- [ ] Set up scheduled scraping jobs
- [ ] Handle different federation formats

---

## ✅ Completed
> Move items here when done, with completion date

| Task | Feature | Completed | Notes |
|------|---------|-----------|-------|
| Initial repo setup | Setup | ✅ _[date]_ | Basic Next.js + Supabase |
| Documentation structure | Docs | ✅ 2025-12-27 | Feature specs created |

---

## 🐛 Bugs
> Track bugs discovered during development

| Bug | Severity | Feature | Status | Notes |
|-----|----------|---------|--------|-------|
| _None yet_ | | | | |

---

## 💡 Ideas / Future Enhancements
> Things that came up but aren't priority yet

- [ ] UTR API integration (research if available)
- [ ] GPS tracking for vans
- [ ] Receipt OCR for expense management
- [ ] Video timestamp linking in Dartfish analytics
- [ ] Mobile app (React Native)
- [ ] Parent portal for viewing player progress
- [ ] Automated practice plans based on analytics

---

## 📊 Progress Tracking

### Phase 1: Foundation
```
Player Database:  [░░░░░░░░░░] 0%
Schedule Manager: [░░░░░░░░░░] 0%
```

### Phase 2: Features
```
UTR Matchplay:    [░░░░░░░░░░] 0%
Tournament Agent: [░░░░░░░░░░] 0%
Van Manager:      [░░░░░░░░░░] 0%
Dartfish:         [░░░░░░░░░░] 0%
```

### Phase 3: Integrations
```
Slack:            [░░░░░░░░░░] 0%
WhatsApp/TG:      [░░░░░░░░░░] 0%
Deep Research:    [░░░░░░░░░░] 0%
```

---

## 📅 Session Log
> Brief log of work sessions

| Date | Duration | Focus | Outcome |
|------|----------|-------|---------|
| 2025-12-27 | 1h | Initial Setup | Documentation structure, Claude Code setup |

---

_Last updated: 2025-12-27 by Claude Code_
