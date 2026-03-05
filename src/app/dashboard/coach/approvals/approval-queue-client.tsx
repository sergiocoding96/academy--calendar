'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Edit3, Calendar, Clock } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { formatTime } from '@/lib/utils'

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

type PendingItem = {
  id: string
  created_at: string
  proposer_id: string
  change_type: string
  target_session_id: string | null
  reason: string
  status: string
  proposed_payload: Record<string, unknown> | null
  target_session: {
    id: string
    date: string
    start_time: string
    end_time: string
    session_type: string
    court?: { name: string } | null
    coach?: { name: string } | null
  } | null
}

type Props = { initialPending: PendingItem[] }

export function ApprovalQueueClient({ initialPending }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(initialPending)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [modifyOpen, setModifyOpen] = useState(false)
  const [modifyId, setModifyId] = useState<string | null>(null)
  const [modifyPayloadText, setModifyPayloadText] = useState('')
  const [modifyPayloadError, setModifyPayloadError] = useState<string | null>(null)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      const res = await fetch(`/api/schedule/change-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed')
        return
      }
      setPending((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: string) => {
    setActionLoading(id)
    setError(null)
    try {
      const res = await fetch(`/api/schedule/change-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', reject_reason: rejectReason.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed')
        return
      }
      setRejectOpen(false)
      setRejectId(null)
      setRejectReason('')
      setPending((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } finally {
      setActionLoading(null)
    }
  }

  const handleModifyApprove = async (id: string, modifiedPayload: Record<string, unknown>) => {
    setActionLoading(id)
    setError(null)
    try {
      const res = await fetch(`/api/schedule/change-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'modify_approve', modified_payload: modifiedPayload }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Failed')
        return
      }
      setModifyOpen(false)
      setModifyId(null)
      setPending((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } finally {
      setActionLoading(null)
    }
  }

  const openReject = (id: string) => {
    setRejectId(id)
    setRejectReason('')
    setRejectOpen(true)
  }

  const openModify = (id: string) => {
    const req = pending.find((r) => r.id === id)
    setModifyId(id)
    setModifyPayloadText(req?.proposed_payload ? JSON.stringify(req.proposed_payload, null, 2) : '{}')
    setModifyPayloadError(null)
    setModifyOpen(true)
  }

  if (pending.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
        <Check className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-lg font-medium text-stone-800 mb-2">No pending approvals</h3>
        <p className="text-stone-500">Schedule change requests will appear here when coaches propose changes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}
      {pending.map((req) => (
        <div
          key={req.id}
          className="bg-white rounded-xl border border-stone-200 p-6 flex flex-wrap items-start justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 capitalize">
                {req.change_type.replace(/_/g, ' ')}
              </span>
            </div>
            {req.target_session && (
              <div className="flex items-center gap-4 text-sm text-stone-600 mb-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(req.target_session.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatTime(req.target_session.start_time)} – {formatTime(req.target_session.end_time)}
                </span>
                <span>{req.target_session.session_type}</span>
                {req.target_session.court?.name && <span>{req.target_session.court.name}</span>}
              </div>
            )}
            <p className="text-stone-700">{req.reason}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleApprove(req.id)}
              disabled={actionLoading === req.id}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
            >
              <Check className="w-4 h-4" />
              {actionLoading === req.id ? '...' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => openModify(req.id)}
              disabled={actionLoading === req.id}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 disabled:opacity-50 text-sm font-medium text-stone-700"
            >
              <Edit3 className="w-4 h-4" />
              Modify & approve
            </button>
            <button
              type="button"
              onClick={() => openReject(req.id)}
              disabled={actionLoading === req.id}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm font-medium"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </div>
        </div>
      ))}

      <Modal isOpen={rejectOpen} onClose={() => setRejectOpen(false)} title="Reject change request">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Reason (optional)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Court not available at that time"
              rows={2}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setRejectOpen(false)} className="px-4 py-2 text-stone-600 hover:text-stone-800">
              Cancel
            </button>
            {rejectId && (
              <button
                type="button"
                onClick={() => handleReject(rejectId)}
                disabled={actionLoading === rejectId}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={modifyOpen} onClose={() => { setModifyOpen(false); setModifyId(null) }} title="Modify & Approve">
        <div className="space-y-4">
          <p className="text-sm text-stone-600">
            Edit the change payload below, then click Approve. For <code className="bg-stone-100 px-1 rounded">move_time</code> edit <code className="bg-stone-100 px-1 rounded">start_time</code> / <code className="bg-stone-100 px-1 rounded">end_time</code>; for <code className="bg-stone-100 px-1 rounded">change_court</code> edit <code className="bg-stone-100 px-1 rounded">court_id</code>.
          </p>
          <textarea
            className="w-full h-40 font-mono text-sm border border-stone-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
            value={modifyPayloadText}
            onChange={(e) => {
              setModifyPayloadText(e.target.value)
              setModifyPayloadError(null)
            }}
            spellCheck={false}
          />
          {modifyPayloadError && (
            <p className="text-sm text-red-600">{modifyPayloadError}</p>
          )}
          {modifyId && (
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => { setModifyOpen(false); setModifyId(null) }} className="px-4 py-2 text-stone-600 hover:text-stone-800">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    const parsed = JSON.parse(modifyPayloadText)
                    handleModifyApprove(modifyId, parsed)
                  } catch {
                    setModifyPayloadError('Invalid JSON — please fix the payload before approving.')
                  }
                }}
                disabled={actionLoading === modifyId}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading === modifyId ? 'Approving...' : 'Approve with changes'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
