'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import Link from 'next/link'
import { User, LogIn } from 'lucide-react'

export function HomeAuthButtons() {
  const router = useRouter()
  const { user, isGuest, signInAsGuest, signOut } = useAuth()

  const handleGuestLogin = () => {
    signInAsGuest()
    router.push('/dashboard')
  }

  if (user || isGuest) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
        >
          Dashboard
        </Link>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-red-200 hover:text-white transition-colors text-sm"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleGuestLogin}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-medium"
      >
        <User className="w-4 h-4" />
        Try as Guest
      </button>
      <Link
        href="/login"
        className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </Link>
    </div>
  )
}
