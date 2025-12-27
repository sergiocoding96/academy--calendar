import { NextRequest } from 'next/server'
import { executeChat, continueWithToolResults, isConfigured } from '@/lib/agent/claude/client'
import type { Message } from '@/lib/agent/claude/client'
import type { ToolResult } from '@/types/agent'

export const runtime = 'nodejs'
export const maxDuration = 60

interface ChatRequestBody {
  message: string
  conversationId?: string
  history?: Message[]
  context?: {
    playerId?: string
    tournamentId?: string
    weekNumber?: number
  }
}

// Mock tool execution for now (Phase 3 will implement real tool handlers)
async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<{ result: unknown; isError: boolean }> {
  // For Phase 2, return mock responses
  switch (toolName) {
    case 'query_tournaments':
      return {
        result: {
          tournaments: [
            {
              id: '1',
              name: 'ITF Junior U16 Barcelona',
              start_date: '2025-01-15',
              end_date: '2025-01-19',
              location: 'Barcelona, Spain',
              category: 'U16',
              level: 'J100',
            },
            {
              id: '2',
              name: 'RFET National Championship',
              start_date: '2025-01-22',
              end_date: '2025-01-26',
              location: 'Madrid, Spain',
              category: 'U16',
              level: 'National',
            },
          ],
          total: 2,
        },
        isError: false,
      }

    case 'list_players':
      return {
        result: {
          players: [
            {
              id: '1',
              name: 'Carlos Martinez',
              category: 'U16',
              utr: 8.5,
              coach: 'Coach Rodriguez',
            },
            {
              id: '2',
              name: 'Maria Garcia',
              category: 'U14',
              utr: 6.2,
              coach: 'Coach Rodriguez',
            },
          ],
          total: 2,
        },
        isError: false,
      }

    case 'get_player_info':
      return {
        result: {
          id: '1',
          name: 'Carlos Martinez',
          category: 'U16',
          utr: 8.5,
          coach: 'Coach Rodriguez',
          availability: 'available',
          upcomingTournaments: 2,
        },
        isError: false,
      }

    case 'get_calendar_summary':
      return {
        result: {
          week: toolInput.week_number || 3,
          year: toolInput.year || 2025,
          tournaments: [
            {
              name: 'ITF Junior U16 Barcelona',
              dates: 'Jan 15-19',
              playersEntered: 3,
            },
          ],
          deadlines: [
            {
              tournament: 'RFET Regional Championship',
              deadline: '2025-01-18',
            },
          ],
        },
        isError: false,
      }

    case 'recommend_tournaments':
      return {
        result: {
          recommendations: [
            {
              tournament: 'ITF Junior U16 Barcelona',
              score: 92,
              reasons: [
                'Perfect age category match',
                'Appropriate skill level',
                'Local tournament (easy travel)',
              ],
            },
            {
              tournament: 'RFET National Championship',
              score: 85,
              reasons: [
                'Good competitive experience',
                'National ranking points',
              ],
            },
          ],
        },
        isError: false,
      }

    case 'get_tournament_details':
      return {
        result: {
          id: toolInput.tournament_id,
          name: 'ITF Junior U16 Barcelona',
          start_date: '2025-01-15',
          end_date: '2025-01-19',
          location: 'Real Club de Tenis Barcelona',
          category: 'U16',
          level: 'J100',
          surface: 'Clay',
          entry_deadline: '2025-01-08',
          draw_size: 32,
          assignedPlayers: ['Carlos Martinez', 'Pablo Fernandez'],
          assignedCoach: 'Coach Rodriguez',
        },
        isError: false,
      }

    case 'search_external':
      return {
        result: {
          message: 'External search is available in Phase 5. For now, please use query_tournaments to search the database.',
          tournaments: [],
        },
        isError: false,
      }

    default:
      return {
        result: { error: `Unknown tool: ${toolName}` },
        isError: true,
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if Claude API is configured
    if (!isConfigured()) {
      return new Response(
        JSON.stringify({
          error: 'Claude API not configured',
          message: 'Please add ANTHROPIC_API_KEY to your environment variables.',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const body: ChatRequestBody = await request.json()
    const { message, history = [] } = body

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Build conversation messages
    const messages: Message[] = [
      ...history,
      { role: 'user', content: message },
    ]

    // Execute chat with Claude
    let response = await executeChat(messages)
    let allContent = response.content

    // Handle tool calls (agentic loop)
    while (response.stopReason === 'tool_use' && response.toolCalls.length > 0) {
      const toolResults: ToolResult[] = []

      for (const toolCall of response.toolCalls) {
        const { result, isError } = await executeToolCall(toolCall.name, toolCall.input)
        toolResults.push({
          toolCallId: toolCall.id,
          result,
          isError,
        })
      }

      // Continue conversation with tool results
      const updatedMessages: Message[] = [
        ...messages,
        { role: 'assistant', content: response.content || '[Using tools...]' },
      ]

      response = await continueWithToolResults(updatedMessages, toolResults)
      allContent = response.content
    }

    // Return the final response
    return new Response(
      JSON.stringify({
        message: allContent,
        conversationId: body.conversationId || crypto.randomUUID(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
