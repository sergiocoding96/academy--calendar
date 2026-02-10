# notify-slack

Posts schedule events (absence, schedule change approved/rejected) to Slack.

## Deploy

```bash
supabase functions deploy notify-slack
```

## Secrets (Supabase Dashboard → Project Settings → Edge Functions)

| Secret | Description |
|--------|-------------|
| `SLACK_BOT_TOKEN` | Slack Bot User OAuth Token (starts with `xoxb-`) |
| `SLACK_CHANNEL_ID` | Slack channel ID (e.g. `C01234ABCD`) — right-click channel → View channel details → copy ID |

## Events

- **absence** — When a player marks "Can't attend". Message: player name, date, time, reason.
- **schedule_change_reviewed** — When a change request is approved or rejected. Message: status, change type, reason (and reject reason if rejected).

The Next.js API calls this function via `supabase.functions.invoke('notify-slack', { body: { event, ... } })`.
