'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlayerSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export function PlayerSearch({
  value,
  onChange,
  placeholder = 'Search players...',
  debounceMs = 300,
  className,
}: PlayerSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  // Sync with external value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange, value])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="w-5 h-5 text-stone-400" />
      </div>
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-stone-300 pl-10 pr-10 py-2',
          'text-stone-900 placeholder:text-stone-400',
          'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500'
        )}
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="w-5 h-5 text-stone-400 hover:text-stone-600" />
        </button>
      )}
    </div>
  )
}
