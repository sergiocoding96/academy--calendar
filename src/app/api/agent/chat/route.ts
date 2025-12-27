import { NextRequest } from 'next/server'
import { executeChat, continueWithToolResults, isConfigured } from '@/lib/agent/claude/client'
import type { Message } from '@/lib/agent/claude/client'
import type { ToolResult } from '@/types/agent'
import {
  queryTournaments,
  getTournamentDetails,
  listPlayers,
  getPlayerInfo,
  getCalendarSummary,
  recommendTournaments,
  searchExternal,
} from '@/lib/agent/actions'

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

// Tool execution using real server actions
async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<{ result: unknown; isError: boolean }> {
  try {
    switch (toolName) {
      case 'query_tournaments':
        return await queryTournaments({
          category: toolInput.category as string | undefined,
          date_from: toolInput.date_from as string | undefined,
          date_to: toolInput.date_to as string | undefined,
          location: toolInput.location as string | undefined,
          tournament_type: toolInput.tournament_type as string | undefined,
          level: toolInput.level as string | undefined,
          limit: toolInput.limit as number | undefined,
        })

      case 'get_tournament_details':
        return await getTournamentDetails({
          tournament_id: toolInput.tournament_id as string,
        })

      case 'list_players':
        return await listPlayers({
          category: toolInput.category as string | undefined,
          coach_id: toolInput.coach_id as string | undefined,
          status: toolInput.status as string | undefined,
          limit: toolInput.limit as number | undefined,
        })

      case 'get_player_info':
        return await getPlayerInfo({
          player_id: toolInput.player_id as string | undefined,
          player_name: toolInput.player_name as string | undefined,
        })

      case 'get_calendar_summary':
        return await getCalendarSummary({
          week_number: toolInput.week_number as number | undefined,
          year: toolInput.year as number | undefined,
          date_from: toolInput.date_from as string | undefined,
          date_to: toolInput.date_to as string | undefined,
        })

      case 'recommend_tournaments':
        return await recommendTournaments({
          player_id: toolInput.player_id as string | undefined,
          player_name: toolInput.player_name as string | undefined,
          max_results: toolInput.max_results as number | undefined,
          date_from: toolInput.date_from as string | undefined,
          date_to: toolInput.date_to as string | undefined,
          tournament_type: toolInput.tournament_type as string | undefined,
        })

      case 'search_external':
        return await searchExternal({
          query: toolInput.query as string,
          sources: toolInput.sources as string[] | undefined,
          category: toolInput.category as string | undefined,
          location: toolInput.location as string | undefined,
          date_from: toolInput.date_from as string | undefined,
          date_to: toolInput.date_to as string | undefined,
        })

      default:
        return {
          result: { error: `Unknown tool: ${toolName}` },
          isError: true,
        }
    }
  } catch (error) {
    return {
      result: { error: error instanceof Error ? error.message : 'Tool execution failed' },
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
