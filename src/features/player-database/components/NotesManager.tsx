'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2, Edit2, Save, X, Bot, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createNote, updateNote, deleteNote, toggleNoteAiContext } from '../lib/mutations'
import type { PlayerNote, PlayerNoteInsert, PlayerNoteUpdate } from '../types'

interface NotesManagerProps {
  playerId: string
  notes: PlayerNote[]
  onNotesChange?: () => void
  className?: string
}

const NOTE_CATEGORIES = [
  'General',
  'Technique',
  'Tactics',
  'Mental',
  'Physical',
  'Competition',
  'Goals',
  'Other',
]

interface NoteFormData {
  category: string
  note_text: string
  is_ai_context: boolean
}

function NoteForm({
  note,
  onSave,
  onCancel,
  saving,
}: {
  note?: PlayerNote | null
  onSave: (data: NoteFormData) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [formData, setFormData] = useState<NoteFormData>({
    category: note?.category || 'General',
    note_text: note?.note_text || '',
    is_ai_context: note?.is_ai_context || false,
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.note_text.trim()) {
      setError('Note content is required')
      return
    }

    try {
      await onSave(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-stone-200 p-4 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            {NOTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.is_ai_context}
                onChange={(e) => setFormData(prev => ({ ...prev, is_ai_context: e.target.checked }))}
                className="sr-only"
              />
              <div className={cn(
                'w-10 h-6 rounded-full transition-colors',
                formData.is_ai_context ? 'bg-purple-500' : 'bg-stone-300'
              )}>
                <div className={cn(
                  'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                  formData.is_ai_context ? 'translate-x-5' : 'translate-x-1'
                )} />
              </div>
            </div>
            <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
              <Bot className="w-4 h-4 text-purple-500" />
              Include in AI Context
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Note <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.note_text}
          onChange={(e) => setFormData(prev => ({ ...prev, note_text: e.target.value }))}
          rows={4}
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
          placeholder="Enter your note..."
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-stone-800"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save
        </button>
      </div>
    </form>
  )
}

function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleAiContext,
}: {
  note: PlayerNote
  onEdit: () => void
  onDelete: () => void
  onToggleAiContext: () => void
}) {
  const [deleting, setDeleting] = useState(false)
  const [togglingAi, setTogglingAi] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return

    setDeleting(true)
    try {
      await onDelete()
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleAi = async () => {
    setTogglingAi(true)
    try {
      await onToggleAiContext()
    } finally {
      setTogglingAi(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {note.category && (
              <span className="px-2 py-0.5 text-xs font-medium bg-stone-100 text-stone-600 rounded">
                {note.category}
              </span>
            )}
            {note.is_ai_context && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-600 rounded">
                <Bot className="w-3 h-3" />
                AI Context
              </span>
            )}
            <span className="text-xs text-stone-400">
              {new Date(note.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">{note.note_text}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleAi}
            disabled={togglingAi}
            className={cn(
              'p-2 rounded-lg transition-colors',
              note.is_ai_context
                ? 'text-purple-600 bg-purple-50 hover:bg-purple-100'
                : 'text-stone-400 hover:text-purple-600 hover:bg-purple-50'
            )}
            title={note.is_ai_context ? 'Remove from AI context' : 'Add to AI context'}
          >
            {togglingAi ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
            title="Edit note"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete note"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotesManager({
  playerId,
  notes,
  onNotesChange,
  className,
}: NotesManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState<PlayerNote | null>(null)
  const [saving, setSaving] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [showAiOnly, setShowAiOnly] = useState(false)

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    if (filterCategory && note.category !== filterCategory) return false
    if (showAiOnly && !note.is_ai_context) return false
    return true
  })

  // Sort by date (newest first)
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const handleSave = async (data: NoteFormData) => {
    setSaving(true)
    try {
      if (editingNote) {
        const updateData: PlayerNoteUpdate = {
          category: data.category,
          note_text: data.note_text.trim(),
          is_ai_context: data.is_ai_context,
        }
        await updateNote(editingNote.id, updateData)
      } else {
        const insertData: PlayerNoteInsert = {
          player_id: playerId,
          category: data.category,
          note_text: data.note_text.trim(),
          is_ai_context: data.is_ai_context,
        }
        await createNote(insertData)
      }
      setShowForm(false)
      setEditingNote(null)
      onNotesChange?.()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId)
    onNotesChange?.()
  }

  const handleToggleAiContext = async (note: PlayerNote) => {
    await toggleNoteAiContext(note.id, !note.is_ai_context)
    onNotesChange?.()
  }

  const handleEdit = (note: PlayerNote) => {
    setEditingNote(note)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingNote(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-stone-600" />
          <h3 className="font-semibold text-stone-900">Notes</h3>
          <span className="text-sm text-stone-500">({notes.length})</span>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            <Plus className="w-4 h-4" />
            Add Note
          </button>
        )}
      </div>

      {/* Filters */}
      {notes.length > 0 && !showForm && (
        <div className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">All Categories</option>
            {NOTE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showAiOnly}
              onChange={(e) => setShowAiOnly(e.target.checked)}
              className="w-4 h-4 text-purple-600 border-stone-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-stone-600 flex items-center gap-1">
              <Bot className="w-4 h-4 text-purple-500" />
              AI Context Only
            </span>
          </label>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <NoteForm
          note={editingNote}
          onSave={handleSave}
          onCancel={handleCancelForm}
          saving={saving}
        />
      )}

      {/* Notes List */}
      {sortedNotes.length > 0 ? (
        <div className="space-y-3">
          {sortedNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => handleEdit(note)}
              onDelete={() => handleDelete(note.id)}
              onToggleAiContext={() => handleToggleAiContext(note)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-stone-500">
          {notes.length === 0 ? (
            <p>No notes yet. Add your first note!</p>
          ) : (
            <p>No notes match the current filters.</p>
          )}
        </div>
      )}
    </div>
  )
}
