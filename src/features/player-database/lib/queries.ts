// Player Database Query Functions
// Supabase query builders for player-related data

import { createClient } from '@/lib/supabase/client'
import type { PlayerFilterOptions, DateRange, Player, PlayerWithDetails, Profile } from '../types'

// Player with coach relation type
type PlayerWithCoach = Player & {
  coach?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

// Player Queries
export async function getPlayer(playerId: string): Promise<PlayerWithCoach> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      coach:profiles!players_coach_id_fkey(id, full_name, avatar_url)
    `)
    .eq('id', playerId)
    .single()

  if (error) throw error
  return data as PlayerWithCoach
}

export async function getPlayers(filters?: PlayerFilterOptions): Promise<PlayerWithCoach[]> {
  const supabase = createClient()
  let query = supabase
    .from('players')
    .select(`
      *,
      coach:profiles!players_coach_id_fkey(id, full_name, avatar_url)
    `)
    .order('full_name')

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }
  if (filters?.coachId) {
    query = query.eq('coach_id', filters.coachId)
  }
  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }
  if (filters?.search) {
    query = query.ilike('full_name', `%${filters.search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []) as PlayerWithCoach[]
}

export async function getPlayerWithDetails(playerId: string): Promise<PlayerWithDetails> {
  const last30Days = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
  const [player, injuries, notes, utrHistory, trainingLoads] = await Promise.all([
    getPlayer(playerId),
    getPlayerInjuries(playerId),
    getPlayerNotes(playerId),
    getPlayerUtrHistory(playerId, last30Days),
    getPlayerTrainingLoads(playerId, last30Days)
  ])

  return {
    ...player,
    injuries,
    notes,
    utr_history: utrHistory,
    training_loads: trainingLoads
  } as PlayerWithDetails
}

// Training Load Queries
export async function getPlayerTrainingLoads(playerId: string, dateRange?: DateRange) {
  const supabase = createClient()
  let query = supabase
    .from('training_loads')
    .select('*')
    .eq('player_id', playerId)
    .order('session_date', { ascending: false })

  if (dateRange) {
    query = query
      .gte('session_date', dateRange.start.toISOString().split('T')[0])
      .lte('session_date', dateRange.end.toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Injury Queries
export async function getPlayerInjuries(playerId: string, activeOnly = false) {
  const supabase = createClient()
  let query = supabase
    .from('injuries')
    .select('*')
    .eq('player_id', playerId)
    .order('injury_date', { ascending: false })

  if (activeOnly) {
    query = query.neq('status', 'cleared')
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getActiveInjuries(playerId: string) {
  return getPlayerInjuries(playerId, true)
}

// Notes Queries
export async function getPlayerNotes(playerId: string, aiContextOnly = false) {
  const supabase = createClient()
  let query = supabase
    .from('player_notes')
    .select('*')
    .eq('player_id', playerId)
    .order('created_at', { ascending: false })

  if (aiContextOnly) {
    query = query.eq('is_ai_context', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Whereabouts Queries
export async function getPlayerWhereabouts(playerId: string, dateRange?: DateRange) {
  const supabase = createClient()
  let query = supabase
    .from('whereabouts')
    .select('*')
    .eq('player_id', playerId)
    .order('start_date', { ascending: true })

  if (dateRange) {
    query = query
      .gte('end_date', dateRange.start.toISOString().split('T')[0])
      .lte('start_date', dateRange.end.toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getUpcomingWhereabouts(playerId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('whereabouts')
    .select('*')
    .eq('player_id', playerId)
    .gte('end_date', today)
    .order('start_date', { ascending: true })

  if (error) throw error
  return data || []
}

// UTR History Queries
export async function getPlayerUtrHistory(playerId: string, dateRange?: DateRange) {
  const supabase = createClient()
  let query = supabase
    .from('utr_history')
    .select('*')
    .eq('player_id', playerId)
    .order('recorded_date', { ascending: false })

  if (dateRange) {
    query = query
      .gte('recorded_date', dateRange.start.toISOString().split('T')[0])
      .lte('recorded_date', dateRange.end.toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Attendance Queries
export async function getPlayerAttendance(playerId: string, dateRange?: DateRange) {
  const supabase = createClient()
  let query = supabase
    .from('attendance')
    .select('*')
    .eq('player_id', playerId)
    .order('attendance_date', { ascending: false })

  if (dateRange) {
    query = query
      .gte('attendance_date', dateRange.start.toISOString().split('T')[0])
      .lte('attendance_date', dateRange.end.toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// Coach Queries (for dropdowns)
export async function getCoaches() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('role', 'coach')
    .order('full_name')

  if (error) throw error
  return data || []
}
