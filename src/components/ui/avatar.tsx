import { cn } from '@/lib/utils'

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'

type AvatarProps = {
  name?: string
  src?: string
  size?: AvatarSize
  className?: string
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={cn(
          'rounded-full object-cover',
          sizeStyles[size],
          className
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center',
        sizeStyles[size],
        className
      )}
    >
      <span className="text-white font-medium">{initials}</span>
    </div>
  )
}
