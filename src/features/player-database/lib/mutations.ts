// Player Database Mutation Functions
// Supabase mutation functions for player-related data
// Note: Using type workarounds due to Supabase RLS typing limitations

import { createClient } from '@/lib/supabase/client'
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
  AttendanceUpdate
} from '../types'

function getClient() {
  return createClient()
}

// Player Mutations
export async function createPlayer(data: PlayerInsert): Promise<Player> {
  const supabase = getClient()
  const { data: player, error } = await supabase
    .from('players')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return player as Player
}

export async function updatePlayer(playerId: string, data: PlayerUpdate): Promise<Player> {
  const supabase = getClient()
  const { data: player, error } = await supabase
    .from('players')
    .update(data)
    .eq('id', playerId)
    .select()
    .single()

  if (error) throw error
  return player as Player
}

export async function deletePlayer(playerId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', playerId)

  if (error) throw error
}

export async function togglePlayerActive(playerId: string, isActive: boolean): Promise<Player> {
  return updatePlayer(playerId, { is_active: isActive })
}

// Training Load Mutations
export async function createTrainingLoad(data: TrainingLoadInsert): Promise<TrainingLoad> {
  const supabase = getClient()
  const { data: load, error } = await supabase
    .from('training_loads')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return load as TrainingLoad
}

export async function updateTrainingLoad(loadId: string, data: TrainingLoadUpdate): Promise<TrainingLoad> {
  const supabase = getClient()
  const { data: load, error } = await supabase
    .from('training_loads')
    .update(data)
    .eq('id', loadId)
    .select()
    .single()

  if (error) throw error
  return load as TrainingLoad
}

export async function deleteTrainingLoad(loadId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('training_loads')
    .delete()
    .eq('id', loadId)

  if (error) throw error
}

// Injury Mutations
export async function createInjury(data: InjuryInsert): Promise<Injury> {
  const supabase = getClient()
  const { data: injury, error } = await supabase
    .from('injuries')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return injury as Injury
}

export async function updateInjury(injuryId: string, data: InjuryUpdate): Promise<Injury> {
  const supabase = getClient()
  const { data: injury, error } = await supabase
    .from('injuries')
    .update(data)
    .eq('id', injuryId)
    .select()
    .single()

  if (error) throw error
  return injury as Injury
}

export async function clearInjury(injuryId: string, returnDate: string): Promise<Injury> {
  return updateInjury(injuryId, {
    status: 'cleared',
    actual_return: returnDate
  })
}

export async function deleteInjury(injuryId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('injuries')
    .delete()
    .eq('id', injuryId)

  if (error) throw error
}

// Notes Mutations
export async function createNote(data: PlayerNoteInsert): Promise<PlayerNote> {
  const supabase = getClient()
  const { data: note, error } = await supabase
    .from('player_notes')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return note as PlayerNote
}

export async function updateNote(noteId: string, data: PlayerNoteUpdate): Promise<PlayerNote> {
  const supabase = getClient()
  const { data: note, error } = await supabase
    .from('player_notes')
    .update(data)
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return note as PlayerNote
}

export async function deleteNote(noteId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('player_notes')
    .delete()
    .eq('id', noteId)

  if (error) throw error
}

export async function toggleNoteAiContext(noteId: string, isAiContext: boolean): Promise<PlayerNote> {
  return updateNote(noteId, { is_ai_context: isAiContext })
}

// Whereabouts Mutations
export async function createWhereabouts(data: WhereaboutsInsert): Promise<Whereabouts> {
  const supabase = getClient()
  const { data: whereabouts, error } = await supabase
    .from('whereabouts')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return whereabouts as Whereabouts
}

export async function updateWhereabouts(whereaboutsId: string, data: WhereaboutsUpdate): Promise<Whereabouts> {
  const supabase = getClient()
  const { data: whereabouts, error } = await supabase
    .from('whereabouts')
    .update(data)
    .eq('id', whereaboutsId)
    .select()
    .single()

  if (error) throw error
  return whereabouts as Whereabouts
}

export async function deleteWhereabouts(whereaboutsId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('whereabouts')
    .delete()
    .eq('id', whereaboutsId)

  if (error) throw error
}

// UTR History Mutations
export async function addUtrEntry(data: UtrHistoryInsert): Promise<UtrHistory> {
  const supabase = getClient()
  const { data: entry, error } = await supabase
    .from('utr_history')
    .insert(data)
    .select()
    .single()

  if (error) throw error

  // Update player's current UTR
  if (data.utr_value && data.player_id) {
    await supabase
      .from('players')
      .update({
        current_utr: data.utr_value,
        utr_last_updated: new Date().toISOString()
      })
      .eq('id', data.player_id)
  }

  return entry as UtrHistory
}

export async function deleteUtrEntry(entryId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('utr_history')
    .delete()
    .eq('id', entryId)

  if (error) throw error
}

// Attendance Mutations
export async function markAttendance(data: AttendanceInsert): Promise<Attendance> {
  const supabase = getClient()
  const { data: attendance, error } = await supabase
    .from('attendance')
    .upsert(data, { onConflict: 'player_id,attendance_date' })
    .select()
    .single()

  if (error) throw error
  return attendance as Attendance
}

export async function updateAttendance(attendanceId: string, data: AttendanceUpdate): Promise<Attendance> {
  const supabase = getClient()
  const { data: attendance, error } = await supabase
    .from('attendance')
    .update(data)
    .eq('id', attendanceId)
    .select()
    .single()

  if (error) throw error
  return attendance as Attendance
}

export async function deleteAttendance(attendanceId: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', attendanceId)

  if (error) throw error
}

// Bulk attendance marking for coaches
export async function markBulkAttendance(entries: AttendanceInsert[]): Promise<Attendance[]> {
  const supabase = getClient()
  const { data: attendance, error } = await supabase
    .from('attendance')
    .insert(entries)
    .select()

  if (error) throw error
  return attendance as Attendance[]
}
