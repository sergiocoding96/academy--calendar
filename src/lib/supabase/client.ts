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
        // Disabled here — AuthProvider manually calls startAutoRefresh() only
        // in the visible tab. This prevents two tabs from racing to consume
        // the same single-use refresh token.
        autoRefreshToken: false,
      },
    }
  )
}
