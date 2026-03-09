/**
 * Pure functions for building Slack messages from schedule sessions.
 * Extracted from route.ts for testability and reuse.
 */

export type SessionRow = {
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

export function unwrap<T>(val: T | T[] | null): T | null {
  if (Array.isArray(val)) return val[0] ?? null
  return val
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  if (isNaN(hour)) return time
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m || '00'} ${ampm}`
}

export function buildSlackMessage(dateStr: string, sessions: SessionRow[]): string {
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

export function buildWeeklyMessage(weekStart: string, sessions: SessionRow[]): string {
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
