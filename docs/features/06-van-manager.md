# Feature 06: Van & Card Manager

> **Priority:** 🟢 Medium
> **Dependencies:** Tournament Agent (for auto-blocking)
> **Dependents:** Tournament cost calculations

## Overview
Simple resource tracking for:
- **4 vehicles** — Where is each van? When available?
- **3 business cards** — Which cards are at base vs. with coaches?

## Resources

### Vehicles
| Van | Capacity | Notes |
|-----|----------|-------|
| Van 1 | 9 | Main transport |
| Van 2 | 9 | Main transport |
| Van 3 | 7 | Smaller |
| Van 4 | 7 | Smaller |

### Business Cards
| Card | Type |
|------|------|
| Card #1 | Academy |
| Card #2 | Academy |
| Card #3 | Academy |

## Locations

```
Regular Season:          Summer Season:

┌────────────┐           ┌────────────┐
│   TENNIS   │           │   TENNIS   │
│    CLUB    │           │    CLUB    │
│  (Base 1)  │           │  (Base 1)  │
└─────┬──────┘           └─────┬──────┘
      │                        │
      ▼                        ▼
┌────────────┐           ┌────────────┐
│    GYM     │           │    GYM     │
│  (Base 2)  │           │  (Base 2)  │
└────────────┘           └─────┬──────┘
                               │
                               ▼
                         ┌────────────┐
                         │  SUMMER    │
                         │ LOCATION   │
                         │  (Base 3)  │
                         └────────────┘

+ TOURNAMENTS (external)
```

## Van Status Dashboard

```
┌─────────────────────────────────────────────────┐
│ 🚐 VAN TRACKER                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│ VAN 1                           🔴 UNAVAILABLE │
│ 📍 Barcelona (Copa de Campeones)               │
│ 👤 Coach Roberto | 💳 Card #2                   │
│ 🔙 Returns: Jan 14, ~8 PM                      │
│                                                 │
│ VAN 2                           🟢 AVAILABLE   │
│ 📍 Tennis Club                                 │
│ [ASSIGN TO TRIP]                               │
│                                                 │
│ VAN 3                           🟡 IN TRANSIT  │
│ 📍 Club → Gym (player transport)               │
│ 👤 Coach María | ⏱️ ETA: 15 min                │
│                                                 │
│ VAN 4                           🟢 AVAILABLE   │
│ 📍 Gym                                         │
│ [ASSIGN TO TRIP]                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Card Tracker

```
┌─────────────────────────────────────────────────┐
│ 💳 CARD TRACKER                                 │
├─────────────────────────────────────────────────┤
│ CARD #1                         🟢 AT BASE     │
│ 📍 Club office                                 │
│                                                 │
│ CARD #2                         🔴 WITH COACH  │
│ 📍 Barcelona | 👤 Coach Roberto                │
│ 🔙 Returns: Jan 14                             │
│                                                 │
│ CARD #3                         🟢 AT BASE     │
│ 📍 Club office                                 │
└─────────────────────────────────────────────────┘
```

## Features

### Tournament Assignment
When creating tournament:
- Select van from available
- Assign card
- Auto-blocks both for tournament duration

### Quick Trip (Daily Transport)
```
Van: [Van 2 ▼]
Driver: [Coach María ▼]
Route: [Club → Gym ▼]
Time: [14:30]
[START TRIP]
```

### Calendar View
Weekly/monthly view of all van schedules with availability

### Conflict Detection
```
⚠️ Van 1 already assigned to:
   Madrid Tournament (Jan 8-12)

   Overlaps with your request.

   Available: Van 2 ✓, Van 4 ✓
```

## Integration Points

### From Tournament Agent
- Tournament created with van → auto-block dates
- Card assigned → auto-block

### To Tournament Cost Calculator
- Van assigned → distance calculated
- Fuel + depreciation → added to costs

## Database Tables
- `vehicles`
- `business_cards`
- `vehicle_assignments`
- `locations`
- `location_distances`
- `expenses`

## Implementation Phases

### Phase 1: Basic Tracking
- [ ] Vehicle/card CRUD
- [ ] Status dashboard
- [ ] Manual status updates

### Phase 2: Assignments
- [ ] Tournament assignment
- [ ] Daily transport trips
- [ ] Date blocking

### Phase 3: Calendar
- [ ] Weekly view
- [ ] Conflict detection

### Phase 4: Expenses (Future)
- [ ] Receipt upload
- [ ] Link to tournaments
- [ ] Expense reporting

## Files to Create
```
src/features/van-manager/
├── README.md
├── components/
│   ├── VanDashboard.tsx
│   ├── VanCard.tsx
│   ├── CardTracker.tsx
│   ├── AssignmentForm.tsx
│   ├── QuickTripForm.tsx
│   └── VanCalendar.tsx
├── hooks/
│   ├── useVehicles.ts
│   ├── useCards.ts
│   └── useAssignments.ts
└── types.ts
```
