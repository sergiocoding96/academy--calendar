import { LucideIcon, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

type PageHeaderProps = {
  title: string
  description?: string
  icon?: LucideIcon
  iconColor?: string
  backHref?: string
  backLabel?: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
    icon?: LucideIcon
  }
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  iconColor = 'bg-red-100 text-red-600',
  backHref,
  backLabel,
  action
}: PageHeaderProps) {
  const ActionIcon = action?.icon

  return (
    <div className="mb-8">
      {/* Back Link */}
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-800 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          {backLabel || 'Back'}
        </Link>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {Icon && (
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{title}</h1>
            {description && (
              <p className="text-stone-500 mt-1">{description}</p>
            )}
          </div>
        </div>

        {action && (
          action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {ActionIcon && <ActionIcon className="w-4 h-4" />}
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}
