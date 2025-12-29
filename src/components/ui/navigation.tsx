'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Trophy, Users, Settings, Home, LogOut, ChevronDown, Heart, Brain, BarChart3, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/auth/auth-provider'
import { useState, useRef, useEffect } from 'react'

const publicNavItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/sessions', label: 'Sessions', icon: Calendar },
  { href: '/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/people', label: 'People', icon: Users },
  { href: '/emotional-routine', label: 'Routine', icon: Heart },
  { href: '/master-emotions', label: 'Emotions', icon: Brain },
  { href: '/match-analysis', label: 'Analysis', icon: BarChart3 },
  { href: '/tournaments/agent', label: 'AI Agent', icon: Bot },
]

export function Navigation() {
  const pathname = usePathname()
  const { user, profile, signOut, loading } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null
  }

  // Don't show public navigation on dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  const getInitials = () => {
    if (profile?.player_id) {
      // This would need actual player name - using email for now
      return user?.email?.substring(0, 2).toUpperCase() || 'U'
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U'
  }

  return (
    <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">ST</span>
            </div>
            <span
              className="text-xl font-black text-red-700 tracking-wide"
              style={{ fontFamily: "'Bebas Neue', 'Impact', sans-serif" }}
            >
              SOTOTENNIS
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {publicNavItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}

            {/* Auth Section */}
            {!loading && (
              <>
                {user ? (
                  <div className="relative ml-2" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{getInitials()}</span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform",
                        dropdownOpen && "rotate-180"
                      )} />
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-stone-200 shadow-lg py-2 z-50">
                        {/* User Info */}
                        <div className="px-4 py-2 border-b border-stone-100">
                          <p className="text-sm font-medium text-stone-800 truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-stone-500 capitalize">
                            {profile?.role || 'User'}
                          </p>
                        </div>

                        {/* Settings */}
                        <Link
                          href="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>

                        <div className="border-t border-stone-100 mt-2 pt-2">
                          <button
                            onClick={() => {
                              setDropdownOpen(false)
                              signOut()
                            }}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 ml-2">
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
