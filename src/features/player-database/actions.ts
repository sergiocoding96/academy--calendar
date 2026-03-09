'use server'

import { createClient } from '@/lib/supabase/server'
import { getUserProfile, canAccessPlayer } from '@/lib/auth'
import type { UserProfile } from '@/types/database'
import type {
  Player,
  PlayerInsert,
  PlayerUpdate,
  TrainingLoad,
  TrainingLoadInsert,
  TrainingLoadUpdate,
  Injury,
  InjuryInsert,
  InjuryUpdate,
  PlayerNote,
  PlayerNoteInsert,
  PlayerNoteUpdate,
  Whereabouts,
  WhereaboutsInsert,
  WhereaboutsUpdate,
  UtrHistory,
  UtrHistoryInsert,
  Attendance,
  AttendanceInsert,
  AttendanceUpdate,
} from './types'

const UNAUTHORIZED = 'Unauthorized'
const FORBIDDEN = 'You do not have access to this player'

async function getServerClient() {
  return await createClient()
}

async function guardPlayerAccess(playerId: string): Promise<UserProfile> {
  const profile = await getUserProfile()
  if (!profile) throw new Error(UNAUTHORIZED)
  const allowed = await canAccessPlayer(profile, playerId)
  if (!allowed) throw new Error(FORBIDDEN)
  return profile
}

// ---- Player ----

export async function createPlayerAction(data: PlayerInsert): Promise<Player> {
  const profile = await getUserProfile()
  if (!profile) throw new Error(UNAUTHORIZED)
  if (profile.role !== 'coach' && profile.role !== 'admin') throw new Error(FORBIDDEN)
  const supabase = await getServerClient()
  const { data: player, error } = await supabase
    .from('players')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return player as Player
}

export async function updatePlayerAction(playerId: string, data: PlayerUpdate): Promise<Player> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { data: player, error } = await supabase
    .from('players')
    .update(data)
    .eq('id', playerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return player as Player
}

export async function deletePlayerAction(playerId: string): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase.from('players').delete().eq('id', playerId)
  if (error) throw new Error(error.message)
}

export async function togglePlayerActiveAction(playerId: string, isActive: boolean): Promise<Player> {
  return updatePlayerAction(playerId, { is_active: isActive })
}

// ---- Training loads ----

export async function createTrainingLoadAction(data: TrainingLoadInsert): Promise<TrainingLoad> {
  if (!data.player_id) throw new Error('player_id required')
  await guardPlayerAccess(data.player_id)
  const supabase = await getServerClient()
  const { data: load, error } = await supabase
    .from('training_loads')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return load as TrainingLoad
}

export async function updateTrainingLoadAction(
  playerId: string,
  loadId: string,
  data: TrainingLoadUpdate
): Promise<TrainingLoad> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { data: load, error } = await supabase
    .from('training_loads')
    .update(data)
    .eq('id', loadId)
    .eq('player_id', playerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return load as TrainingLoad
}

export async function deleteTrainingLoadAction(playerId: string, loadId: string): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase
    .from('training_loads')
    .delete()
    .eq('id', loadId)
    .eq('player_id', playerId)
  if (error) throw new Error(error.message)
}

// ---- Injuries ----

export async function createInjuryAction(data: InjuryInsert): Promise<Injury> {
  if (!data.player_id) throw new Error('player_id required')
  await guardPlayerAccess(data.player_id)
  const supabase = await getServerClient()
  const { data: injury, error } = await supabase
    .from('injuries')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return injury as Injury
}

export async function updateInjuryAction(
  playerId: string,
  injuryId: string,
  data: InjuryUpdate
): Promise<Injury> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { data: injury, error } = await supabase
    .from('injuries')
    .update(data)
    .eq('id', injuryId)
    .eq('player_id', playerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return injury as Injury
}

export async function clearInjuryAction(
  playerId: string,
  injuryId: string,
  returnDate: string
): Promise<Injury> {
  return updateInjuryAction(playerId, injuryId, {
    status: 'cleared',
    actual_return: returnDate,
  })
}

export async function deleteInjuryAction(playerId: string, injuryId: string): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase
    .from('injuries')
    .delete()
    .eq('id', injuryId)
    .eq('player_id', playerId)
  if (error) throw new Error(error.message)
}

// ---- Notes ----

export async function createNoteAction(data: PlayerNoteInsert): Promise<PlayerNote> {
  if (!data.player_id) throw new Error('player_id required')
  await guardPlayerAccess(data.player_id)
  const supabase = await getServerClient()
  const { data: note, error } = await supabase
    .from('player_notes')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return note as PlayerNote
}

