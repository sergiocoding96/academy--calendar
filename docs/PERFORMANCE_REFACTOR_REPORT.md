# Performance Refactor Report

**Date:** 2025-02-22  
**Scope:** Next.js app performance improvements without changing features or behavior.

---

## 1. Route inventory

Routes are grouped by section. For each, we note whether the page is a **server** or **client** component and whether **initial data** is passed from server to client to avoid duplicate fetches.

### Auth
| Route | Page type | Data source | Initial data passed |
|-------|-----------|-------------|---------------------|
| `/login` | Server (wraps client form) | Client (AuthProvider) | N/A |
| `/register` | Server (wraps client form) | Client | N/A |

### Dashboard (shell)
| Route | Page type | Data source | Initial data passed |
|-------|-----------|-------------|---------------------|
| `/dashboard` | Server | Server `getUserProfile()` + client `DashboardRedirect` | `serverProfile` |

### Coach dashboard
| Route | Page type | Data source | Initial data passed |
|-------|-----------|-------------|---------------------|
| `/dashboard/coach` | Server | Server `getUserProfile()` + client | N/A |
| `/dashboard/coach/players` | Server | Server `getPlayersServer`, `getCoachesServer` | `initialPlayers`, `initialCoaches` |
| `/dashboard/coach/players/[id]` | Server | Server `getPlayerWithDetailsServer` | `initialPlayer` (via dynamic client) |
| `/dashboard/coach/players/[id]/edit` | Server | Server `getPlayerServer` | `initialPlayer` |
| `/dashboard/coach/players/[id]/notes` | Server | Server `getPlayerWithDetailsServer` | `initialPlayer` |
| `/dashboard/coach/players/[id]/injuries` | Server | Server `getPlayerWithDetailsServer` | `initialPlayer` |
| `/dashboard/coach/players/[id]/training` | Server | Server `getPlayerWithDetailsServer` | `initialPlayer` |
| `/dashboard/coach/players/[id]/whereabouts` | Server | Server `getPlayerServer` | `initialPlayer` |
| `/dashboard/coach/players/[id]/attendance` | Server | Server `getPlayerServer` | `initialPlayer` |
| `/dashboard/coach/players/[id]/utr` | Server | Server `getPlayerServer` | `initialPlayer` |
| `/dashboard/coach/attendance` | Server | Server fetches players | `initialPlayers` |
| `/dashboard/coach/schedule` | Server | Server fetches week, sessions, courts, coaches, players | `initialWeekStart`, `initialSessions`, etc. |
| `/dashboard/coach/approvals` | Server or client | Varies | As per implementation |
| `/dashboard/coach/sessions` | Server or client | Varies | As per implementation |
| `/dashboard/coach/players/[id]/goals` | — | — | — |
| `/dashboard/coach/players/[id]/schedule` | — | — | — |
| `/dashboard/coach/players/[id]/matches` | — | — | — |
| `/dashboard/coach/players/[id]/fitness` | — | — | — |

### Player dashboard
| Route | Page type | Data source | Initial data passed |
|-------|-----------|-------------|---------------------|
| `/dashboard/player` | Server + client | Server profile + client | N/A |
| Other player routes | Varies | Client hooks / server as implemented | Varies |

### Tournaments
| Route | Page type | Data source | Initial data passed |
|-------|-----------|-------------|---------------------|
| `/tournaments` | Server or client | Varies | — |
| `/tournaments/agent` | Server | None (client chat) | N/A (AgentChat loaded via dynamic) |

### Other
| Route | Page type | Data source | Initial data passed |
|-------|-----------|-------------|---------------------|
| `/` (home) | Server | Client (auth) | N/A |
| `/sessions`, `/people`, `/settings`, `/match-analysis`, etc. | Varies | Per route | — |

---

## 2. Data flow summary

### Auth
- **Middleware** (`src/middleware.ts`): Runs on every request (except static assets). Calls `supabase.auth.getUser()` to refresh session and enforce protected routes. Guest mode is allowed via `isGuest` cookie.
- **Layouts**: Coach layout calls `requireRole(['coach', 'admin'])`; player layout calls `requireRole(['player'])`. Both run on the server before rendering children.
- **AuthProvider** (client): Wraps the app; provides `user`, `profile`, `loading`, `isGuest`, and auth actions. Hydrates session and profile on the client after middleware.

### Server data and initial data
- **Player list**: `getPlayersServer()` and `getCoachesServer()` run in the coach players page; results are passed as `initialPlayers` and `initialCoaches` to `CoachPlayersClient` → `PlayerList` / `PlayerForm`. The `usePlayers` hook skips the first client fetch when `initialData` is provided.
- **Player detail**: `getPlayerWithDetailsServer(playerId)` runs in the coach player detail page and in sub-routes (notes, injuries, training). Result is passed as `initialPlayer` to client components; `usePlayer(playerId, { initialData, withDetails: true })` skips the first client fetch.
- **Player (basic)**: `getPlayerServer(playerId)` is used for edit, whereabouts, attendance, and UTR pages; result is passed as `initialPlayer` so `usePlayer(playerId, { initialData })` does not refetch on mount.
- **Schedule**: Coach schedule page fetches the current week’s sessions, courts, coaches, and players on the server and passes them to `WeeklyScheduleClient`. The client uses `useState(initialSessions)` and only fetches again when the user changes week (prev/next).

