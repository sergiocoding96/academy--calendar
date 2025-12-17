import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  hint?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon: Icon,
      iconPosition = 'left',
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === 'left' && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon className="w-5 h-5 text-stone-400" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border border-stone-300 px-3 py-2',
              'text-stone-900 placeholder:text-stone-400',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
              'disabled:bg-stone-100 disabled:cursor-not-allowed',
              error && 'border-red-500 focus:ring-red-500',
              Icon && iconPosition === 'left' && 'pl-10',
              Icon && iconPosition === 'right' && 'pr-10',
              className
            )}
            {...props}
          />
          {Icon && iconPosition === 'right' && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Icon className="w-5 h-5 text-stone-400" />
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-stone-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea variant
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-stone-300 px-3 py-2',
            'text-stone-900 placeholder:text-stone-400',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
            'disabled:bg-stone-100 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-stone-500">{hint}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Select variant
type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, className, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-stone-300 px-3 py-2',
            'text-stone-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
            'disabled:bg-stone-100 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-stone-500">{hint}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
