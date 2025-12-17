'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'

type StarRatingProps = {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  label?: string
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  label
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  }

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  const displayValue = hoverValue || value

  return (
    <div>
      {label && (
        <p className="text-sm font-medium text-stone-700 mb-1">{label}</p>
      )}
      <div className={`flex items-center ${gapClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            disabled={readonly}
            className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors ${
                star <= displayValue
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-stone-300'
              } ${!readonly && star <= displayValue ? 'hover:text-amber-500' : ''}`}
            />
          </button>
        ))}
        {showValue && (
          <span className="ml-2 text-sm text-stone-500">
            {value > 0 ? `${value}/5` : 'Not rated'}
          </span>
        )}
      </div>
    </div>
  )
}
