import { GoogleGenerativeAI, SchemaType, type Part } from '@google/generative-ai'
import type { ToolDefinition, ToolCall, ToolResult } from '@/types/agent'
import { TOURNAMENT_AGENT_SYSTEM_PROMPT } from './prompts'
import { getToolDefinitions } from './tools'

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

const MODEL = 'gemini-3-flash-preview'

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
 * Map JSON Schema types to Gemini SchemaType
 */
function mapTypeToGemini(type: string): SchemaType {
  switch (type) {
    case 'string':
      return SchemaType.STRING
    case 'number':
    case 'integer':
      return SchemaType.NUMBER
    case 'boolean':
      return SchemaType.BOOLEAN
    case 'array':
      return SchemaType.ARRAY
    case 'object':
      return SchemaType.OBJECT
    default:
      return SchemaType.STRING
  }
}

/**
 * Convert our tool definitions to Gemini function declarations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertToolsToGemini(tools: ToolDefinition[]): any[] {
  return tools.map((t) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = t.inputSchema as {
      type?: string
      properties?: Record<string, { type?: string; description?: string; items?: { type?: string } }>
      required?: string[]
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const properties: Record<string, any> = {}

    if (schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        if (value.type === 'array' && value.items) {
          // Handle array types with items
          properties[key] = {
            type: SchemaType.ARRAY,
            items: {
              type: mapTypeToGemini(value.items.type || 'string'),
            },
            description: value.description || '',
          }
        } else {
          properties[key] = {
            type: mapTypeToGemini(value.type || 'string'),
            description: value.description || '',
          }
        }
      }
    }

    return {
      name: t.name,
      description: t.description,
      parameters: {
        type: SchemaType.OBJECT,
        properties,
        required: schema.required || [],
      },
    }
  })
}

/**
 * Stream a chat response from Gemini with tool support
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
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: convertToolsToGemini(tools),
      }],
    })

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history })
    const lastMessage = messages[messages.length - 1]

    const result = await chat.sendMessageStream(lastMessage.content)
    let fullResponse = ''

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        fullResponse += text
        callbacks.onToken(text)
      }

      // Check for function calls
      const functionCalls = chunk.functionCalls()
      if (functionCalls && functionCalls.length > 0) {
        for (const fc of functionCalls) {
          callbacks.onToolCall?.({
            id: `gemini_${Date.now()}_${fc.name}`,
            name: fc.name,
            input: fc.args as Record<string, unknown>,
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
 * Execute a non-streaming chat with Gemini
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

  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    tools: [{
      functionDeclarations: convertToolsToGemini(tools),
    }],
  })

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({ history })
  const lastMessage = messages[messages.length - 1]

  const result = await chat.sendMessage(lastMessage.content)
  const response = result.response

  let textContent = ''
  const toolCalls: ToolCall[] = []

  // Extract text content
  const text = response.text()
  if (text) {
    textContent = text
  }

  // Extract function calls
  const functionCalls = response.functionCalls()
  if (functionCalls) {
    for (const fc of functionCalls) {
      toolCalls.push({
        id: `gemini_${Date.now()}_${fc.name}`,
        name: fc.name,
        input: fc.args as Record<string, unknown>,
      })
    }
  }

  return {
    content: textContent,
    toolCalls,
    stopReason: toolCalls.length > 0 ? 'tool_use' : 'end_turn',
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

  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemPrompt,
    tools: [{
      functionDeclarations: convertToolsToGemini(tools),
    }],
  })

  // Build history with previous messages
  const history = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' as const : 'user' as const,
    parts: [{ text: m.content }],
  }))

  const chat = model.startChat({ history })

  // Send function responses as Parts
  const functionResponseParts: Part[] = toolResults.map((tr) => ({
    functionResponse: {
      name: tr.toolCallId.split('_').pop() || 'unknown',
      response: { result: tr.result },
    },
  }))

  const result = await chat.sendMessage(functionResponseParts)
  const response = result.response

  let textContent = ''
  const newToolCalls: ToolCall[] = []

  const text = response.text()
  if (text) {
    textContent = text
  }

  const functionCalls = response.functionCalls()
  if (functionCalls) {
    for (const fc of functionCalls) {
      newToolCalls.push({
        id: `gemini_${Date.now()}_${fc.name}`,
        name: fc.name,
        input: fc.args as Record<string, unknown>,
      })
    }
  }

  return {
    content: textContent,
    toolCalls: newToolCalls,
    stopReason: newToolCalls.length > 0 ? 'tool_use' : 'end_turn',
  }
}

/**
 * Count tokens in a text string (approximate)
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/**
 * Check if API key is configured
 */
export function isConfigured(): boolean {
  return !!process.env.GOOGLE_API_KEY
}
