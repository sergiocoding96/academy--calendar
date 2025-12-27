# Feature 05: Dartfish Analytics Agent

> **Priority:** 🟢 Medium
> **Dependencies:** Player Database
> **Dependents:** None (enriches Player Database)

## Overview
Transform Dartfish CSV match tagging data into:
1. AI-powered insights (natural language analysis)
2. Dynamic charts (auto-generated visualizations)
3. Chart template library (pre-built tennis analytics)
4. Automated reports (stored in Player Database)

## Data Flow

```
Dartfish CSV Export
       ↓
Upload to System
       ↓
Parse & Structure Events
       ↓
AI Analysis Engine
       ↓
Generate Insights + Charts
       ↓
Store in Player Profile
```

## CSV Import

### Typical Dartfish Structure
```csv
Time,Duration,Event,Player,Position,Result,Direction,Speed
00:02:15,0:03,Serve,Player1,Deuce,Ace,Wide,185
00:02:45,0:08,Rally,Player1,Baseline,Winner,Cross,
```

### Import Form
- Select player
- Match type (Tournament/UTR/Practice)
- Link to tournament/match if applicable
- Upload CSV file

## AI Analysis Output

```
📊 KEY INSIGHTS

STRENGTHS:
• First serve % improved to 68% in 3rd set (clutch performance)
• Cross-court forehand: 73% win rate
• Net approaches effective: Won 8/11 net points

AREAS FOR IMPROVEMENT:
• Second serve attackable: Lost 62% of 2nd serve points
• Backhand DTL: 7 unforced errors (highest error source)
• Deuce side return: Only 41% in play

💡 RECOMMENDATION:
Focus on: (1) Second serve placement, (2) Backhand DTL consistency
```

## Chart System

### Auto-Generated Charts
AI detects interesting patterns and creates relevant visualizations:
- Serve % by set (bar chart)
- Winner/Error by shot type
- Rally length distribution
- Court position heatmap

### Template Library
Pre-built templates coaches use most:
| Template | Use Case |
|----------|----------|
| Serve Analysis | Every match |
| Rally Length | Tactical analysis |
| Winner/Error Breakdown | Strengths/weaknesses |
| Pressure Points | Mental game |
| Set-by-Set Comparison | Stamina analysis |

### Custom Template Builder
Create new chart types → save as template → reuse

## Player Profile Integration

Analytics tab shows:
- Recent analyzed matches
- AI summaries
- Trend tracking (last 5, 10, 30 matches)
- Focus areas identified by AI

## Database Tables
- `dartfish_imports`
- `match_events`
- `match_analyses`
- `chart_templates`
- `player_analytics_trends`

## Implementation Phases

### Phase 1: CSV Import
- [ ] Upload interface
- [ ] CSV parser
- [ ] Event storage

### Phase 2: AI Analysis
- [ ] Prompt engineering for tennis
- [ ] Insight generation
- [ ] Recommendations

### Phase 3: Charts
- [ ] Base chart components
- [ ] Template library
- [ ] Dynamic generation

### Phase 4: Integration
- [ ] Analytics tab in player profile
- [ ] Trend tracking
- [ ] Coach alerts

## Files to Create
```
src/features/dartfish-analytics/
├── README.md
├── components/
│   ├── CsvUploader.tsx
│   ├── MatchAnalysis.tsx
│   ├── InsightsCard.tsx
│   ├── DynamicChart.tsx
│   ├── ChartTemplateLibrary.tsx
│   └── TrendDisplay.tsx
├── hooks/
│   ├── useDartfishImport.ts
│   ├── useMatchAnalysis.ts
│   └── usePlayerTrends.ts
├── lib/
│   ├── csvParser.ts
│   ├── analysisPrompts.ts
│   └── chartGenerator.ts
└── types.ts
```

## Research Needed
- [ ] Get sample Dartfish CSV exports
- [ ] Confirm key metrics coaches want
- [ ] Chart library decision (Recharts vs Chart.js)
