// Player Database Feature
// Main export file

// Types - export specific items to avoid naming conflicts
export type {
  // Enums
  PlayerCategory,
  PlayerGender,
  InjurySeverity,
  InjuryStatus,
  WhereaboutsType,
  AttendanceStatus,
  UserRole,
  // Table types
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
  UtrHistoryUpdate,
  Attendance,
  AttendanceInsert,
  AttendanceUpdate,
  Profile,
  // Extended types
  PlayerWithDetails,
  PlayerWithStats,
  // Filter types - use the interface name to avoid conflict with component
  PlayerFilterOptions,
  DateRange,
  // Form types
  PlayerFormData,
  TrainingLoadFormData,
  InjuryFormData,
  NoteFormData,
  WhereaboutsFormData,
} from './types'

// Re-export PlayerFilters type with alias
export type { PlayerFilters as PlayerFiltersType } from './types'

// Hooks
export * from './hooks'

// Components
export * from './components'

// Library functions
export * from './lib'
