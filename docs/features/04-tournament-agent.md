# Feature 04: Tournament Calendar Agent

> **Priority:** 🟡 High
> **Dependencies:** Player Database, Van Manager
> **Dependents:** Player whereabouts

## Overview
Comprehensive tournament management combining:
1. AI-powered tournament discovery (scraping Spanish federation calendars)
2. Logistics management (hotels, transport, costs)
3. Player coordination (confirmations, results, schedules)
4. Communication hub (WhatsApp/Telegram integration)

## Problem Being Solved
Coaches spend hours manually checking multiple Spanish tennis federation calendars for different age categories, then coordinating logistics separately. Multiple systems, lots of manual work.

## Components

### 1. Deep Research Agent (Tournament Discovery)
Scrape federation websites:
- RFET (Real Federación Española de Tenis)
- Regional federations (Cataluña, Madrid, Valencia, etc.)
- ITF Junior Calendar

**Output:** Unified calendar with filters by category, level, region, dates

### 2. Logistics Management
When academy adds a tournament:
- Coach in charge
- Hotel selection + cost
- Transport method (van/train/etc.)
- Automatic cost calculation:
  - Fuel (current prices × distance)
  - Van depreciation (€/km)
  - Total split by players

### 3. Player Confirmation Flow
Players see in app:
- Tournament details
- Their cost share
- [I'M GOING] / [NOT GOING] buttons

After confirmation → updates whereabouts → affects schedule

### 4. Results & Match Tracking
Players enter during tournament:
- Round, opponent, score
- Service holds, breaks
- → Feeds into Dartfish Analytics

### 5. WhatsApp/Telegram Bot
- Answer questions with tournament context
- Parse PDF schedules → notify players of match times
- Auto-post results
- Send reminders

### 6. Van Integration
When tournament uses van → auto-block in Van Manager

## Cost Calculator Example

```
🏨 ACCOMMODATION
   Hotel Catalonia: €85/night × 4 nights × 3 rooms = €1,020

🚐 TRANSPORT (Van)
   Distance: 312 km × 2 (round trip) = 624 km
   Fuel: 624 × 0.085 L/km × €1.45/L = €76.88
   Depreciation: 624 × €0.12/km = €74.88
   Total transport: €151.76

🎾 ENTRY FEES
   €35 × 5 players = €175

💰 TOTAL: €1,346.76
📊 Per player (5): €269.35
```

## Database Tables
- `discovered_tournaments`
- `academy_tournaments`
- `tournament_registrations`
- `tournament_matches`
- `chat_messages`

## Implementation Phases

### Phase 1: Manual Tournament Entry
- [ ] Create tournament form
- [ ] Basic logistics fields
- [ ] Player registration

### Phase 2: Cost Calculator
- [ ] Distance calculation
- [ ] Fuel cost (with price API)
- [ ] Cost splitting

### Phase 3: Player Flow
- [ ] Confirmation UI
- [ ] Results entry
- [ ] Holds/breaks tracking

### Phase 4: Discovery Agent
- [ ] Scraper for RFET
- [ ] Unified calendar view
- [ ] "Add to academy" flow

### Phase 5: Communication
- [ ] WhatsApp/Telegram bot
- [ ] PDF parsing
- [ ] Auto-posting

## Files to Create
```
src/features/tournament-agent/
├── README.md
├── components/
│   ├── TournamentCalendar.tsx
│   ├── TournamentForm.tsx
│   ├── CostCalculator.tsx
│   ├── PlayerRegistration.tsx
│   ├── MatchResultForm.tsx
│   └── TournamentChat.tsx
├── hooks/
│   ├── useTournaments.ts
│   ├── useRegistrations.ts
│   └── useCostCalculator.ts
├── lib/
│   ├── scrapers/
│   │   ├── rfet.ts
│   │   └── itf.ts
│   ├── costCalculator.ts
│   └── chatBot.ts
└── types.ts
```
