'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight, Edit3 } from 'lucide-react'
import { Modal } from '@/components/ui/modal'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatTime(time: string) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

type Session = {
  id: string
  date: string
  start_time: string
  end_time: string
  session_type: string
  notes?: string
  court?: { id: string; name: string } | null
  coach?: { id: string; name: string } | null
  session_players?: Array<{ id: string; player_id: string; status: string; absent_reason?: string; player?: { id: string; name: string } }>
}

type Props = {
  initialWeekStart: string
  initialSessions: Session[]
  courts: { id: string; name: string }[]
  coaches: { id: string; name: string }[]
  players: { id: string; name: string }[]
}

export function WeeklyScheduleClient({ initialWeekStart, initialSessions, courts, coaches, players }: Props) {
  const router = useRouter()
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const [sessions, setSessions] = useState(initialSessions)
  const [proposeOpen, setProposeOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [changeType, setChangeType] = useState<string>('cancel_session')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  const [addPlayerOpen, setAddPlayerOpen] = useState(false)
  const [addPlayerSession, setAddPlayerSession] = useState<Session | null>(null)
  const [addPlayerSelectedId, setAddPlayerSelectedId] = useState('')
  const [addPlayerReason, setAddPlayerReason] = useState('')
  const [addPlayerSubmitting, setAddPlayerSubmitting] = useState(false)
  const [addPlayerError, setAddPlayerError] = useState<string | null>(null)

  const loadWeek = async (start: string) => {
    const res = await fetch(`/api/schedule/week?week=${start}`)
    if (res.ok) {
      const data = await res.json()
      setSessions(data)
    }
  }

  const prevWeek = () => {
    const prev = addDays(weekStart, -7)
    setWeekStart(prev)
    loadWeek(prev)
  }

  const nextWeek = () => {
    const next = addDays(weekStart, 7)
    setWeekStart(next)
    loadWeek(next)
  }

  const openPropose = (session: Session, type: string) => {
    setSelectedSession(session)
    setChangeType(type)
    setReason('')
    setError(null)
    setProposeOpen(true)
  }

  const openAddPlayer = (session: Session) => {
    setAddPlayerSession(session)
    setAddPlayerSelectedId('')
    setAddPlayerReason('')
    setAddPlayerError(null)
    setAddPlayerOpen(true)
  }

  const submitAddPlayer = async () => {
    if (!addPlayerSession?.id || !addPlayerSelectedId || !addPlayerReason.trim()) {
      setAddPlayerError('Select a player and enter a reason')
      return
    }
    setAddPlayerSubmitting(true)
    setAddPlayerError(null)
    try {
      const res = await fetch('/api/schedule/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change_type: 'add_player',
          target_session_id: addPlayerSession.id,
          reason: addPlayerReason.trim(),
          proposed_payload: { player_id: addPlayerSelectedId },
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAddPlayerError(data.error || 'Failed to create request')
        return
      }
      setAddPlayerOpen(false)
      setAddPlayerSession(null)
      await loadWeek(weekStart)
      router.refresh()
    } finally {
      setAddPlayerSubmitting(false)
    }
  }

  const generateWeek = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/schedule/week', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ week_start: weekStart }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to generate week')
        return
      }
      await loadWeek(weekStart)
      router.refresh()
    } finally {
      setGenerating(false)
    }
  }

  const submitPropose = async () => {
    if (!selectedSession?.id || !reason.trim()) {
      setError('Reason is required')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload: Record<string, unknown> = {}
      if (changeType === 'move_time') {
        payload.start_time = selectedSession.start_time
        payload.end_time = selectedSession.end_time
      }
      if (changeType === 'change_court' && selectedSession.court?.id) {
        payload.court_id = selectedSession.court.id
      }
      const res = await fetch('/api/schedule/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          change_type: changeType,
          target_session_id: selectedSession.id,
          reason: reason.trim(),
          proposed_payload: Object.keys(payload).length ? payload : undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed to create request')
        return
      }
      setProposeOpen(false)
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const sessionsByDate: Record<string, Session[]> = {}
  sessions.forEach((s) => {
    if (!sessionsByDate[s.date]) sessionsByDate[s.date] = []
    sessionsByDate[s.date].push(s)
  })

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevWeek}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-medium text-stone-800 min-w-[200px] text-center">
            {formatDate(weekStart)} – {formatDate(addDays(weekStart, 6))}
          </span>
          <button
            type="button"
            onClick={nextWeek}
            className="p-2 rounded-lg border border-stone-200 hover:bg-stone-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-stone-500">{sessions.length} sessions this week</p>
          <button
            type="button"
            onClick={generateWeek}
            disabled={generating}
            className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 text-sm font-medium"
          >
            {generating ? 'Generating...' : 'Generate from template'}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-stone-200">
          {weekDates.map((date) => (
            <div key={date} className="min-h-[120px]">
              <div className="p-3 border-b border-stone-200 bg-stone-50 text-center">
                <p className="text-xs text-stone-500">{DAYS[(() => { const d = new Date(date + 'T00:00:00').getDay(); return d === 0 ? 6 : d - 1; })()]}</p>
                <p className="font-medium text-stone-800">{date.slice(8)}</p>
              </div>
              <div className="p-2 space-y-2">
                {(sessionsByDate[date] || []).map((session) => (
                  <div
                    key={session.id}
                    className="p-2 rounded-lg border border-stone-200 bg-white text-xs"
                  >
                    <p className="font-medium text-stone-800">{formatTime(session.start_time)}</p>
                    <p className="text-stone-500 truncate">{session.session_type}</p>
                    <p className="text-stone-500 truncate">{session.court?.name || '—'}</p>
                    {session.session_players && session.session_players.length > 0 && (
                      <p className="text-stone-500 truncate mt-0.5">
                        {session.session_players.map((sp) => (sp.player as { name?: string; full_name?: string })?.name ?? (sp.player as { full_name?: string })?.full_name ?? '—').join(', ')}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => openAddPlayer(session)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        + Player
                      </button>
                      <button
                        type="button"
                        onClick={() => openPropose(session, 'cancel_session')}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => openPropose(session, 'move_time')}
                        className="text-stone-600 hover:text-stone-800"
                      >
                        Move
                      </button>
                      <button
                        type="button"
                        onClick={() => openPropose(session, 'change_court')}
                        className="text-stone-600 hover:text-stone-800"
                      >
                        Court
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={proposeOpen}
        onClose={() => !submitting && setProposeOpen(false)}
        title="Propose schedule change"
        description={selectedSession ? `${selectedSession.session_type} – ${selectedSession.date} ${formatTime(selectedSession.start_time)}` : undefined}
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Change type: <strong>{changeType.replace('_', ' ')}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Court resurfacing, weather, coach unavailable"
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500"
              disabled={submitting}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setProposeOpen(false)}
              disabled={submitting}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitPropose}
              disabled={submitting || !reason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit for approval'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={addPlayerOpen}
        onClose={() => !addPlayerSubmitting && setAddPlayerOpen(false)}
        title="Assign player to session"
        description={addPlayerSession ? `${addPlayerSession.session_type} – ${addPlayerSession.date} ${formatTime(addPlayerSession.start_time)}` : undefined}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Player *</label>
            {(() => {
              const alreadyInSession = addPlayerSession?.session_players?.map((sp) => sp.player_id) ?? []
              const availablePlayers = players.filter((p) => !alreadyInSession.includes(p.id))
              const noPlayersInSystem = players.length === 0
              const allAlreadyInSession = players.length > 0 && availablePlayers.length === 0
              return (
                <>
                  <select
                    value={addPlayerSelectedId}
                    onChange={(e) => setAddPlayerSelectedId(e.currentTarget.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={addPlayerSubmitting || availablePlayers.length === 0}
                    aria-label="Select player to add to session"
                  >
                    <option value="">
                      {noPlayersInSystem
                        ? 'No players in system'
                        : allAlreadyInSession
                          ? 'All players already in this session'
                          : 'Select player'}
                    </option>
                    {availablePlayers.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  {noPlayersInSystem && (
                    <p className="mt-1 text-xs text-stone-500">
                      Add players from the <strong>People</strong> or <strong>Players</strong> page first.
                    </p>
                  )}
                  {allAlreadyInSession && (
                    <p className="mt-1 text-xs text-stone-500">
                      Every player is already assigned to this session.
                    </p>
                  )}
                </>
              )
            })()}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Reason *</label>
            <textarea
              value={addPlayerReason}
              onChange={(e) => setAddPlayerReason(e.target.value)}
              placeholder="e.g. Added to group session"
              rows={2}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              disabled={addPlayerSubmitting}
            />
          </div>
          {addPlayerError && <p className="text-sm text-red-600">{addPlayerError}</p>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddPlayerOpen(false)}
              disabled={addPlayerSubmitting}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitAddPlayer}
              disabled={addPlayerSubmitting || !addPlayerSelectedId || !addPlayerReason.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {addPlayerSubmitting ? 'Submitting...' : 'Submit for approval'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
