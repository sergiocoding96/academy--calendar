'use client'

import { useRef, useEffect } from 'react'
import { Bot, Trash2 } from 'lucide-react'
import { useChat } from '@/hooks/agent/use-chat'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { ChatSuggestions } from './chat-suggestions'
import { cn } from '@/lib/utils'

interface AgentChatProps {
  className?: string
}

export function AgentChat({ className }: AgentChatProps) {
  const { messages, isLoading, sendMessage, clearMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSuggestionSelect = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const hasMessages = messages.length > 0

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-700 to-stone-800 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-800">
                Tournament Assistant
              </h2>
              <p className="text-xs text-stone-500">
                AI-powered tournament recommendations
              </p>
            </div>
          </div>

          {hasMessages && (
            <button
              onClick={clearMessages}
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="h-full flex flex-col">
            {/* Welcome Message */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                Welcome to Tournament Assistant
              </h3>
              <p className="text-sm text-stone-500 text-center max-w-md">
                I can help you find tournaments, get recommendations for players,
                check schedules, and search external tournament sources. How can I
                help you today?
              </p>
            </div>

            {/* Suggestions */}
            <ChatSuggestions onSelect={handleSuggestionSelect} />
          </div>
        ) : (
          <div className="py-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={sendMessage}
        loading={isLoading}
        disabled={isLoading}
      />
    </div>
  )
}
