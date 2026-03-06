'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function PlayerDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-sm">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-stone-800 mb-2">Failed to load your dashboard</h2>
        <p className="text-stone-500 text-sm mb-6">
          {error.message || 'Could not load this page. This may be a temporary issue—try again or return to the dashboard.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            Retry
          </button>
          <Link
            href="/dashboard"
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2.5 px-4 rounded-lg transition-colors text-center"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
