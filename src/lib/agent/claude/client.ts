import Anthropic from '@anthropic-ai/sdk'
import type { ToolDefinition, ToolCall, ToolResult } from '@/types/agent'
import { TOURNAMENT_AGENT_SYSTEM_PROMPT } from './prompts'
import { getToolDefinitions } from './tools'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS = 4096

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface StreamCallbacks {
  onToken: (token: string) => void
  onToolCall?: (toolCall: ToolCall) => void
  onComplete: (fullResponse: string) => void
  onError: (error: Error) => void
}

/**
 * Stream a chat response from Claude with tool support
 */
export async function streamChat(
  messages: Message[],
  callbacks: StreamCallbacks,
  options?: {
    tools?: ToolDefinition[]
    systemPrompt?: string
  }
): Promise<void> {
  const tools = options?.tools ?? getToolDefinitions()
  const systemPrompt = options?.systemPrompt ?? TOURNAMENT_AGENT_SYSTEM_PROMPT

  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      tools: tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
      })),
      stream: true,
    })

    let fullResponse = ''

    for await (const event of response) {
      if (event.type === 'content_block_delta') {
        const delta = event.delta
        if ('text' in delta) {
          fullResponse += delta.text
          callbacks.onToken(delta.text)
        }
      } else if (event.type === 'content_block_start') {
        const block = event.content_block
        if (block.type === 'tool_use') {
          callbacks.onToolCall?.({
            id: block.id,
            name: block.name,
            input: {},
          })
        }
      }
    }

    callbacks.onComplete(fullResponse)
  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)))
  }
}

/**
 * Execute a non-streaming chat with Claude
 */
export async function executeChat(
  messages: Message[],
  options?: {
    tools?: ToolDefinition[]
    systemPrompt?: string
  }
): Promise<{
  content: string
  toolCalls: ToolCall[]
  stopReason: string
}> {
  const tools = options?.tools ?? getToolDefinitions()
  const systemPrompt = options?.systemPrompt ?? TOURNAMENT_AGENT_SYSTEM_PROMPT

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
    })),
  })

  let textContent = ''
  const toolCalls: ToolCall[] = []

  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text
    } else if (block.type === 'tool_use') {
      toolCalls.push({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      })
    }
  }

  return {
    content: textContent,
    toolCalls,
    stopReason: response.stop_reason ?? 'end_turn',
  }
}

/**
 * Continue a conversation with tool results
 */
export async function continueWithToolResults(
  messages: Message[],
  toolResults: ToolResult[],
  options?: {
    tools?: ToolDefinition[]
    systemPrompt?: string
  }
): Promise<{
  content: string
  toolCalls: ToolCall[]
  stopReason: string
}> {
  const tools = options?.tools ?? getToolDefinitions()
  const systemPrompt = options?.systemPrompt ?? TOURNAMENT_AGENT_SYSTEM_PROMPT

  // Build messages with tool results
  const anthropicMessages: Anthropic.MessageParam[] = [
    ...messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    {
      role: 'user' as const,
      content: toolResults.map((tr) => ({
        type: 'tool_result' as const,
        tool_use_id: tr.toolCallId,
        content: JSON.stringify(tr.result),
        is_error: tr.isError ?? false,
      })),
    },
  ]

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: anthropicMessages,
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      input_schema: t.inputSchema as Anthropic.Tool.InputSchema,
    })),
  })

  let textContent = ''
  const newToolCalls: ToolCall[] = []

  for (const block of response.content) {
    if (block.type === 'text') {
      textContent += block.text
    } else if (block.type === 'tool_use') {
      newToolCalls.push({
        id: block.id,
        name: block.name,
        input: block.input as Record<string, unknown>,
      })
    }
  }

  return {
    content: textContent,
    toolCalls: newToolCalls,
    stopReason: response.stop_reason ?? 'end_turn',
  }
}

/**
 * Count tokens in a text string (approximate)
 * Claude uses ~4 characters per token on average
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Check if API key is configured
 */
export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}