export async function updateNoteAction(
  playerId: string,
  noteId: string,
  data: PlayerNoteUpdate
): Promise<PlayerNote> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { data: note, error } = await supabase
    .from('player_notes')
    .update(data)
    .eq('id', noteId)
    .eq('player_id', playerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return note as PlayerNote
}

export async function deleteNoteAction(playerId: string, noteId: string): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase
    .from('player_notes')
    .delete()
    .eq('id', noteId)
    .eq('player_id', playerId)
  if (error) throw new Error(error.message)
}

export async function toggleNoteAiContextAction(
  playerId: string,
  noteId: string,
  isAiContext: boolean
): Promise<PlayerNote> {
  return updateNoteAction(playerId, noteId, { is_ai_context: isAiContext })
}

// ---- Whereabouts ----

export async function createWhereaboutsAction(data: WhereaboutsInsert): Promise<Whereabouts> {
  if (!data.player_id) throw new Error('player_id required')
  await guardPlayerAccess(data.player_id)
  const supabase = await getServerClient()
  const { data: whereabouts, error } = await supabase
    .from('whereabouts')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return whereabouts as Whereabouts
}

export async function updateWhereaboutsAction(
  playerId: string,
  whereaboutsId: string,
  data: WhereaboutsUpdate
): Promise<Whereabouts> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { data: whereabouts, error } = await supabase
    .from('whereabouts')
    .update(data)
    .eq('id', whereaboutsId)
    .eq('player_id', playerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return whereabouts as Whereabouts
}

export async function deleteWhereaboutsAction(
  playerId: string,
  whereaboutsId: string
): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase
    .from('whereabouts')
    .delete()
    .eq('id', whereaboutsId)
    .eq('player_id', playerId)
  if (error) throw new Error(error.message)
}

// ---- UTR ----

export async function addUtrEntryAction(data: UtrHistoryInsert): Promise<UtrHistory> {
  if (!data.player_id) throw new Error('player_id required')
  await guardPlayerAccess(data.player_id)
  const supabase = await getServerClient()
  const { data: entry, error } = await supabase
    .from('utr_history')
    .insert(data)
    .select()
    .single()
  if (error) throw new Error(error.message)
  if (data.utr_value && data.player_id) {
    await supabase
      .from('players')
      .update({
        current_utr: data.utr_value,
        utr_last_updated: new Date().toISOString(),
      })
      .eq('id', data.player_id)
  }
  return entry as UtrHistory
}

export async function deleteUtrEntryAction(playerId: string, entryId: string): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase
    .from('utr_history')
    .delete()
    .eq('id', entryId)
    .eq('player_id', playerId)
  if (error) throw new Error(error.message)
}

// ---- Attendance ----

export async function markAttendanceAction(data: AttendanceInsert): Promise<Attendance> {
  if (!data.player_id) throw new Error('player_id required')
  await guardPlayerAccess(data.player_id)
  const supabase = await getServerClient()
  const { data: attendance, error } = await supabase
    .from('attendance')
    .upsert(data, { onConflict: 'player_id,attendance_date' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return attendance as Attendance
}

export async function updateAttendanceAction(
  playerId: string,
  attendanceId: string,
  data: AttendanceUpdate
): Promise<Attendance> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { data: attendance, error } = await supabase
    .from('attendance')
    .update(data)
    .eq('id', attendanceId)
    .eq('player_id', playerId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return attendance as Attendance
}

export async function deleteAttendanceAction(
  playerId: string,
  attendanceId: string
): Promise<void> {
  await guardPlayerAccess(playerId)
  const supabase = await getServerClient()
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', attendanceId)
    .eq('player_id', playerId)
  if (error) throw new Error(error.message)
}

export async function markBulkAttendanceAction(
  entries: AttendanceInsert[]
): Promise<Attendance[]> {
  const profile = await getUserProfile()
  if (!profile || (profile.role !== 'coach' && profile.role !== 'admin')) {
    throw new Error(UNAUTHORIZED)
  }
  const supabase = await getServerClient()
  const playerIds = [...new Set(entries.map(e => e.player_id))]
  for (const pid of playerIds) {
    const allowed = await canAccessPlayer(profile, pid)
    if (!allowed) throw new Error(FORBIDDEN)
  }
  const { data: attendance, error } = await supabase
    .from('attendance')
    .insert(entries)
    .select()
  if (error) throw new Error(error.message)
  return attendance as Attendance[]
}
