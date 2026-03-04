// Supabase Edge Function: post schedule events to Slack
// Set secrets: SLACK_BOT_TOKEN, SLACK_CHANNEL_ID (e.g. C01234ABCD)
// Declare Deno for TypeScript when compiled outside the Deno runtime
declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response> | Response) => void
  env: { get(name: string): string | undefined }
}

const SLACK_API = 'https://slack.com/api/chat.postMessage'

function formatTime(time: string | undefined): string {
  if (!time) return '?'
  const [h, m] = String(time).split(':')
  const hour = parseInt(h, 10)
  if (isNaN(hour)) return time
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m || '00'} ${ampm}`
}

function buildMessage(payload: Record<string, unknown>): string {
  const event = (payload.event as string) ?? 'unknown'
  if (event === 'absence') {
    const player = (payload.player_name as string) ?? 'Player'
    const date = (payload.session_date as string) ?? '?'
    const time = formatTime(payload.session_time as string)
    const reason = (payload.reason as string) ?? ''
    return `*Absence:* ${player} won't attend ${date} ${time} — ${reason}`
  }
  if (event === 'schedule_change_reviewed') {
    const status = (payload.status as string) ?? 'reviewed'
    const changeType = ((payload.change_type as string) ?? 'change').replace(/_/g, ' ')
    const reason = (payload.reason as string) ?? ''
    const rejectReason = payload.reject_reason as string | undefined
    if (status === 'rejected' && rejectReason) {
      return `*Schedule change rejected:* ${changeType}. Request reason: ${reason}. Reject reason: ${rejectReason}`
    }
    return `*Schedule change ${status}:* ${changeType}. Reason: ${reason}`
  }
  return `Event: ${event}`
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }
  const token = Deno.env.get('SLACK_BOT_TOKEN')
  const channel = Deno.env.get('SLACK_CHANNEL_ID')
  if (!token || !channel) {
    return jsonResponse({ error: 'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set' }, 500)
  }
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400)
  }
  if (!payload || typeof payload !== 'object') {
    return jsonResponse({ error: 'Body must be a JSON object' }, 400)
  }
  const text = buildMessage(payload)
  const res = await fetch(SLACK_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.ok) {
    return jsonResponse({ error: data.error ?? 'Slack API error' }, 502)
  }
  return jsonResponse({ ok: true }, 200)
})
