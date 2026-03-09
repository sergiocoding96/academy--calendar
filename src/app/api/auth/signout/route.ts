import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  await supabase.auth.signOut()

  // The server client's setAll callback writes cleared cookies to the
  // Next.js cookie store, which propagates them to the browser via
  // Set-Cookie headers — guaranteed to work even for httpOnly cookies.
  return NextResponse.json({ ok: true })
}
