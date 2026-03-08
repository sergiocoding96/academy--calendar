'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Dumbbell,
  Heart,
  FileText,
  MapPin,
  TrendingUp,
  CheckSquare,
  Activity,
  Edit3,
} from 'lucide-react'
import { PlayerProfile } from '@/features/player-database/components'
import type { PlayerWithDetails } from '@/features/player-database/types'

const subPages = [
  { label: 'Training', href: 'training', icon: Dumbbell },
  { label: 'Injuries', href: 'injuries', icon: Heart },
  { label: 'Notes', href: 'notes', icon: FileText },
  { label: 'Whereabouts', href: 'whereabouts', icon: MapPin },
  { label: 'UTR', href: 'utr', icon: TrendingUp },
  { label: 'Attendance', href: 'attendance', icon: CheckSquare },
  { label: 'Fitness', href: 'fitness', icon: Activity },
  { label: 'Edit', href: 'edit', icon: Edit3 },
] as const

interface CoachPlayerDetailClientProps {
  playerId: string
  initialPlayer: PlayerWithDetails
}

export function CoachPlayerDetailClient({
  playerId,
  initialPlayer,
}: CoachPlayerDetailClientProps) {
  const router = useRouter()
  const basePath = `/dashboard/coach/players/${playerId}`

  const handleBack = () => {
    router.push('/dashboard/coach/players')
  }

  const handleEdit = () => {
    router.push(`${basePath}/edit`)
  }

  return (
    <div className="p-8">
      <PlayerProfile
        playerId={playerId}
        initialPlayer={initialPlayer}
        onBack={handleBack}
        onEdit={handleEdit}
      />

      <nav className="mt-4 flex flex-wrap gap-2">
        {subPages.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={`${basePath}/${href}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900"
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

