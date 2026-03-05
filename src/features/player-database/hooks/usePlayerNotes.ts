'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getPlayerNotes } from '../lib/queries'
import { createNote, updateNote, deleteNote, toggleNoteAiContext } from '../lib/mutations'
import type { PlayerNote, PlayerNoteInsert, PlayerNoteUpdate } from '../types'

interface UsePlayerNotesOptions {
  aiContextOnly?: boolean
}

interface UsePlayerNotesReturn {
  notes: PlayerNote[]
  aiContextNotes: PlayerNote[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  addNote: (data: Omit<PlayerNoteInsert, 'player_id'>) => Promise<PlayerNote>
  updateNote: (noteId: string, data: PlayerNoteUpdate) => Promise<void>
  removeNote: (noteId: string) => Promise<void>
  toggleAiContext: (noteId: string, isAiContext: boolean) => Promise<void>
}

export function usePlayerNotes(
  playerId: string | null,
  options: UsePlayerNotesOptions = {}
): UsePlayerNotesReturn {
  const { aiContextOnly = false } = options
  const [notes, setNotes] = useState<PlayerNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!playerId) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getPlayerNotes(playerId, aiContextOnly)
      setNotes(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notes'))
      setNotes([])
    } finally {
      setLoading(false)
    }
  }, [playerId, aiContextOnly])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const addNote = useCallback(async (data: Omit<PlayerNoteInsert, 'player_id'>): Promise<PlayerNote> => {
    if (!playerId) throw new Error('No player ID provided')

    try {
      const newNote = await createNote({ ...data, player_id: playerId })
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add note')
    }
  }, [playerId])

  const updateNoteHandler = useCallback(async (noteId: string, data: PlayerNoteUpdate) => {
    try {
      const updated = await updateNote(noteId, data)
      setNotes(prev =>
        prev.map(note => note.id === noteId ? updated : note)
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update note')
    }
  }, [])

  const removeNote = useCallback(async (noteId: string) => {
    try {
      await deleteNote(noteId)
      setNotes(prev => prev.filter(note => note.id !== noteId))
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete note')
    }
  }, [])

  const toggleAiContext = useCallback(async (noteId: string, isAiContext: boolean) => {
    try {
      await toggleNoteAiContext(noteId, isAiContext)
      setNotes(prev =>
        prev.map(note =>
          note.id === noteId ? { ...note, is_ai_context: isAiContext } : note
        )
      )
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle AI context')
    }
  }, [])

  // Derived state (memoized to prevent unnecessary re-renders)
  const aiContextNotes = useMemo(() => notes.filter(note => note.is_ai_context), [notes])

  return {
    notes,
    aiContextNotes,
    loading,
    error,
    refetch: fetchNotes,
    addNote,
    updateNote: updateNoteHandler,
    removeNote,
    toggleAiContext
  }
}
