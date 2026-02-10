'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'
import { XCircle } from 'lucide-react'

type Props = {
  sessionId: string
  disabled?: boolean
  sessionLabel?: string
}

export function MarkAbsentButton({ sessionId, disabled, sessionLabel }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Please give a brief reason.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/schedule/sessions/${sessionId}/absent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmed }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        return
      }
      setOpen(false)
      setReason('')
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="inline-flex items-center gap-1.5 text-sm text-amber-700 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <XCircle className="w-4 h-4" />
        Can&apos;t attend
      </button>

      <Modal
        isOpen={open}
        onClose={() => {
          if (!submitting) {
            setOpen(false)
            setError(null)
          }
        }}
        title="Mark as absent"
        description={sessionLabel ? `Session: ${sessionLabel}` : undefined}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-stone-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Sick, travel, other commitment"
              rows={3}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              required
              disabled={submitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Mark absent'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
