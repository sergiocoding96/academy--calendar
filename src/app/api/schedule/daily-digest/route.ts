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
    player: { name: string } | { name: string }[] | null
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

  const activeSessions = sessions.filter((s) => !s.notes?.includes('[Cancelled]'))
  const cancelledSessions = sessions.filter((s) => s.notes?.includes('[Cancelled]'))

  let msg = `:calendar: *Daily Schedule — ${dateLabel}*\n`
  msg += `> _${activeSessions.length} active session${activeSessions.length === 1 ? '' : 's'}`
  if (cancelledSessions.length > 0) {
    msg += `, ${cancelledSessions.length} cancelled`
  }
  msg += `_\n\n`

  const sorted = [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time))

  for (const s of sorted) {
    const isCancelled = s.notes?.includes('[Cancelled]')
    const court = unwrap(s.court)
    const coach = unwrap(s.coach)
    const sessionType = (s.session_type || 'session').replace(/_/g, ' ')

    if (isCancelled) {
      msg += `:no_entry_sign: ~${formatTime(s.start_time)} – ${formatTime(s.end_time)}  |  ${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}`
      if (court?.name) msg += `  |  ${court.name}`
      if (coach?.name) msg += `  |  ${coach.name}`
      msg += `~ _(cancelled)_\n\n`
      continue
    }

    msg += `:clock3: *${formatTime(s.start_time)} – ${formatTime(s.end_time)}*`
    msg += `  |  *${sessionType.charAt(0).toUpperCase() + sessionType.slice(1)}*`
    if (court?.name) msg += `  |  :round_pushpin: ${court.name}`
    if (coach?.name) msg += `  |  :bust_in_silhouette: ${coach.name}`
    msg += `\n`

    const players = (s.session_players || [])
      .filter((sp) => sp.status !== 'cancelled')
      .map((sp) => {
        const p = unwrap(sp.player)
        const name = p?.name || 'Unknown'
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

function buildWeeklyMessage(weekStart: string, sessions: SessionRow[]): string {
  const weekEnd = new Date(weekStart + 'T00:00:00')
  weekEnd.setDate(weekEnd.getDate() + 6)
  const startLabel = new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endLabel = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  if (sessions.length === 0) {
    return `:clipboard: *Weekly Schedule — ${startLabel} – ${endLabel}*\n\nNo sessions scheduled this week. :beach_with_umbrella:`
  }

  const activeSessions = sessions.filter((s) => !s.notes?.includes('[Cancelled]'))
  const cancelledSessions = sessions.filter((s) => s.notes?.includes('[Cancelled]'))

  let msg = `:clipboard: *Weekly Schedule — ${startLabel} – ${endLabel}*\n`
  msg += `> _${activeSessions.length} active session${activeSessions.length === 1 ? '' : 's'}`
  if (cancelledSessions.length > 0) {
    msg += `, ${cancelledSessions.length} cancelled`
  }
  msg += `_\n\n`

  // Group by date
  const byDate: Record<string, SessionRow[]> = {}
  for (const s of sessions) {
    if (!byDate[s.date]) byDate[s.date] = []
    byDate[s.date].push(s)
  }

  const sortedDates = Object.keys(byDate).sort()
  for (const date of sortedDates) {
    const dayLabel = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    const daySessions = byDate[date].sort((a, b) => a.start_time.localeCompare(b.start_time))
    const dayActive = daySessions.filter((s) => !s.notes?.includes('[Cancelled]'))

    msg += `:calendar: *${dayLabel}* — ${dayActive.length} session${dayActive.length === 1 ? '' : 's'}\n`

    for (const s of daySessions) {
      const isCancelled = s.notes?.includes('[Cancelled]')
      const court = unwrap(s.court)
      const coach = unwrap(s.coach)
      const sessionType = (s.session_type || 'session').replace(/_/g, ' ')

      if (isCancelled) {
        msg += `>  :no_entry_sign: ~${formatTime(s.start_time)} – ${formatTime(s.end_time)} | ${sessionType}~\n`
        continue
      }

      msg += `>  :clock3: ${formatTime(s.start_time)} – ${formatTime(s.end_time)} | ${sessionType}`
      if (court?.name) msg += ` | ${court.name}`
      if (coach?.name) msg += ` | ${coach.name}`

      const playerNames = (s.session_players || [])
        .filter((sp) => sp.status !== 'cancelled')
        .map((sp) => unwrap(sp.player)?.name || 'Unknown')
      if (playerNames.length > 0) {
        msg += ` — ${playerNames.join(', ')}`
      }
      msg += `\n`
    }
    msg += `\n`
  }

  return msg.trimEnd()
}

async function fetchSessions(supabase: any, dateFilter: { eq?: string; gte?: string; lte?: string }) {
  let query = (supabase as any)
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
        player:players(name)
      )
    `)
    .order('start_time', { ascending: true })

  if (dateFilter.eq) query = query.eq('date', dateFilter.eq)
  if (dateFilter.gte) query = query.gte('date', dateFilter.gte)
  if (dateFilter.lte) query = query.lte('date', dateFilter.lte)

  return query
}

async function postToSlack(text: string): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.SLACK_BOT_TOKEN
  const channel = process.env.SLACK_CHANNEL_ID
  if (!token || !channel) {
    return { ok: false, error: 'SLACK_BOT_TOKEN or SLACK_CHANNEL_ID not set' }
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
    return { ok: false, error: slackData.error ?? 'Slack API error' }
  }
  return { ok: true }
}

export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mode = new URL(req.url).searchParams.get('mode')
  const supabase = await createClient()

  if (mode === 'weekly') {
    // Weekly digest — current week (Monday to Sunday)
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(now)
    monday.setDate(diff)
    const weekStart = monday.toISOString().slice(0, 10)
    const sunday = new Date(monday)
    sunday.setDate(sunday.getDate() + 6)
    const weekEnd = sunday.toISOString().slice(0, 10)

    const { data: sessions, error } = await fetchSessions(supabase, { gte: weekStart, lte: weekEnd })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const text = buildWeeklyMessage(weekStart, (sessions as SessionRow[]) || [])
    const result = await postToSlack(text)
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.error?.includes('not set') ? 500 : 502 })
    }

    const active = ((sessions as SessionRow[]) || []).filter((s) => !s.notes?.includes('[Cancelled]')).length
    return NextResponse.json({ ok: true, week_start: weekStart, session_count: active, total: sessions?.length ?? 0 })
  }

  // Default: daily digest
  const today = new Date().toISOString().slice(0, 10)
  const { data: sessions, error } = await fetchSessions(supabase, { eq: today })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const allSessions = (sessions as SessionRow[]) || []
  const text = buildSlackMessage(today, allSessions)
  const result = await postToSlack(text)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.error?.includes('not set') ? 500 : 502 })
  }

  const active = allSessions.filter((s) => !s.notes?.includes('[Cancelled]')).length
  return NextResponse.json({ ok: true, date: today, session_count: active, total: allSessions.length })
}

// Allow POST too (for manual triggers)
export { GET as POST }
