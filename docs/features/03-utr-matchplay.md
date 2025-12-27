# Feature 03: UTR Matchplay

> **Priority:** 🟡 High
> **Dependencies:** Player Database
> **Dependents:** Schedule Manager (Friday slot)

## Overview
Weekly internal matches between academy players organized by UTR (Universal Tennis Rating). Critical for player development and college recruitment.

## Schedule
- **Frequency:** Every Friday
- **Purpose:** Competitive practice matches that affect official UTR ratings

## Matching Algorithm

### Factors to Consider
| Factor | Priority | Description |
|--------|----------|-------------|
| UTR-Based Pairing | High | Similar UTR, with play up/down rotation |
| No Repeat Matches | High | Different opponent than last week |
| Coach Preferences | Medium | Surface preference (clay/hard) |
| Time Availability | High | Player-specific windows |
| Historical Data | Medium | Track all past matchups |

### Play Up / Play Down Logic
- **Play Up:** Face higher UTR → bigger potential rating gain
- **Play Down:** Face lower UTR → expected to win
- Rotate weekly for varied competition

## User Flow

```
1. GENERATE SUGGESTIONS
   System analyzes: UTR, availability, history, preferences
   ↓
2. REVIEW MATCHES
   Display pairings with reasoning
   ↓
3. USER DECISION (per match)
   ├── ✓ HOLD → Lock this match
   └── ✗ REMIX → Regenerate keeping held matches
   ↓
4. REPEAT until all confirmed
   ↓
5. PUBLISH TO SCHEDULE
   Matches appear in Schedule Manager
```

## UI: Match Generation

```
┌─────────────────────────────────────────────────┐
│ UTR MATCHPLAY - Friday Jan 10                   │
├─────────────────────────────────────────────────┤
│ SUGGESTED MATCHES                               │
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Carlos M. (12.45) vs Pablo S. (12.30)      ││
│ │ Court 1 | 14:00 | Clay                      ││
│ │ ✓ Different from last week                 ││
│ │ ↓ Carlos playing DOWN                       ││
│ │                                             ││
│ │ [✓ HOLD] [↻ REMIX]                         ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ ┌─────────────────────────────────────────────┐│
│ │ Sofia R. (11.80) vs Ana P. (12.10)         ││
│ │ Court 2 | 14:00 | Hard                      ││
│ │ ✓ Different from last week                 ││
│ │ ↑ Sofia playing UP                          ││
│ │                                             ││
│ │ [✓ HOLD] [↻ REMIX]                         ││
│ └─────────────────────────────────────────────┘│
│                                                 │
│ [PUBLISH ALL TO SCHEDULE]                      │
└─────────────────────────────────────────────────┘
```

## Data Requirements

### From Player Database
- Current UTR
- Time availability (from notes)
- Surface preference (from coach)
- Tournament schedule (exclude if away)
- Injury status (exclude if injured)

### Track in UTR Matchplay
- All historical matchups
- Win/loss results
- Play up/down rotation

## Database Tables
- `utr_matchplay_weeks`
- `utr_matches`
- `utr_match_history`

## API Endpoints

```
GET    /api/utr-matchplay/weeks              - List weeks
POST   /api/utr-matchplay/weeks              - Create new week
GET    /api/utr-matchplay/weeks/:date        - Get specific week

POST   /api/utr-matchplay/generate           - Generate suggestions
POST   /api/utr-matchplay/remix              - Remix unhold matches
POST   /api/utr-matchplay/publish            - Publish to schedule

GET    /api/utr-matchplay/history/:playerId  - Player's match history
```

## Implementation Phases

### Phase 1: Data & History
- [ ] Create database tables
- [ ] Import existing match history from Excel
- [ ] Track historical matchups

### Phase 2: Algorithm
- [ ] Basic UTR-based pairing
- [ ] No-repeat logic
- [ ] Availability filtering

### Phase 3: UI
- [ ] Match suggestion display
- [ ] Hold/remix interaction
- [ ] Publish flow

### Phase 4: Enhancements
- [ ] Coach preferences
- [ ] Play up/down tracking
- [ ] Surface assignment

## Files to Create
```
src/features/utr-matchplay/
├── README.md
├── components/
│   ├── MatchplayWeek.tsx
│   ├── MatchCard.tsx
│   ├── MatchGenerator.tsx
│   └── MatchHistory.tsx
├── hooks/
│   ├── useMatchplayWeek.ts
│   └── useMatchHistory.ts
├── lib/
│   ├── matchingAlgorithm.ts
│   └── utrCalculations.ts
└── types.ts
```
