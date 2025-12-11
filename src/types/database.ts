export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

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
