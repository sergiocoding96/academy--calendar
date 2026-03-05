// Re-export types from database.ts for Player Database feature
export type {
  // Enums
  PlayerCategory,
  PlayerGender,
  InjurySeverity,
  InjuryStatus,
  WhereaboutsType,
  AttendanceStatus,
  UserRole,
} from '@/types/database'

import type { Database } from '@/types/database'

// Table row types
export type Player = Database['public']['Tables']['players']['Row']
export type PlayerInsert = Database['public']['Tables']['players']['Insert']
export type PlayerUpdate = Database['public']['Tables']['players']['Update']

export type TrainingLoad = Database['public']['Tables']['training_loads']['Row']
export type TrainingLoadInsert = Database['public']['Tables']['training_loads']['Insert']
export type TrainingLoadUpdate = Database['public']['Tables']['training_loads']['Update']

export type Injury = Database['public']['Tables']['injuries']['Row']
export type InjuryInsert = Database['public']['Tables']['injuries']['Insert']
export type InjuryUpdate = Database['public']['Tables']['injuries']['Update']

export type PlayerNote = Database['public']['Tables']['player_notes']['Row']
export type PlayerNoteInsert = Database['public']['Tables']['player_notes']['Insert']
export type PlayerNoteUpdate = Database['public']['Tables']['player_notes']['Update']

export type Whereabouts = Database['public']['Tables']['whereabouts']['Row']
export type WhereaboutsInsert = Database['public']['Tables']['whereabouts']['Insert']
export type WhereaboutsUpdate = Database['public']['Tables']['whereabouts']['Update']

export type UtrHistory = Database['public']['Tables']['utr_history']['Row']
export type UtrHistoryInsert = Database['public']['Tables']['utr_history']['Insert']

export type Attendance = Database['public']['Tables']['attendance']['Row']
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert']
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']

// Extended types with relations
export interface PlayerWithDetails extends Player {
  coach?: Profile | null
  injuries?: Injury[]
  notes?: PlayerNote[]
  utr_history?: UtrHistory[]
  training_loads?: TrainingLoad[]
}

// Filter types
export interface PlayerFilterOptions {
  category?: Player['category']
  coachId?: string
  isActive?: boolean
  hasActiveInjury?: boolean
  search?: string
}

// Alias for backwards compatibility
export type PlayerFilters = PlayerFilterOptions

export interface DateRange {
  start: Date
  end: Date
}

// Form data types
export interface PlayerFormData {
  full_name: string
  nickname?: string
  date_of_birth?: string
  category?: Player['category']
  gender?: Player['gender']
  current_utr?: number
  coach_id?: string
  phone?: string
  email?: string
  parent_name?: string
  parent_phone?: string
  parent_email?: string
  emergency_contact?: string
  emergency_phone?: string
}

export interface TrainingLoadFormData {
  session_date: string
  rpe: number // 1-10
  duration_minutes: number
  notes?: string
}

export interface InjuryFormData {
  body_part: string
  description: string
  severity: Injury['severity']
  injury_date: string
  expected_return?: string
  notes?: string
}

export interface NoteFormData {
  category: string
  content: string
  is_ai_context: boolean
}

export interface WhereaboutsFormData {
  whereabouts_type: Whereabouts['whereabouts_type']
  start_date: string
  end_date: string
  description?: string
  location?: string
}