---

## 3. Changes made

| File(s) | Change | Reason |
|---------|--------|--------|
| `src/app/layout.tsx` | Added `next/font/google` (DM_Sans, Bebas_Neue), applied font variables on `<html>` | Non-blocking font load; same visuals |
| `src/app/globals.css` | Removed `@import url('https://fonts.googleapis.com/...')` | Eliminate blocking font request |
| `tailwind.config.ts` | `fontFamily.sans` and `fontFamily.display` use CSS vars `--font-dm-sans`, `--font-bebas-neue` | Use next/font-generated fonts |
| `src/app/dashboard/loading.tsx` | Added | Instant loading UI while dashboard resolves |
| `src/app/dashboard/coach/loading.tsx` | Added | Skeleton while coach route loads |
| `src/app/dashboard/player/loading.tsx` | Added | Skeleton while player route loads |
| `src/app/tournaments/loading.tsx` | Added | Loading state for tournaments section |
| `src/app/tournaments/agent/page.tsx` | Wrapped `AgentChat` in `next/dynamic` with loading fallback | Code-split heavy chat UI |
| `src/app/dashboard/coach/schedule/page.tsx` | Wrapped `WeeklyScheduleClient` in `next/dynamic` with loading fallback | Code-split heavy schedule UI |
| `src/app/dashboard/coach/players/[id]/page.tsx` | Wrapped `CoachPlayerDetailClient` in `next/dynamic` with loading fallback | Code-split player profile UI |
| `src/features/player-database/lib/queries-server.ts` | Exported `getPlayerServer` | Allow server pages to pass basic player as initial data |
| Coach player sub-routes (notes, injuries, training, edit, whereabouts, attendance, utr) | Converted to server page + client component; server fetches and passes `initialPlayer` | Avoid duplicate client fetch on mount |
| `src/features/player-database/components/PlayerCard.tsx` | Wrapped in `React.memo` | Fewer re-renders when list filters/search change |
| `src/features/player-database/components/PlayerTable.tsx` | Extracted memoized `PlayerTableRow`, removed duplicate constants | Fewer row re-renders on sort/filter |
| `src/app/dashboard/coach/players/coach-players-client.tsx` | Direct imports from `PlayerList`, `PlayerForm` | Smaller route chunk vs barrel |
| `src/app/dashboard/coach/players/[id]/coach-player-detail-client.tsx` | Direct import from `PlayerProfile` | Smaller route chunk vs barrel |
| `src/app/dashboard/coach/attendance/attendance-client.tsx` | Direct import from `QuickAttendance` | Smaller route chunk vs barrel |

---

## 4. What stayed the same

- **Features and URLs:** No new or removed features; all routes and URLs are unchanged.
- **Auth and guest mode:** Middleware, layout role checks, and AuthProvider behavior are unchanged. Guest mode still works via cookie and client state.
- **Data semantics:** Same server queries and client hooks; only the pattern of “server fetches once, client receives initial data” was applied where it was missing to avoid double-fetch.
- **UI and copy:** No intentional changes to layout, styling, or user-facing text.

---

## 5. How to verify

- **Build:** Run `npm run build` and confirm it completes. Optionally compare bundle sizes or build output before/after (e.g. size of coach/player chunks).
- **Manual checks:**
  - Load `/dashboard` and navigate to coach players list: list should appear without a second full fetch of all players (check network tab: no duplicate “players” request on first paint).
  - Open a player detail (`/dashboard/coach/players/[id]`): profile should show using server data; no duplicate `getPlayerWithDetails` on mount.
  - Open notes/injuries/training/whereabouts/attendance/utr for a player: no duplicate player fetch on mount; only whereabouts/attendance/utr-specific requests if any.
  - Navigate to coach schedule: schedule should show from server data; changing week should trigger fetch only for the new week.
  - Open tournament agent: chat UI should load after a short loading state (dynamic import).
- **Loading states:** Navigating between dashboard, coach, and player sections should show the new loading skeletons/spinners instead of a blank screen.

---

## 6. Optional follow-ups

- **Virtualization:** For the player list (grid/table), add list virtualization (e.g. `@tanstack/react-virtual` or `react-window`) when the list is large (e.g. 50+ players) to reduce DOM and render cost.
- **Middleware/session:** Document that middleware runs on every matched request and calls `getUser()`. If needed later, consider caching or narrowing the matcher only where auth is required (no change made in this refactor to avoid security/consistency risk).
- **More granular dynamic imports:** Add `next/dynamic` to other heavy client components (e.g. modals, forms) that are not above-the-fold on key routes.
- **Further direct imports:** Replace more barrel imports with direct component imports on other heavy routes to keep route chunks minimal.
