import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Check if Supabase is configured
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isSupabaseConfigured = SUPABASE_URL && SUPABASE_ANON_KEY

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check for guest mode (via cookie)
  const isGuestMode = request.cookies.get('isGuest')?.value === 'true'

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = ['/dashboard', '/sessions', '/tournaments', '/people', '/settings', '/match-analysis']
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes - redirect to dashboard if already authenticated
  const authRoutes = ['/login', '/register']
  const isAuthRoute = authRoutes.some(route =>
    request.nextUrl.pathname === route
  )

  // Only hit Supabase when the route actually needs auth, avoiding a cold
  // Lambda + network round-trip on every public page request.
  let user = null
  if (isSupabaseConfigured && (isProtectedRoute || isAuthRoute)) {
    const supabase = createServerClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    // Refresh session if expired — wrapped in try/catch because supabase.auth.getUser()
    // can throw AuthApiError ("Invalid Refresh Token: Refresh Token Not Found") when
    // the browser has an expired/invalid refresh token. Without this, the middleware
    // crashes the entire request with a 500.
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // Invalid/expired token — treat as unauthenticated; middleware will redirect to login below
      user = null
    }
  }

  // Allow guest users to access protected routes
  if (isProtectedRoute && !user && !isGuestMode) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users or guests away from auth pages
  if (isAuthRoute && (user || isGuestMode)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
