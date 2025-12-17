'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { User, LogOut } from 'lucide-react'

export function HomeAuthButtons() {
  const router = useRouter()
  const { user, isGuest, signInAsGuest, signOut } = useAuth()

  const handleGuestLogin = () => {
    signInAsGuest()
    router.push('/dashboard')
  }

  const handleSignOut = () => {
    signOut()
    router.push('/')
  }

  if (user || isGuest) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-red-200 hover:text-white transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleGuestLogin}
        className="flex items-center gap-2 px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-semibold"
      >
        <User className="w-4 h-4" />
        Enter as Guest
      </button>
    </div>
  )
}
