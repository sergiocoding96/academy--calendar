# Academy Calendar - Documentation

## 📁 Structure

```
docs/
├── README.md              ← You are here
├── DATABASE_SCHEMA.md     ← Complete Supabase schema
├── features/              ← Feature specifications
│   ├── 01-player-database.md
│   ├── 02-schedule-manager.md
│   ├── 03-utr-matchplay.md
│   ├── 04-tournament-agent.md
│   ├── 05-dartfish-analytics.md
│   └── 06-van-manager.md
└── materials/             ← Current Excel files, screenshots, etc.
```

## 🔧 Working with Claude Code

### Starting a New Feature

1. **Create a worktree:**
   ```bash
   ./scripts/setup-worktree.sh player-database
   cd ../academy-calendar--player-database
   ```

2. **Update CLAUDE.md** with current feature:
   ```markdown
   ## 🎯 ACTIVE FEATURE
   CURRENT: Player Database
   SPEC: docs/features/01-player-database.md
   BRANCH: feature/player-database
   ```

3. **Start Claude Code:**
   ```bash
   claude
   ```

4. **Tell Claude what you're working on:**
   ```
   "I'm working on the Player Database feature.
    Read docs/features/01-player-database.md for context.
    Let's start with creating the Supabase tables."
   ```

### During Development

Claude Code will:
- Read CLAUDE.md for global context
- Reference the feature spec when needed
- Update TODO.md after completing tasks
- Use MCPs for database operations, GitHub, etc.

### After Completing a Task

Claude should automatically:
1. ✅ Mark task complete in TODO.md
2. 📝 Add any new tasks discovered
3. 📊 Update progress tracking
4. 💾 Commit with conventional commit message

### When Feature is Done

1. **Merge to main:**
   ```bash
   git checkout main
   git merge feature/player-database
   ```

2. **Remove worktree:**
   ```bash
   git worktree remove ../academy-calendar--player-database
   ```

3. **Update progress in TODO.md**

## 📋 Feature Build Order

```
1. Player Database ──────────────────────────▶ CORE
   (all other features depend on this)

2. Schedule Manager ─────────────────────────▶ CORE
   (depends on Player Database)

3. UTR Matchplay ────────────────────────────▶ HIGH
   (depends on Player Database)

4. Tournament Agent ─────────────────────────▶ HIGH
   (depends on Player Database, Van Manager)

5. Van Manager ──────────────────────────────▶ MEDIUM
   (integrates with Tournament Agent)

6. Dartfish Analytics ───────────────────────▶ MEDIUM
   (depends on Player Database)
```

## 🔌 MCPs & Tools to Use

When working with Claude Code, leverage these:

| Tool | Use For |
|------|---------|
| **Supabase MCP** | Database operations, migrations, queries |
| **GitHub MCP** | Issues, PRs, branch management |
| **Brave Search** | API documentation, library research |
| **Filesystem** | File operations |

### Example Prompts Using MCPs

```
"Use the Supabase MCP to create the players table
 from docs/DATABASE_SCHEMA.md"

"Use GitHub MCP to create an issue for the
 training load entry form"

"Search for the best React chart library for
 tennis analytics dashboards"
```

## 📝 Updating Documentation

### When to Update CLAUDE.md
- Architecture decisions made
- New patterns established
- Tech debt discovered
- Known issues found

### When to Update TODO.md
- After EVERY task completion
- When discovering new tasks
- When priorities change
- After completing a sprint

### When to Update Feature Specs
- Requirements clarification
- Scope changes
- Implementation notes
- API changes

## 🎯 Quick Reference

### Conventional Commits
```
feat(player-db): add injury tracking form
fix(schedule): correct timezone handling
docs(readme): update setup instructions
refactor(api): extract queries to module
```

### Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run type-check   # TypeScript check

# Supabase
npx supabase gen types typescript > src/types/database.ts
npx supabase db push
npx supabase db reset
```

### File Locations
```
Feature code:     src/features/<feature-name>/
API routes:       src/app/api/
Shared components: src/components/
Types:            src/types/
Utilities:        src/lib/
```
