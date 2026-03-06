# Academy Calendar

A tennis academy management app with Supabase (auth + database), coach/player dashboards, and an AI tournament agent. Multi-role authentication (admin, coach, player).

## Environment variables

Copy `.env.example` to `.env.local` and fill in values.

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `GOOGLE_API_KEY` | No | AI agent (Gemini); chat returns 503 if missing |
| `CRON_SECRET` | No | For `/api/agent/scrape` cron; required in production for GET |
| `SCRAPFLY_API_KEY` | No | External tournament scraping; optional, fallback to cache |

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — ESLint
- `npm run type-check` — TypeScript check (no emit)
