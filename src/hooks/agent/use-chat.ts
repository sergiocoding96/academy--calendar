'use client'

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types/agent'

interface UseChatOptions {
  conversationId?: string
  onError?: (error: Error) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  conversationId: string | null
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conversationId, setConversationId] = useState<string | null>(
    options.conversationId || null
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      setError(null)
      setIsLoading(true)

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      // Add placeholder for assistant response
      const assistantPlaceholder: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder])

      try {
        // Build history for context (exclude the current placeholder)
        const history = messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))

        const response = await fetch('/api/agent/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            conversationId,
            history,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()

        // Update the assistant message with the response
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholder.id
              ? {
                  ...m,
                  content: data.message,
                  isStreaming: false,
                }
              : m
          )
        )

        // Store conversation ID for future messages
        if (data.conversationId) {
          setConversationId(data.conversationId)
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        options.onError?.(err instanceof Error ? err : new Error(errorMessage))

        // Update the assistant message with error
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantPlaceholder.id
              ? {
                  ...m,
                  content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
                  isStreaming: false,
                }
              : m
          )
        )
      } finally {
        setIsLoading(false)
      }
    },
    [messages, conversationId, isLoading, options]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    conversationId,
  }
}
