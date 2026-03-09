'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Triggers a Next.js server-component refresh when the browser tab regains focus.
 * This keeps server-rendered dashboard data in sync across tabs.
 */
export function useRefreshOnFocus() {
  const router = useRouter()
  const lastFocusedAt = useRef(Date.now())

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only refresh if the tab was hidden for at least 5 seconds
        // to avoid unnecessary refreshes from quick tab switches
        if (Date.now() - lastFocusedAt.current > 5_000) {
          router.refresh()
        }
        lastFocusedAt.current = Date.now()
      } else {
        lastFocusedAt.current = Date.now()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [router])
}
