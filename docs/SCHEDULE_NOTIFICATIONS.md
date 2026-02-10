# Schedule Manager — Notifications

**Current setup:** Slack via **Supabase Edge Function** `notify-slack`. No n8n.

- When a player marks **absent**, the API calls `notify-slack` with event `absence` → message posted to Slack.
- When a schedule change is **approved** or **rejected**, the API calls `notify-slack` with event `schedule_change_reviewed` → message posted to Slack.

**Setup:** Deploy the function, then set Supabase secrets `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID`. See `supabase/functions/notify-slack/README.md`.

---

## Option A: n8n (alternative)

1. **Trigger:** Supabase node — "Row added" or "Row updated" on table `session_players`, with filter:
   - `status` = `absent`
   - (optional) `absent_at` is not null

   Or use a **Webhook** trigger: from your app, after the absence API updates the row, call the n8n webhook URL with payload:
   - `session_id`, `player_id`, `player_name`, `session_date`, `session_time`, `reason`

2. **Actions:** Slack node (post to channel or DM) and/or Email node. Message example:
   - "**Absence:** [Player name] won't attend [date] [time] — [reason]."

3. **Secrets:** Store Slack token / webhook URL and email credentials in n8n.

**If using webhook from the app:** Add a call to your n8n webhook at the end of `POST /api/schedule/sessions/[sessionId]/absent` (after successful update), passing session and player details so n8n can format the message.

---

## Option B: Supabase Edge Function

1. Create an Edge Function that:
   - Is triggered by a **Database webhook** (Supabase Dashboard → Database → Webhooks) on `session_players` when `status` is updated to `absent`.
   - Or is invoked by your Next.js API after updating the row (invoke via `supabase.functions.invoke('notify-absence', { body: { ... } })`).

2. Inside the function: fetch session + player details if needed, then call Slack API and/or send email (e.g. Resend, SendGrid).

3. Store Slack token and email credentials in Supabase secrets.

---

## Option C: Call n8n webhook from the API

In `src/app/api/schedule/sessions/[sessionId]/absent/route.ts`, after a successful update:

1. Fetch session details (date, time) and player name (from `players` or `user_profiles`).
2. `await fetch(process.env.N8N_ABSENCE_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify({ ... }) })`.
3. Add to `.env.local`:
   - `N8N_ABSENCE_WEBHOOK_URL` — n8n webhook URL for absence events (optional; if set, the absence API calls it after a successful update).
   - `N8N_SCHEDULE_CHANGE_WEBHOOK_URL` — n8n webhook URL for schedule change approval/rejection (optional; if set, the change-request PATCH calls it when a request is approved or rejected).

n8n workflow: Webhook trigger → Slack/Email nodes.

---

## Auto-escalation (optional)

If a change request stays **pending** for too long (e.g. 2 hours), the system can:

- Notify a secondary approver (e.g. via n8n webhook or Supabase Edge Function triggered by a cron).
- Or auto-approve low-risk changes and send a notification.

Implement with: Supabase cron (pg_cron) or external cron calling an API that lists pending requests older than X hours and either notifies or auto-approves.

---

## Realtime (optional)

Use **Supabase Realtime** on `schedule_change_requests` and `session_players` so UIs update when someone else approves a change or marks absent, without refreshing.
