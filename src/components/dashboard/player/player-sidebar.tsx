'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar,
  Trophy,
  Target,
  Dumbbell,
  BarChart3,
  Home,
  LogOut,
  User
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

const navItems = [
  { href: '/dashboard/player', label: 'Overview', icon: Home, exact: true },
  { href: '/dashboard/player/schedule', label: 'My Schedule', icon: Calendar },
  { href: '/dashboard/player/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/dashboard/player/goals', label: 'Goals', icon: Target },
  { href: '/dashboard/player/fitness', label: 'Fitness', icon: Dumbbell },
  { href: '/dashboard/player/stats', label: 'My Stats', icon: BarChart3 },
]

export function PlayerSidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-stone-200">
        <Link href="/dashboard/player" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">ST</span>
          </div>
          <div>
            <h1 className="font-bold text-stone-800">SotoTennis</h1>
            <p className="text-xs text-stone-500">Player Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-red-50 text-red-600'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-stone-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-lg mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-stone-800 truncate">
              {profile?.full_name || 'Player'}
            </p>
            <p className="text-xs text-stone-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-3 w-full text-stone-600 hover:bg-stone-50 hover:text-stone-800 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  )
}
