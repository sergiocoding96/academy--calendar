// Environment variable validation — import early to catch misconfig at startup

const required = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'] as const
const optional = ['ANTHROPIC_API_KEY', 'SCRAPFLY_API_KEY', 'GOOGLE_API_KEY', 'CRON_SECRET'] as const
const paired = [['SLACK_BOT_TOKEN', 'SLACK_CHANNEL_ID']] as const

// Only validate at runtime (not during build when env vars may be absent)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

  if (!isBuild) {
    for (const key of required) {
      if (!process.env[key] || process.env[key]!.startsWith('placeholder')) {
        console.error(`[env] MISSING REQUIRED: ${key}`)
      }
    }

    for (const [a, b] of paired) {
      const hasA = !!process.env[a]
      const hasB = !!process.env[b]
      if (hasA !== hasB) {
        console.warn(`[env] ${a} and ${b} must both be set (found only ${hasA ? a : b})`)
      }
    }

    const missing = optional.filter((k) => !process.env[k])
    if (missing.length > 0) {
      console.info(`[env] Optional vars not set: ${missing.join(', ')}`)
    }
  }
}

export const env = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  SCRAPFLY_API_KEY: process.env.SCRAPFLY_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_CHANNEL_ID: process.env.SLACK_CHANNEL_ID,
} as const
