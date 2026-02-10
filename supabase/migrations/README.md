# Supabase migrations

Run migrations in order (by filename timestamp) on a database that already has `schema.sql` applied.

**Apply Phase 1 (Schedule Manager):**
- In Supabase Dashboard → SQL Editor, paste and run the contents of `20250205120000_schedule_manager_phase1.sql`.

Or with Supabase CLI: `supabase db push` (if linked).
