'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore,
  isAfter,
  differenceInDays,
  differenceInMonths,
  addWeeks,
  startOfDay,
} from 'date-fns'

export interface DateRange {
  from: Date
  to: Date
}

interface DateRangePickerProps {
  className?: string
  value?: DateRange
  onChange?: (range: DateRange) => void
  minDays?: number // Minimum range in days (default: 7)
  maxMonths?: number // Maximum range in months (default: 6)
}

// Quick preset options
const presets = [
  {
    label: 'This Month',
    getValue: () => ({
      from: new Date(),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: 'Next 4 Weeks',
    getValue: () => ({
      from: new Date(),
      to: addWeeks(new Date(), 4),
    }),
  },
  {
    label: 'Next 3 Months',
    getValue: () => ({
      from: new Date(),
      to: addMonths(new Date(), 3),
    }),
  },
  {
    label: 'Next 6 Months',
    getValue: () => ({
      from: new Date(),
      to: addMonths(new Date(), 6),
    }),
  },
]

function CalendarMonth({
  month,
  selectedRange,
  hoverDate,
  onDateClick,
  onDateHover,
  selectingEnd,
}: {
  month: Date
  selectedRange: DateRange | null
  hoverDate: Date | null
  onDateClick: (date: Date) => void
  onDateHover: (date: Date | null) => void
  selectingEnd: boolean
}) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  // Normalize today to start of day for proper comparison
  const today = startOfDay(new Date())

  return (
    <div className="p-3">
      {/* Month header */}
      <div className="text-center font-semibold text-stone-800 mb-3">
        {format(month, 'MMMM yyyy')}
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(date => {
          const isCurrentMonth = isSameMonth(date, month)
          const normalizedDate = startOfDay(date)
          const isToday = isSameDay(normalizedDate, today)
          const isPast = isBefore(normalizedDate, today)

          // Range selection logic
          const isRangeStart = selectedRange && isSameDay(date, selectedRange.from)
          const isRangeEnd = selectedRange && isSameDay(date, selectedRange.to)
          const isInRange = selectedRange && isWithinInterval(date, {
            start: selectedRange.from,
            end: selectedRange.to,
          })

          // Hover preview for selecting end date
          const isInHoverRange = selectingEnd && hoverDate && selectedRange && (
            isWithinInterval(date, {
              start: selectedRange.from,
              end: isAfter(hoverDate, selectedRange.from) ? hoverDate : selectedRange.from,
            })
          )

          return (
            <button
              key={date.toISOString()}
              onClick={() => !isPast && onDateClick(date)}
              onMouseEnter={() => !isPast && onDateHover(date)}
              onMouseLeave={() => onDateHover(null)}
              disabled={isPast || !isCurrentMonth}
              className={cn(
                'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                !isCurrentMonth && 'text-stone-300 cursor-default',
                isCurrentMonth && !isPast && 'hover:bg-red-50 cursor-pointer',
                isPast && 'text-stone-300 cursor-not-allowed',
                isToday && !isRangeStart && !isRangeEnd && 'ring-2 ring-red-500 ring-offset-1',
                isInRange && !isRangeStart && !isRangeEnd && 'bg-red-100 text-red-700',
                isInHoverRange && !isInRange && 'bg-red-50 text-red-600',
                isRangeStart && 'bg-red-600 text-white hover:bg-red-700 rounded-r-none',
                isRangeEnd && 'bg-red-600 text-white hover:bg-red-700 rounded-l-none',
                isRangeStart && isRangeEnd && 'rounded-lg',
                !isRangeStart && !isRangeEnd && !isInRange && !isPast && isCurrentMonth && 'text-stone-700',
              )}
            >
              {format(date, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function DateRangePicker({
  className,
  value,
  onChange,
  minDays = 7,
  maxMonths = 6,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedRange, setSelectedRange] = useState<DateRange | null>(
    value || { from: new Date(), to: addWeeks(new Date(), 8) }
  )
  const [selectingEnd, setSelectingEnd] = useState(false)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Validation error
  const validationError = useMemo(() => {
    if (!selectedRange) return null
    const days = differenceInDays(selectedRange.to, selectedRange.from)
    const months = differenceInMonths(selectedRange.to, selectedRange.from)
    if (days < minDays) return `Minimum ${minDays} days required`
    if (months > maxMonths) return `Maximum ${maxMonths} months allowed`
    return null
  }, [selectedRange, minDays, maxMonths])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  const handleDateClick = (date: Date) => {
    if (!selectingEnd) {
      // Selecting start date
      setSelectedRange({ from: date, to: date })
      setSelectingEnd(true)
    } else {
      // Selecting end date
      if (selectedRange && isAfter(date, selectedRange.from)) {
        const newRange = { from: selectedRange.from, to: date }
        setSelectedRange(newRange)
        setSelectingEnd(false)
        // Only notify if valid
        const days = differenceInDays(date, selectedRange.from)
        const months = differenceInMonths(date, selectedRange.from)
        if (days >= minDays && months <= maxMonths) {
          onChange?.(newRange)
        }
      } else {
        // User clicked before start, reset
        setSelectedRange({ from: date, to: date })
        setSelectingEnd(true)
      }
    }
  }

  const handlePresetClick = (preset: typeof presets[0]) => {
    const range = preset.getValue()
    setSelectedRange(range)
    setSelectingEnd(false)
    onChange?.(range)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    )
  }

  const displayText = selectedRange
    ? `${format(selectedRange.from, 'MMM d')} - ${format(selectedRange.to, 'MMM d, yyyy')}`
    : 'Select dates'

  const dayCount = selectedRange
    ? differenceInDays(selectedRange.to, selectedRange.from) + 1
    : 0

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all',
          'bg-white shadow-sm hover:shadow-md',
          isOpen
            ? 'border-red-500 ring-2 ring-red-500/20'
            : 'border-stone-200 hover:border-stone-300'
        )}
      >
        <Calendar className="w-4 h-4 text-stone-500" />
        <span className="text-sm font-medium text-stone-700">
          {displayText}
        </span>
        {dayCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
            {dayCount}d
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          'absolute z-50 top-full left-0 mt-2',
          'bg-white rounded-xl border border-stone-200 shadow-xl',
          'overflow-hidden'
        )}>
          {/* Header with presets */}
          <div className="p-3 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-stone-800">Date Range</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-stone-500" />
              </button>
            </div>

            {/* Quick presets */}
            <div className="flex flex-wrap gap-2">
              {presets.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar navigation */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-stone-600" />
            </button>
            <span className="text-sm font-medium text-stone-600">
              {selectingEnd ? 'Select end date' : 'Select start date'}
            </span>
            <button
              onClick={() => navigateMonth('next')}
              className="p-1.5 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-stone-600" />
            </button>
          </div>

          {/* Two-month calendar view */}
          <div className="flex">
            <CalendarMonth
              month={currentMonth}
              selectedRange={selectedRange}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              selectingEnd={selectingEnd}
            />
            <div className="w-px bg-stone-200" />
            <CalendarMonth
              month={addMonths(currentMonth, 1)}
              selectedRange={selectedRange}
              hoverDate={hoverDate}
              onDateClick={handleDateClick}
              onDateHover={setHoverDate}
              selectingEnd={selectingEnd}
            />
          </div>

          {/* Footer */}
          <div className={cn(
            'p-3 border-t border-stone-100',
            validationError ? 'bg-red-50' : 'bg-stone-50'
          )}>
            {validationError ? (
              <p className="text-xs text-red-600 font-medium">{validationError}</p>
            ) : (
              <p className="text-xs text-stone-500">
                {selectedRange
                  ? `${format(selectedRange.from, 'EEEE, MMMM d')} to ${format(selectedRange.to, 'EEEE, MMMM d, yyyy')}`
                  : 'Click to select a date range'
                }
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
