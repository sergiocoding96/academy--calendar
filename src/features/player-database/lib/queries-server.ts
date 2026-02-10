// Server-side player/coach queries for initial page data.
// Use createClient from @/lib/supabase/server so data is fetched on the server.

import { createClient } from '@/lib/supabase/server'
import type {
  PlayerFilterOptions,
  Player,
  Profile,
  PlayerWithDetails,
  DateRange,
} from '../types'

type PlayerWithCoach = Player & {
  coach?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

function normalisePlayer(row: Record<string, unknown>): PlayerWithCoach {
  return {
    ...row,
    full_name: (row.full_name ?? row.name ?? 'Unknown') as string,
    is_active: row.is_active ?? (row.status !== 'inactive'),
    category: (row.category ?? row.age_group ?? null) as Player['category'],
    coach_id: (row.coach_id ?? row.primary_coach_id ?? null) as string | null,
    coach: row.coach as PlayerWithCoach['coach'],
  } as PlayerWithCoach
}

export async function getPlayersServer(
  filters?: PlayerFilterOptions
): Promise<PlayerWithCoach[]> {
  const supabase = await createClient()

  let query = supabase
    .from('players')
    .select('*, coach:profiles!coach_id(id, full_name, avatar_url)')
    .order('full_name')

  if (filters?.category) query = query.eq('category', filters.category)
  if (filters?.coachId) query = query.eq('coach_id', filters.coachId)
  if (filters?.isActive !== undefined) query = query.eq('is_active', filters.isActive)
  if (filters?.search) query = query.ilike('full_name', `%${filters.search}%`)

  const { data, error } = await query
  if (!error) return (data || []) as PlayerWithCoach[]

  // Fallback: plain select (e.g. old schema)
  let fbQuery = supabase.from('players').select('*').order('name')
  if (filters?.search) fbQuery = fbQuery.ilike('name', `%${filters.search}%`)

  const fb = await fbQuery
  if (fb.error) throw fb.error
  return (fb.data || []).map(normalisePlayer) as PlayerWithCoach[]
}

export async function getCoachesServer(): Promise<
  Pick<Profile, 'id' | 'full_name' | 'avatar_url'>[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('role', 'coach')
    .order('full_name')

  if (!error) return data || []

  const fb = await supabase
    .from('coaches')
    .select('id, name, email')
    .order('name')

  if (fb.error) throw fb.error
  return (fb.data || []).map((c: { id: string; name: string; email?: string }) => ({
    id: c.id,
    full_name: c.name,
    avatar_url: null,
  }))
}

async function getPlayerServer(playerId: string): Promise<PlayerWithCoach> {
  const supabase = await createClient()

  // Try full schema with coach join first
  const { data, error } = await supabase
    .from('players')
    .select('*, coach:profiles!coach_id(id, full_name, avatar_url)')
    .eq('id', playerId)
    .single()

  if (!error && data) {
    return data as PlayerWithCoach
  }

  // Fallback: plain select (no profiles relationship in this project)
  const fb = await supabase
    .from('players')
    .select('*')
    .eq('id', playerId)
    .single()

  if (fb.error || !fb.data) {
    throw fb.error || new Error('Player not found')
  }

  return normalisePlayer(fb.data) as PlayerWithCoach
}

function lastNDaysRange(days: number): DateRange {
  const end = new Date()
  const start = new Date(end)
  start.setDate(end.getDate() - days)
  return { start, end }
}

export async function getPlayerWithDetailsServer(
  playerId: string
): Promise<PlayerWithDetails> {
  const supabase = await createClient()
  const last30Days = lastNDaysRange(30)

  const [player, injuriesRes, notesRes, utrRes, loadsRes] = await Promise.all([
    getPlayerServer(playerId),
    supabase
      .from('injuries')
      .select('*')
      .eq('player_id', playerId)
      .order('injury_date', { ascending: false }),
    supabase
      .from('player_notes')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false }),
    supabase
      .from('utr_history')
      .select('*')
      .eq('player_id', playerId)
      .gte('recorded_date', last30Days.start.toISOString().split('T')[0])
      .lte('recorded_date', last30Days.end.toISOString().split('T')[0])
      .order('recorded_date', { ascending: false }),
    supabase
      .from('training_loads')
      .select('*')
      .eq('player_id', playerId)
      .gte('session_date', last30Days.start.toISOString().split('T')[0])
      .lte('session_date', last30Days.end.toISOString().split('T')[0])
      .order('session_date', { ascending: false }),
  ])

  const injuries = injuriesRes.error ? [] : injuriesRes.data || []
  const notes = notesRes.error ? [] : notesRes.data || []
  const utrHistory = utrRes.error ? [] : utrRes.data || []
  const trainingLoads = loadsRes.error ? [] : loadsRes.data || []

  return {
    ...(player as Player),
    coach: (player as PlayerWithCoach).coach ?? null,
    injuries,
    notes,
    utr_history: utrHistory,
    training_loads: trainingLoads,
  } as PlayerWithDetails
}
