import { LucideIcon } from 'lucide-react'
import Link from 'next/link'

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-12 text-center">
      <Icon className="w-16 h-16 mx-auto mb-4 text-stone-300" />
      <h3 className="text-lg font-medium text-stone-800 mb-2">{title}</h3>
      <p className="text-stone-500 mb-6">{description}</p>
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  )
}
