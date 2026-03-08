/**
 * Daily Schedule Digest — posts today's sessions to Slack at 5 AM UTC.
 *
 * Triggered by Vercel Cron:
 *   vercel.json → { "crons": [{ "path": "/api/schedule/daily-digest", "schedule": "0 5 * * *" }] }
 *
 * Can also be triggered manually via POST with the CRON_SECRET header.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // no secret configured — allow (dev mode)
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  if (isNaN(hour)) return time
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m || '00'} ${ampm}`
}

type SessionRow = {
  id: string
  date: string
  start_time: string
  end_time: string
  session_type: string
  notes: string | null
  court: { name: string } | { name: string }[] | null
  coach: { name: string } | { name: string }[] | null
  session_players: {
    status: string
    player: { full_name: string; name: string } | { full_name: string; name: string }[] | null
  }[]
}

function unwrap<T>(val: T | T[] | null): T | null {
  if (Array.isArray(val)) return val[0] ?? null
  return val
}

function buildSlackMessage(dateStr: string, sessions: SessionRow[]): string {
  const dateLabel = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (sessions.length === 0) {
    return `:calendar: *Daily Schedule — ${dateLabel}*\n\nNo sessions scheduled for today. :beach_with_umbrella:`
  }

  let msg = `:calendar: *Daily Schedule — ${dateLabel}*\n`
  msg += `> _${sessions.length} session${sessions.length === 1 ? '' : 's'} today_\n\n`

  // Sort by start_time
  const sorted = [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time))

  for (const s of sorted) {
    const isCancelled = s.notes?.includes('[Cancelled]')
    if (isCancelled) continue // skip cancelled sessions

    const court = unwrap(s.court)
    const coach = unwrap(s.coach)
    const sessionType = (s.session_type || 'session').replace(/_/g, ' ')

    msg += `:clock3: *${formatTime(s.start_time)} – ${formatTime(s.end_time)}*`
    msg += `  |  *${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}*`
    if (court?.name) msg += `  |  :round_pushpin: ${court.name}`
    if (coach?.name) msg += `  |  :bust_in_silhouette: ${coach.name}`
    msg += `\n`

    // List players
    const players = (s.session_players || [])
      .filter((sp) => sp.status !== 'cancelled')
      .map((sp) => {
        const p = unwrap(sp.player)
        const name = p?.full_name || p?.name || 'Unknown'
        if (sp.status === 'absent') return `~${name}~ _(absent)_`
        return name
      })

    if (players.length > 0) {
      msg += `>  :busts_in_silhouette: ${players.join(', ')}\n`
    } else {
      msg += `>  _No players assigned_\n`
    }
    msg += `\n`
  }

  return msg.trimEnd()
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data: sessions, error } = await (supabase as any)
    .from('sessions')
    .select(`
      id,
      date,
      start_time,
      end_time,
      session_type,
      notes,
      court:courts(name),
      coach:coaches(name),
      session_players(
        status,
        player:players(full_name, name)
      )
    `)
    .eq('date', today)
    .order('start_time', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const text = buildSlackMessage(today, (sessions as SessionRow[]) || [])

  // Post to Slack directly
  const token = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_CHANNEL_ID
  if (!token || !channel) {
    return NextResponse.json({ error: 'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set' }, { status: 500 })
  }

  const slackRes = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  })
  const slackData = await slackRes.json().catch(() => ({}))
  if (!slackData.ok) {
    return NextResponse.json({ error: slackData.error ?? 'Slack API error' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, date: today, session_count: sessions?.length ?? 0 })
}

// Allow POST too (for manual triggers)
export { GET as POST }
