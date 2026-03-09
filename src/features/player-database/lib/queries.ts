// Player Database Query Functions
// Supabase query builders for player-related data
//
// Queries try the full schema first (profiles join). If the migration
// hasn't been run yet they fall back to a plain select so the page
// still loads.

import { createClient } from '@/lib/supabase/client'
import type { PlayerFilterOptions, DateRange, Player, PlayerWithDetails } from '../types'

type CoachInfo = { id: string; name: string; email: string | null } | null

// Player with coach relation type
type PlayerWithCoach = Player & {
  coach?: CoachInfo
}

/** Normalise a row from the old schema (name, status, primary_coach_id) into
 *  the shape the UI expects (full_name, is_active, coach_id). */
function normalisePlayer(row: any): any {
  return {
    ...row,
    full_name: row.full_name ?? row.name ?? 'Unknown',
    is_active: row.is_active ?? (row.status !== 'inactive'),
    category: row.category ?? row.age_group ?? null,
    coach_id: row.coach_id ?? row.primary_coach_id ?? null,
    coach: row.coach ?? null,
  }
}

// Player Queries
export async function getPlayer(playerId: string): Promise<PlayerWithCoach> {
  const supabase = createClient()

  // Try full schema with coach join
  const { data, error } = await supabase
    .from('players')
    .select('*, coach:coaches(id, name, email)')
    .eq('id', playerId)
    .single()

  if (!error) return data as PlayerWithCoach

  // Fallback: plain select
  const fb = await supabase.from('players').select('*').eq('id', playerId).single()
  if (fb.error) throw fb.error
  return normalisePlayer(fb.data) as PlayerWithCoach
}

export async function getPlayers(filters?: PlayerFilterOptions): Promise<PlayerWithCoach[]> {
  const supabase = createClient()

  // Try full schema
  let query = supabase
    .from('players')
    .select('*, coach:coaches(id, name, email)')
    .order('full_name')

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.coachId) query = query.eq('coach_id', filters.coachId)
  if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive)
  if (filters?.search) query = query.ilike('full_name', `%${filters.search}%`)

  const { data, error } = await query
  if (!error) return (data || []) as PlayerWithCoach[]

  // Fallback: plain select (old schema)
  let fbQuery = supabase.from('players').select('*').order('name')
  if (filters?.search) fbQuery = fbQuery.ilike('name', `%${filters.search}%`)

  const fb = await fbQuery
  if (fb.error) throw fb.error
  return (fb.data || []).map(normalisePlayer) as PlayerWithCoach[]
}

export async function getPlayerWithDetails(playerId: string): Promise<PlayerWithDetails> {
  const last30Days = { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }

  // getPlayer is resilient; the sub-table queries use try/catch so they
  // return [] if the table doesn't exist yet.
  const [player, injuries, notes, utrHistory, trainingLoads] = await Promise.all([
    getPlayer(playerId),
    getPlayerInjuries(playerId).catch(() => []),
    getPlayerNotes(playerId).catch(() => []),
    getPlayerUtrHistory(playerId, last30Days).catch(() => []),
    getPlayerTrainingLoads(playerId, last30Days).catch(() => []),
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

  // Try profiles table first (new schema)
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('role', 'coach')
    .order('full_name')

  if (!error) return data || []

  // Fallback: use coaches table (old schema)
  const fb = await supabase
    .from('coaches')
    .select('id, name, email')
    .order('name')

  if (fb.error) throw fb.error
  return (fb.data || []).map((c: any) => ({
    id: c.id,
    full_name: c.name,
    avatar_url: null,
  }))
}
