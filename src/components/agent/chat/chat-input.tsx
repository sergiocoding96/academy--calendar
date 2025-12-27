'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
}

export function ChatInput({
  onSend,
  disabled = false,
  loading = false,
  placeholder = 'Ask about tournaments, players, or schedules...',
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [message])

  const handleSubmit = () => {
    const trimmedMessage = message.trim()
    if (trimmedMessage && !disabled && !loading) {
      onSend(trimmedMessage)
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isDisabled = disabled || loading
  const canSend = message.trim().length > 0 && !isDisabled

  return (
    <div className="border-t border-stone-200 bg-white p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isDisabled}
            rows={1}
            className={cn(
              'w-full resize-none rounded-xl border border-stone-300 px-4 py-3',
              'text-sm text-stone-900 placeholder:text-stone-400',
              'focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
              'disabled:bg-stone-50 disabled:cursor-not-allowed',
              'max-h-[150px] overflow-y-auto'
            )}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSend}
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200',
            canSend
              ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          )}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>

      <p className="text-xs text-stone-400 mt-2 text-center">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  )
}
