import type { ToolDefinition } from '@/types/agent'

/**
 * Tool definitions for the Tournament Agent
 * These define what tools Claude can use and their input schemas
 */

export const QUERY_TOURNAMENTS_TOOL: ToolDefinition = {
  name: 'query_tournaments',
  description: `Search and filter tournaments from the database. Use this when the user asks about tournaments, wants to see upcoming events, or needs to filter by specific criteria like date, category, location, or tournament type.`,
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Age category filter: U12, U14, U16, U18, or Adults',
        enum: ['U12', 'U14', 'U16', 'U18', 'Adults'],
      },
      date_from: {
        type: 'string',
        description: 'Start date for filtering (ISO format: YYYY-MM-DD)',
      },
      date_to: {
        type: 'string',
        description: 'End date for filtering (ISO format: YYYY-MM-DD)',
      },
      location: {
        type: 'string',
        description: 'Location filter (city, region, or country)',
      },
      tournament_type: {
        type: 'string',
        description: 'Type of tournament',
        enum: ['proximity', 'national', 'international'],
      },
      level: {
        type: 'string',
        description: 'Tournament level or grade',
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
      },
    },
    required: [],
  },
}

export const GET_TOURNAMENT_DETAILS_TOOL: ToolDefinition = {
  name: 'get_tournament_details',
  description: `Get detailed information about a specific tournament including assigned coaches and players. Use this when the user asks for more details about a particular tournament.`,
  inputSchema: {
    type: 'object',
    properties: {
      tournament_id: {
        type: 'string',
        description: 'The unique ID of the tournament',
      },
    },
    required: ['tournament_id'],
  },
}

export const LIST_PLAYERS_TOOL: ToolDefinition = {
  name: 'list_players',
  description: `List players from the academy, optionally filtered by category or coach. Use this when the user asks about players, needs to see who is available, or wants to filter by age group.`,
  inputSchema: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Age category filter: U12, U14, U16, U18, or Adults',
        enum: ['U12', 'U14', 'U16', 'U18', 'Adults'],
      },
      coach_id: {
        type: 'string',
        description: 'Filter by assigned coach ID',
      },
      status: {
        type: 'string',
        description: 'Player status filter',
        enum: ['active', 'inactive'],
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results (default: 20)',
      },
    },
    required: [],
  },
}

export const GET_PLAYER_INFO_TOOL: ToolDefinition = {
  name: 'get_player_info',
  description: `Get detailed information about a specific player including their profile, UTR rating, assigned coach, and availability. Use this before making tournament recommendations to understand the player's situation.`,
  inputSchema: {
    type: 'object',
    properties: {
      player_id: {
        type: 'string',
        description: 'The unique ID of the player',
      },
      player_name: {
        type: 'string',
        description: 'The name of the player (will search if ID not provided)',
      },
    },
    required: [],
  },
}

export const GET_CALENDAR_SUMMARY_TOOL: ToolDefinition = {
  name: 'get_calendar_summary',
  description: `Get a summary of tournaments and important dates for a specific week or date range. Use this when the user asks about "this week", "next week", or wants an overview of upcoming events.`,
  inputSchema: {
    type: 'object',
    properties: {
      week_number: {
        type: 'number',
        description: 'ISO week number (1-52)',
      },
      year: {
        type: 'number',
        description: 'Year for the week (default: current year)',
      },
      date_from: {
        type: 'string',
        description: 'Alternative: start date (ISO format)',
      },
      date_to: {
        type: 'string',
        description: 'Alternative: end date (ISO format)',
      },
    },
    required: [],
  },
}

export const RECOMMEND_TOURNAMENTS_TOOL: ToolDefinition = {
  name: 'recommend_tournaments',
  description: `Get personalized tournament recommendations for a specific player based on their age, skill level, availability, and preferences. Use this when the user asks for suggestions or recommendations for a player.`,
  inputSchema: {
    type: 'object',
    properties: {
      player_id: {
        type: 'string',
        description: 'The unique ID of the player',
      },
      player_name: {
        type: 'string',
        description: 'The name of the player (will search if ID not provided)',
      },
      max_results: {
        type: 'number',
        description: 'Maximum number of recommendations (default: 5)',
      },
      date_from: {
        type: 'string',
        description: 'Only consider tournaments starting after this date',
      },
      date_to: {
        type: 'string',
        description: 'Only consider tournaments starting before this date',
      },
      tournament_type: {
        type: 'string',
        description: 'Preferred tournament type',
        enum: ['proximity', 'national', 'international'],
      },
    },
    required: [],
  },
}

export const SEARCH_EXTERNAL_TOOL: ToolDefinition = {
  name: 'search_external',
  description: `Search external tournament sources like ITF, Tennis Europe, and federation websites to discover new tournaments. Use this when the user wants to find tournaments not yet in the database, or specifically asks to search online sources.`,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query',
      },
      sources: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['itf', 'tennis_europe', 'rfet', 'fct', 'utr'],
        },
        description: 'Specific sources to search (default: all active sources)',
      },
      category: {
        type: 'string',
        description: 'Age category filter',
        enum: ['U12', 'U14', 'U16', 'U18', 'Adults'],
      },
      location: {
        type: 'string',
        description: 'Location filter (country, region, or city)',
      },
      date_from: {
        type: 'string',
        description: 'Start date for search range',
      },
      date_to: {
        type: 'string',
        description: 'End date for search range',
      },
    },
    required: ['query'],
  },
}

/**
 * Get all tool definitions for the tournament agent
 */
export function getToolDefinitions(): ToolDefinition[] {
  return [
    QUERY_TOURNAMENTS_TOOL,
    GET_TOURNAMENT_DETAILS_TOOL,
    LIST_PLAYERS_TOOL,
    GET_PLAYER_INFO_TOOL,
    GET_CALENDAR_SUMMARY_TOOL,
    RECOMMEND_TOURNAMENTS_TOOL,
    SEARCH_EXTERNAL_TOOL,
  ]
}

/**
 * Get a specific tool by name
 */
export function getToolByName(name: string): ToolDefinition | undefined {
  return getToolDefinitions().find((t) => t.name === name)
}
