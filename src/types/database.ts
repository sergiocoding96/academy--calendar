export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'player' | 'coach' | 'admin'
export type GoalType = 'practice' | 'strength' | 'conditioning' | 'flexibility'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type MatchResult = 'win' | 'loss' | 'walkover' | 'retired'
export type MatchType = 'singles' | 'doubles'
export type FitnessCategory = 'strength' | 'conditioning' | 'flexibility' | 'mobility'

export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string
          created_at: string
          name: string
          age_group: string | null
          gender: string | null
          ranking: string | null
          contact_email: string | null
          contact_phone: string | null
          status: string
          notes: string | null
          primary_coach_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          age_group?: string | null
          gender?: string | null
          ranking?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          status?: string
          notes?: string | null
          primary_coach_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          age_group?: string | null
          gender?: string | null
          ranking?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          status?: string
          notes?: string | null
          primary_coach_id?: string | null
        }
      }
      coaches: {
        Row: {
          id: string
          created_at: string
          name: string
          role: string | null
          specializations: string[] | null
          color_code: string | null
          email: string | null
          phone: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          role?: string | null
          specializations?: string[] | null
          color_code?: string | null
          email?: string | null
          phone?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          role?: string | null
          specializations?: string[] | null
          color_code?: string | null
          email?: string | null
          phone?: string | null
          status?: string
        }
      }
      courts: {
        Row: {
          id: string
          created_at: string
          name: string
          surface_type: string
          location: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          surface_type: string
          location?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          surface_type?: string
          location?: string | null
          status?: string
        }
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          date: string
          start_time: string
          end_time: string
          court_id: string | null
          coach_id: string | null
          session_type: string
          notes: string | null
          is_private: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          date: string
          start_time: string
          end_time: string
          court_id?: string | null
          coach_id?: string | null
          session_type?: string
          notes?: string | null
          is_private?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          date?: string
          start_time?: string
          end_time?: string
          court_id?: string | null
          coach_id?: string | null
          session_type?: string
          notes?: string | null
          is_private?: boolean
        }
      }
      session_players: {
        Row: {
          id: string
          created_at: string
          session_id: string
          player_id: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          player_id: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          player_id?: string
          status?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          created_at: string
          name: string
          location: string
          start_date: string
          end_date: string
          category: string
          level: string | null
          entry_deadline: string | null
          zone: number | null
          tournament_type: string | null
          notes: string | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          location: string
          start_date: string
          end_date: string
          category: string
          level?: string | null
          entry_deadline?: string | null
          zone?: number | null
          tournament_type?: string | null
          notes?: string | null
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          location?: string
          start_date?: string
          end_date?: string
          category?: string
          level?: string | null
          entry_deadline?: string | null
          zone?: number | null
          tournament_type?: string | null
          notes?: string | null
          status?: string
        }
      }
      tournament_assignments: {
        Row: {
          id: string
          created_at: string
          tournament_id: string
          player_id: string | null
          coach_id: string | null
          role: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          tournament_id: string
          player_id?: string | null
          coach_id?: string | null
          role?: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          tournament_id?: string
          player_id?: string | null
          coach_id?: string | null
          role?: string
          status?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          created_at: string
          email: string
          full_name: string | null
          role: UserRole
          player_id: string | null
          coach_id: string | null
          avatar_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          full_name?: string | null
          role: UserRole
          player_id?: string | null
          coach_id?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          role?: UserRole
          player_id?: string | null
          coach_id?: string | null
          avatar_url?: string | null
        }
      }
      player_coach_assignments: {
        Row: {
          id: string
          created_at: string
          player_id: string
          coach_id: string
          is_primary: boolean
          assigned_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          player_id: string
          coach_id: string
          is_primary?: boolean
          assigned_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          player_id?: string
          coach_id?: string
          is_primary?: boolean
          assigned_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          created_at: string
          player_id: string
          goal_type: GoalType
          title: string
          description: string | null
          target_value: number | null
          target_unit: string | null
          current_value: number
          target_date: string | null
          status: GoalStatus
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          player_id: string
          goal_type: GoalType
          title: string
          description?: string | null
          target_value?: number | null
          target_unit?: string | null
          current_value?: number
          target_date?: string | null
          status?: GoalStatus
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          player_id?: string
          goal_type?: GoalType
          title?: string
          description?: string | null
          target_value?: number | null
          target_unit?: string | null
          current_value?: number
          target_date?: string | null
          status?: GoalStatus
          completed_at?: string | null
        }
      }
      goal_progress: {
        Row: {
          id: string
          created_at: string
          goal_id: string
          recorded_at: string
          value: number
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          goal_id: string
          recorded_at?: string
          value: number
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          goal_id?: string
          recorded_at?: string
          value?: number
          notes?: string | null
        }
      }
      session_ratings: {
        Row: {
          id: string
          created_at: string
          session_id: string
          player_id: string
          rated_by: string | null
          overall_rating: number | null
          effort_rating: number | null
          technique_rating: number | null
          attitude_rating: number | null
          tactical_rating: number | null
          notes: string | null
          duration_minutes: number | null
          intensity_level: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          session_id: string
          player_id: string
          rated_by?: string | null
          overall_rating?: number | null
          effort_rating?: number | null
          technique_rating?: number | null
          attitude_rating?: number | null
          tactical_rating?: number | null
          notes?: string | null
          duration_minutes?: number | null
          intensity_level?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          session_id?: string
          player_id?: string
          rated_by?: string | null
          overall_rating?: number | null
          effort_rating?: number | null
          technique_rating?: number | null
          attitude_rating?: number | null
          tactical_rating?: number | null
          notes?: string | null
          duration_minutes?: number | null
          intensity_level?: number | null
        }
      }
      match_results: {
        Row: {
          id: string
          created_at: string
          tournament_id: string
          player_id: string
          opponent_name: string
          opponent_ranking: string | null
          round: string | null
          match_date: string
          result: MatchResult
          score: string
          first_serve_pct: number | null
          aces: number
          double_faults: number
          winners: number
          unforced_errors: number
          break_points_won: number
          break_points_faced: number
          holds: number
          breaks: number
          notes: string | null
          match_type: MatchType
        }
        Insert: {
          id?: string
          created_at?: string
          tournament_id: string
          player_id: string
          opponent_name: string
          opponent_ranking?: string | null
          round?: string | null
          match_date: string
          result: MatchResult
          score: string
          first_serve_pct?: number | null
          aces?: number
          double_faults?: number
          winners?: number
          unforced_errors?: number
          break_points_won?: number
          break_points_faced?: number
          holds?: number
          breaks?: number
          notes?: string | null
          match_type?: MatchType
        }
        Update: {
          id?: string
          created_at?: string
          tournament_id?: string
          player_id?: string
          opponent_name?: string
          opponent_ranking?: string | null
          round?: string | null
          match_date?: string
          result?: MatchResult
          score?: string
          first_serve_pct?: number | null
          aces?: number
          double_faults?: number
          winners?: number
          unforced_errors?: number
          break_points_won?: number
          break_points_faced?: number
          holds?: number
          breaks?: number
          notes?: string | null
          match_type?: MatchType
        }
      }
      fitness_logs: {
        Row: {
          id: string
          created_at: string
          player_id: string
          log_date: string
          category: FitnessCategory
          exercise_name: string
          sets: number | null
          reps: number | null
          weight_kg: number | null
          duration_seconds: number | null
          distance_meters: number | null
          notes: string | null
          rpe: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          player_id: string
          log_date?: string
          category: FitnessCategory
          exercise_name: string
          sets?: number | null
          reps?: number | null
          weight_kg?: number | null
          duration_seconds?: number | null
          distance_meters?: number | null
          notes?: string | null
          rpe?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          player_id?: string
          log_date?: string
          category?: FitnessCategory
          exercise_name?: string
          sets?: number | null
          reps?: number | null
          weight_kg?: number | null
          duration_seconds?: number | null
          distance_meters?: number | null
          notes?: string | null
          rpe?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Player = Database['public']['Tables']['players']['Row']
export type Coach = Database['public']['Tables']['coaches']['Row']
export type Court = Database['public']['Tables']['courts']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionPlayer = Database['public']['Tables']['session_players']['Row']
export type Tournament = Database['public']['Tables']['tournaments']['Row']
export type TournamentAssignment = Database['public']['Tables']['tournament_assignments']['Row']
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type PlayerCoachAssignment = Database['public']['Tables']['player_coach_assignments']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalProgress = Database['public']['Tables']['goal_progress']['Row']
export type SessionRating = Database['public']['Tables']['session_ratings']['Row']
export type MatchResultRecord = Database['public']['Tables']['match_results']['Row']
export type FitnessLog = Database['public']['Tables']['fitness_logs']['Row']

// Extended types with relations
export type PlayerWithCoach = Player & {
  primary_coach?: Coach | null
}

export type GoalWithProgress = Goal & {
  progress?: GoalProgress[]
}

export type SessionWithRating = Session & {
  rating?: SessionRating | null
}

export type MatchResultWithTournament = MatchResultRecord & {
  tournament?: Tournament
}
