import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Placeholder values for build time (when env vars may not be available)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export function createClient() {
  return createBrowserClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      auth: {
        // Use Web Locks API to coordinate token refresh across tabs.
        // Without this, two tabs can race to refresh the same token —
        // one succeeds and invalidates the refresh token before the
        // other finishes, causing auth failures and infinite loops.
        lock: 'navigator',
      },
    }
  )
}
