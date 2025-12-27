import type { Json, Player, Coach, Tournament } from './database'

// ============================================
// Tournament Source Types (for web scraping)
// ============================================

export type SourceType = 'itf' | 'federation' | 'tennis_europe' | 'utr' | 'custom'

export interface TournamentSource {
  id: string
  created_at: string
  name: string
  base_url: string
  source_type: SourceType
  is_active: boolean
  last_scraped_at: string | null
  scrape_frequency_hours: number
  config: Json | null // CSS selectors, pagination config, etc.
}

export interface ScrapedTournament {
  id: string
  created_at: string
  source_id: string
  name: string
  location: string | null
  start_date: string | null
  end_date: string | null
  category: string | null
  level: string | null
  website_url: string | null
  raw_data: Json | null
  status: 'pending' | 'approved' | 'rejected' | 'duplicate'
}

// ============================================
// Chat & Conversation Types
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system'

export interface AgentConversation {
  id: string
  created_at: string
  user_id: string | null
  title: string | null
  updated_at: string | null
}

export interface AgentMessage {
  id: string
  created_at: string
  conversation_id: string
  role: MessageRole
  content: string
  metadata: Json | null // tool calls, tokens used, etc.
}

// UI-specific chat message type
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
}

// ============================================
// Claude Tool Types
// ============================================

export interface ToolCall {
  id: string
  name: string
  input: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  result: unknown
  isError?: boolean
}

export type AgentTool =
  | 'query_tournaments'
  | 'get_tournament_details'
  | 'list_players'
  | 'get_player_info'
  | 'get_calendar_summary'
  | 'recommend_tournaments'
  | 'search_external'

export interface ToolDefinition {
  name: AgentTool
  description: string
  inputSchema: Record<string, unknown>
}

// ============================================
// Player Availability Types
// ============================================

export type AvailabilityType = 'available' | 'unavailable' | 'tentative'

export interface PlayerAvailability {
  id: string
  created_at: string
  player_id: string
  start_date: string
  end_date: string
  availability_type: AvailabilityType
  reason: string | null
}

// ============================================
// Recommendation Types
// ============================================

export type RecommendationStatus = 'suggested' | 'accepted' | 'dismissed' | 'registered'

export interface RecommendationFactors {
  ageCategoryMatch: number        // 0-25 points
  levelAppropriateness: number    // 0-25 points
  travelDistance: number          // 0-20 points
  availabilityTiming: number      // 0-15 points
  entryDeadline: number           // 0-10 points
  tournamentPrestige: number      // 0-5 points
  totalScore: number              // 0-100 points
  explanations: Record<string, string>
}

export interface TournamentRecommendation {
  id: string
  created_at: string
  player_id: string
  tournament_id: string
  recommendation_score: number
  factors: RecommendationFactors
  status: RecommendationStatus
  explanation: string | null
}

// Extended recommendation with relations
export interface RecommendationWithDetails extends TournamentRecommendation {
  tournament: Tournament
  player?: Player
}

// ============================================
// Scraper Types
// ============================================

export interface ScraperConfig {
  selectors: {
    tournamentName: string
    dates: string
    location: string
    category: string
    level?: string
  }
  pagination?: {
    type: 'button' | 'scroll' | 'url'
    selector?: string
    urlPattern?: string
    maxPages?: number
  }
  rateLimit?: {
    requestsPerMinute: number
    delayMs: number
  }
  dynamic: boolean // Whether to use Playwright vs Cheerio
}

export interface ScrapeResult {
  success: boolean
  source: string
  tournaments: ScrapedTournament[]
  errors: string[]
  scrapedAt: Date
  duration: number
}

export interface ScrapeLog {
  id: string
  created_at: string
  source_id: string
  status: 'running' | 'completed' | 'failed'
  tournaments_found: number
  tournaments_new: number
  errors: string[] | null
  duration_ms: number | null
}

// ============================================
// API Request/Response Types
// ============================================

export interface ChatRequest {
  message: string
  conversationId?: string
  context?: {
    playerId?: string
    tournamentId?: string
    weekNumber?: number
  }
}

export interface ChatResponse {
  conversationId: string
  message: ChatMessage
}

export interface RecommendRequest {
  playerId: string
  filters?: {
    dateFrom?: string
    dateTo?: string
    category?: string
    maxResults?: number
    tournamentType?: string
  }
}

export interface RecommendResponse {
  recommendations: RecommendationWithDetails[]
  generatedAt: Date
}

export interface SearchRequest {
  query: string
  sources?: SourceType[]
  filters?: {
    dateFrom?: string
    dateTo?: string
    category?: string
    location?: string
  }
}

export interface SearchResponse {
  results: ScrapedTournament[]
  sourceStatuses: Record<string, 'loading' | 'completed' | 'error'>
  totalFound: number
}

// ============================================
// Notification Types
// ============================================

export type NotificationType =
  | 'new_tournaments_discovered'
  | 'entry_deadline_approaching'
  | 'recommendation_available'
  | 'scrape_completed'
  | 'scrape_failed'

export interface AgentNotification {
  id: string
  created_at: string
  user_id: string | null
  type: NotificationType
  title: string
  message: string
  read: boolean
  data: Json | null
}

// ============================================
// Helper Types
// ============================================

export interface PlayerWithAvailability extends Player {
  availability?: PlayerAvailability[]
  coach?: Coach
}

export interface TournamentWithRecommendation extends Tournament {
  recommendation?: TournamentRecommendation
  isRecommended?: boolean
}
