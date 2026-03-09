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
import { buildSlackMessage, buildWeeklyMessage, type SessionRow } from './message-builder'

export const runtime = 'nodejs'

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return true // no secret configured — allow (dev mode)
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

async function fetchSessions(supabase: Awaited<ReturnType<typeof createClient>>, dateFilter: { eq?: string; gte?: string; lte?: string }) {
  let query = supabase
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
