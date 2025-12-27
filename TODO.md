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
| Player Database UI | Player Database | ✅ COMPLETE | - | All phases done |
| Security fixes (RLS policies) | Player Database | ⏳ Pending | - | See CLAUDE.md for audit findings |

---

## 📋 Backlog - Phase 1: Foundation

### Player Database (Core) ✅ COMPLETE
- [x] Create Supabase tables for players schema ✅ (30 tables created)
- [x] Create training_loads table ✅
- [x] Create injuries table ✅
- [x] Create player_notes table ✅
- [x] Create whereabouts table ✅
- [x] Create utr_history table ✅
- [x] Create attendance table ✅
- [x] Set up Row Level Security policies ✅
- [x] Generate TypeScript types from schema ✅
- [x] Create data hooks (8 hooks) ✅ Phase 2.2 complete
- [x] Build player list view component ✅ Phase 3.1
- [x] Build player profile page ✅ Phase 3.2
- [x] Build training load entry form ✅ Phase 3.3
- [x] Build injury reporting form ✅ Phase 3.3
- [x] Build notes management UI ✅ Phase 3.3
- [x] Build whereabouts/calendar entry ✅ Phase 3.3
- [x] Implement player search/filter ✅ Phase 3.1
- [x] Add UTR tracking & analytics ✅ Phase 5.1
- [x] Add attendance integration ✅ Phase 5.2
- [x] Security audit completed ✅ Phase 6
- [ ] (Future) Add player profile photo upload

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
| Player Database UI | Player Database | ✅ 2025-12-27 | All phases complete (2.1-6) |
| Data hooks (8 hooks) | Player Database | ✅ 2025-12-27 | usePlayer, usePlayers, useTrainingLoads, useInjuries, usePlayerNotes, useWhereabouts, useUtrHistory, useAttendance |
| UI Components (21+) | Player Database | ✅ 2025-12-27 | List, profile, forms, UTR, attendance |
| Coach Dashboard Pages | Player Database | ✅ 2025-12-27 | Players list, detail, training, injuries, notes, whereabouts, UTR, attendance |
| Player Dashboard Pages | Player Database | ✅ 2025-12-27 | Training, injuries, whereabouts |
| Security Audit | Player Database | ✅ 2025-12-27 | Documented findings in CLAUDE.md |

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
Player Database:  [██████████] 100% ✅ COMPLETE
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
| 2025-12-27 | 2h | Player Database | Phase 2.1-2.2: Feature folder structure, 8 data hooks |
| 2025-12-27 | 3h | Player Database | Phase 3.1-3.3: All list, profile, and form components |
| 2025-12-27 | 2h | Player Database | Phase 4.1-4.2: Coach and player dashboard pages |
| 2025-12-27 | 2h | Player Database | Phase 5.1-5.2: UTR tracking and attendance integration |
| 2025-12-27 | 1h | Player Database | Phase 6: Security audit and documentation |

---

_Last updated: 2025-12-27 by Claude Code_
