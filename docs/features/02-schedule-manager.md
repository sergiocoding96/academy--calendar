# Feature 02: Schedule Manager (CORE)

> **Priority:** 🔴 Critical - Build Second
> **Dependencies:** Player Database
> **Dependents:** UTR Matchplay, Tournament Agent

## Overview
The Schedule Manager is the **operational hub** where all player data translates into actual daily/weekly training schedules. It combines information from the Player Database (whereabouts, loads, injuries, tournaments) with a repeating master schedule, then allows coaches to request changes through an approval workflow.

## Core Concepts

### 1. Master Schedule (Template)
A weekly template that repeats, defining the standard structure:
- Day of week, time slots
- Session type (Individual, Dual, Group)
- Assigned coach
- Assigned courts
- Default players

### 2. Weekly Instance
Each week, the master schedule generates a **weekly instance** that can be modified.

### 3. Session Types
| Type | Description |
|------|-------------|
| **Individual** | 1 player, 1 coach |
| **Dual** | 2 players, 1 coach |
| **Group** | Multiple players, 1+ coaches |

## Current Pain Point (to solve)
```
Coach request on Slack
       ↓
Someone sees it manually
       ↓
Updates Google Sheet
       ↓
Another person updates calendar
       ↓
Another person updates player app

⚠️ Error-prone, slow, multiple manual steps
```

## New Workflow
```
Coach request (Slack OR Web App)
       ↓
Creates pending change request
       ↓
Manager approves in dashboard
       ↓
System auto-updates:
  ✓ Database
  ✓ Calendar
  ✓ Player App
  ✓ Notifications sent
```

## Automatic Schedule Intelligence

### Player Database Integration
| Data | Schedule Impact |
|------|-----------------|
| Tournament this week | Auto-remove from sessions |
| Holiday | Auto-remove from sessions |
| Active injury | Auto-remove from sessions |
| High load (RPE) | ⚠️ Alert coach (doesn't auto-remove) |
| Player notes | System respects constraints |

### Visual Indicators
```
👤 Carlos M.        ✓ Confirmed
👤 Miguel A.        🏖️ Holiday (auto-removed)
👤 Sofia R.         🩹 Injured (auto-removed)
👤 Ana P.           ⚠️ High load (coach alert)
👤 Emma S.          ✈️ Tournament (auto-removed)
```

## Change Request System

### Two Input Methods

#### Option A: Slack Agent (Natural Language)
```
Coach: "Remove Carlos from Tuesday 3 PM, he has tournament Thursday"

Agent: "Got it! Created change requests:
        ❌ Remove: Carlos from Tue 15:00 Group B
        Pending manager approval."
```

#### Option B: Web App (Suggest Mode)
Coach clicks to add/remove players, submits for approval.

### Manager Approval Dashboard
```
┌─────────────────────────────────────────────────┐
│ PENDING CHANGES (3)                             │
├─────────────────────────────────────────────────┤
│ ❌ REMOVE: Carlos M.                            │
│    Session: Tue Jan 7, 15:00 Group B           │
│    Reason: "Tournament preparation"             │
│    From: Coach Roberto (Slack)                  │
│                                                 │
│    📊 Context:                                  │
│    • Has tournament Jan 9                      │
│    • Load: 6.2 (normal)                        │
│    • No injuries                               │
│                                                 │
│    [✓ APPROVE] [✗ REJECT] [💬 DISCUSS]        │
└─────────────────────────────────────────────────┘
```

## After Approval

1. **Database** — Schedule record updated
2. **Calendar** — View reflects change
3. **Player Notification** — "Your Tuesday session cancelled"
4. **Slack Confirmation** — "✅ Approved by @Manager"
5. **Audit Log** — Who, what, when, why

## Player View

```
┌─────────────────────────────────────────────────┐
│ MY SCHEDULE - Carlos M.                         │
├─────────────────────────────────────────────────┤
│ MONDAY, JAN 6                                   │
│ ┌─────────────────────────────────────────────┐│
│ │ 14:00-15:30 | Individual | Court 3          ││
│ │ Coach Roberto                               ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ TUESDAY, JAN 7                                  │
│ ┌─────────────────────────────────────────────┐│
│ │ 🚫 Session Cancelled                        ││
│ │ Reason: Tournament preparation              ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ THURSDAY-SUNDAY                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ 🏆 Copa de Campeones - Barcelona            ││
│ └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## Slack Agent Commands

| Command | Example |
|---------|---------|
| Remove player | "Remove Carlos from Tuesday 3 PM" |
| Add player | "Add David to Tuesday 3 PM Group B" |
| Swap players | "Swap Ana and Lucas on Monday/Wednesday" |
| Move session | "Move Carlos's individual to Thursday" |
| Cancel session | "Cancel Group A tomorrow" |
| Check availability | "Is Court 3 free Friday 2 PM?" |
| Show schedule | "Show me tomorrow's schedule" |
| Who's training | "Who's in Group B on Tuesday?" |

## API Endpoints

```
GET    /api/schedule/master           - Get master schedule template
POST   /api/schedule/master           - Create master schedule slot
PATCH  /api/schedule/master/:id       - Update master slot

GET    /api/schedule/week/:date       - Get week's schedule
POST   /api/schedule/week/generate    - Generate week from master

GET    /api/schedule/sessions/:id     - Get session details
PATCH  /api/schedule/sessions/:id     - Update session

POST   /api/schedule/change-requests  - Create change request
GET    /api/schedule/change-requests  - List pending requests
PATCH  /api/schedule/change-requests/:id - Approve/reject

GET    /api/players/:id/schedule      - Player's schedule view
```

## Database Tables
See `docs/DATABASE_SCHEMA.md`:
- `master_schedule`
- `master_schedule_players`
- `weekly_schedules`
- `schedule_sessions`
- `session_players`
- `schedule_change_requests`
- `schedule_audit_log`

## Implementation Phases

### Phase 1: Core Schedule
- [ ] Create database tables
- [ ] Master schedule CRUD
- [ ] Weekly generation from master

### Phase 2: Views
- [ ] Calendar view (weekly/daily)
- [ ] Session detail view
- [ ] Player schedule view

### Phase 3: Intelligence
- [ ] Auto-removal (whereabouts, injuries)
- [ ] Load alerts
- [ ] Availability checking

### Phase 4: Change Requests
- [ ] Web app suggest mode
- [ ] Approval dashboard
- [ ] Notifications

### Phase 5: Slack Integration
- [ ] Natural language parsing
- [ ] Request creation
- [ ] Confirmations

## Files to Create
```
src/features/schedule-manager/
├── README.md
├── components/
│   ├── MasterScheduleEditor.tsx
│   ├── WeeklyCalendar.tsx
│   ├── DailyView.tsx
│   ├── SessionCard.tsx
│   ├── SessionDetail.tsx
│   ├── ChangeRequestForm.tsx
│   ├── ApprovalDashboard.tsx
│   └── PlayerScheduleView.tsx
├── hooks/
│   ├── useMasterSchedule.ts
│   ├── useWeeklySchedule.ts
│   ├── useChangeRequests.ts
│   └── useSessionPlayers.ts
├── lib/
│   ├── scheduleGenerator.ts
│   ├── availabilityChecker.ts
│   └── slackParser.ts
└── types.ts
```
