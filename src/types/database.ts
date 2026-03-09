export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// ============================================
// ENUM TYPES
// ============================================
export type UserRole = 'admin' | 'manager' | 'coach' | 'player' | 'parent'
export type PlayerCategory = 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'Open' | 'Adult'
export type PlayerGender = 'M' | 'F'
export type InjurySeverity = 'minor' | 'moderate' | 'severe'
export type InjuryStatus = 'active' | 'recovering' | 'cleared'
export type WhereaboutsType = 'tournament' | 'holiday' | 'camp' | 'injured' | 'other'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused' | 'tournament' | 'injured' | 'holiday'
export type ScheduleStatus = 'draft' | 'published' | 'archived'
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'
export type SessionPlayerStatus = 'confirmed' | 'cancelled' | 'no_show' | 'completed' | 'absent' | 'pending'
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected'
export type VehicleStatus = 'available' | 'in_transit' | 'unavailable' | 'maintenance'
export type CardStatus = 'at_base' | 'with_coach' | 'at_tournament'
export type LocationType = 'club' | 'gym' | 'summer' | 'tournament' | 'hotel' | 'other'
export type ExpenseType = 'fuel' | 'toll' | 'parking' | 'maintenance' | 'other'
export type RegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'withdrawn'
export type MatchResult = 'win' | 'loss' | 'walkover' | 'retired' | 'pending'
export type TournamentRound = 'Q1' | 'Q2' | 'Q3' | 'R128' | 'R64' | 'R32' | 'R16' | 'QF' | 'SF' | 'F'
export type MatchplayWeekStatus = 'draft' | 'generating' | 'review' | 'published'
export type MatchplayMatchStatus = 'suggested' | 'held' | 'remixed' | 'confirmed' | 'completed'

// ============================================
// DATABASE INTERFACE
// ============================================
export interface Database {
  public: {
    Tables: {
      // ==========================================
      // PROFILES TABLE
      // ==========================================
      profiles: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          full_name: string | null
          avatar_url: string | null
          role: UserRole
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          role?: UserRole
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // PLAYERS TABLE
      // ==========================================
      players: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
          name: string
          full_name: string
          nickname: string | null
          date_of_birth: string | null
          category: PlayerCategory | null
          gender: PlayerGender | null
          current_utr: number | null
          utr_last_updated: string | null
          coach_id: string | null
          phone: string | null
          email: string | null
          parent_name: string | null
          parent_phone: string | null
          parent_email: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          photo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          profile_id?: string | null
          name?: string
          full_name: string
          nickname?: string | null
          date_of_birth?: string | null
          category?: PlayerCategory | null
          gender?: PlayerGender | null
          current_utr?: number | null
          utr_last_updated?: string | null
          coach_id?: string | null
          phone?: string | null
          email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          profile_id?: string | null
          name?: string
          full_name?: string
          nickname?: string | null
          date_of_birth?: string | null
          category?: PlayerCategory | null
          gender?: PlayerGender | null
          current_utr?: number | null
          utr_last_updated?: string | null
          coach_id?: string | null
          phone?: string | null
          email?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          parent_email?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // UTR HISTORY TABLE
      // ==========================================
      utr_history: {
        Row: {
          id: string
          player_id: string
          utr_value: number
          recorded_date: string
          source: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          utr_value: number
          recorded_date?: string
          source?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          utr_value?: number
          recorded_date?: string
          source?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // INJURIES TABLE
      // ==========================================
      injuries: {
        Row: {
          id: string
          player_id: string
          body_part: string
          description: string | null
          severity: InjurySeverity
          status: InjuryStatus
          injury_date: string
          expected_return: string | null
          actual_return: string | null
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          body_part: string
          description?: string | null
          severity?: InjurySeverity
          status?: InjuryStatus
          injury_date?: string
          expected_return?: string | null
          actual_return?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          body_part?: string
          description?: string | null
          severity?: InjurySeverity
          status?: InjuryStatus
          injury_date?: string
          expected_return?: string | null
          actual_return?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // PLAYER NOTES TABLE
      // ==========================================
      player_notes: {
        Row: {
          id: string
          player_id: string
          note_text: string
          category: string | null
          is_ai_context: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          note_text: string
          category?: string | null
          is_ai_context?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          note_text?: string
          category?: string | null
          is_ai_context?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // WHEREABOUTS TABLE
      // ==========================================
      whereabouts: {
        Row: {
          id: string
          player_id: string
          whereabouts_type: WhereaboutsType
          description: string | null
          start_date: string
          end_date: string
          location: string | null
          affects_scheduling: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          whereabouts_type: WhereaboutsType
          description?: string | null
          start_date: string
          end_date: string
          location?: string | null
          affects_scheduling?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          whereabouts_type?: WhereaboutsType
          description?: string | null
          start_date?: string
          end_date?: string
          location?: string | null
          affects_scheduling?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // TRAINING LOADS TABLE
      // ==========================================
      training_loads: {
        Row: {
          id: string
          player_id: string
          session_date: string
          rpe: number
          duration_minutes: number | null
          session_type: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          session_date?: string
          rpe: number
          duration_minutes?: number | null
          session_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          session_date?: string
          rpe?: number
          duration_minutes?: number | null
          session_type?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // ATTENDANCE TABLE
      // ==========================================
      attendance: {
        Row: {
          id: string
          player_id: string
          attendance_date: string
          status: AttendanceStatus
          notes: string | null
          marked_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          player_id: string
          attendance_date?: string
          status?: AttendanceStatus
          notes?: string | null
          marked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          attendance_date?: string
          status?: AttendanceStatus
          notes?: string | null
          marked_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // MASTER SCHEDULE TABLE
      // ==========================================
      master_schedule: {
        Row: {
          id: string
          day_of_week: number
          start_time: string
          end_time: string
          session_type: string | null
          location: string | null
          court: string | null
          court_id: string | null
          coach_id: string | null
          group_name: string | null
          max_players: number | null
          is_active: boolean
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          day_of_week: number
          start_time: string
          end_time: string
          session_type?: string | null
          location?: string | null
          court?: string | null
          court_id?: string | null
          coach_id?: string | null
          group_name?: string | null
          max_players?: number | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          session_type?: string | null
          location?: string | null
          court?: string | null
          court_id?: string | null
          coach_id?: string | null
          group_name?: string | null
          max_players?: number | null
          is_active?: boolean
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_schedule_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_schedule_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // MASTER SCHEDULE PLAYERS TABLE
      // ==========================================
      master_schedule_players: {
        Row: {
          id: string
          master_schedule_id: string
          player_id: string
          created_at: string
        }
        Insert: {
          id?: string
          master_schedule_id: string
          player_id: string
          created_at?: string
        }
        Update: {
          id?: string
          master_schedule_id?: string
          player_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_schedule_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // WEEKLY SCHEDULES TABLE
      // ==========================================
      weekly_schedules: {
        Row: {
          id: string
          week_start: string
          status: ScheduleStatus
          notes: string | null
          created_by: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          week_start: string
          status?: ScheduleStatus
          notes?: string | null
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          week_start?: string
          status?: ScheduleStatus
          notes?: string | null
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // SCHEDULE SESSIONS TABLE
      // ==========================================
      schedule_sessions: {
        Row: {
          id: string
          weekly_schedule_id: string | null
          master_schedule_id: string | null
          session_date: string
          start_time: string
          end_time: string
          session_type: string | null
          location: string | null
          court: string | null
          coach_id: string | null
          status: SessionStatus
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          weekly_schedule_id?: string | null
          master_schedule_id?: string | null
          session_date: string
          start_time: string
          end_time: string
          session_type?: string | null
          location?: string | null
          court?: string | null
          coach_id?: string | null
          status?: SessionStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          weekly_schedule_id?: string | null
          master_schedule_id?: string | null
          session_date?: string
          start_time?: string
          end_time?: string
          session_type?: string | null
          location?: string | null
          court?: string | null
          coach_id?: string | null
          status?: SessionStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // SESSION PLAYERS TABLE
      // ==========================================
      session_players: {
        Row: {
          id: string
          session_id: string
          player_id: string
          status: SessionPlayerStatus
          added_from_master: boolean
          notes: string | null
          absent_at: string | null
          absent_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          status?: SessionPlayerStatus
          added_from_master?: boolean
          notes?: string | null
          absent_at?: string | null
          absent_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          status?: SessionPlayerStatus
          added_from_master?: boolean
          notes?: string | null
          absent_at?: string | null
          absent_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // SCHEDULE CHANGE REQUESTS TABLE
      // ==========================================
      schedule_change_requests: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          proposer_id: string | null
          change_type: string
          target_session_id: string | null
          reason: string
          status: string
          proposed_payload: Json | null
          approved_payload: Json | null
          approved_by: string | null
          approved_at: string | null
          reject_reason: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          proposer_id?: string | null
          change_type: string
          target_session_id?: string | null
          reason: string
          status?: string
          proposed_payload?: Json | null
          approved_payload?: Json | null
          approved_by?: string | null
          approved_at?: string | null
          reject_reason?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          proposer_id?: string | null
          change_type?: string
          target_session_id?: string | null
          reason?: string
          status?: string
          proposed_payload?: Json | null
          approved_payload?: Json | null
          approved_by?: string | null
          approved_at?: string | null
          reject_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_change_requests_target_session_id_fkey"
            columns: ["target_session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // SCHEDULE AUDIT LOG TABLE
      // ==========================================
      schedule_audit_log: {
        Row: {
          id: string
          created_at: string
          change_request_id: string | null
          action: string
          performed_by: string | null
          details: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          change_request_id?: string | null
          action: string
          performed_by?: string | null
          details?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          change_request_id?: string | null
          action?: string
          performed_by?: string | null
          details?: Json | null
        }
        Relationships: []
      }

      // ==========================================
      // VEHICLES TABLE
      // ==========================================
      vehicles: {
        Row: {
          id: string
          name: string
          capacity: number
          license_plate: string | null
          status: VehicleStatus
          current_location_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          capacity: number
          license_plate?: string | null
          status?: VehicleStatus
          current_location_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          capacity?: number
          license_plate?: string | null
          status?: VehicleStatus
          current_location_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // BUSINESS CARDS TABLE
      // ==========================================
      business_cards: {
        Row: {
          id: string
          card_name: string
          card_number: string | null
          status: CardStatus
          current_holder_id: string | null
          current_location_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          card_name: string
          card_number?: string | null
          status?: CardStatus
          current_holder_id?: string | null
          current_location_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          card_name?: string
          card_number?: string | null
          status?: CardStatus
          current_holder_id?: string | null
          current_location_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // LOCATIONS TABLE
      // ==========================================
      locations: {
        Row: {
          id: string
          name: string
          location_type: LocationType
          address: string | null
          city: string | null
          country: string | null
          coordinates: string | null
          is_base: boolean
          is_summer_only: boolean
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location_type: LocationType
          address?: string | null
          city?: string | null
          country?: string | null
          coordinates?: string | null
          is_base?: boolean
          is_summer_only?: boolean
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location_type?: LocationType
          address?: string | null
          city?: string | null
          country?: string | null
          coordinates?: string | null
          is_base?: boolean
          is_summer_only?: boolean
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // LOCATION DISTANCES TABLE
      // ==========================================
      location_distances: {
        Row: {
          id: string
          from_location_id: string
          to_location_id: string
          distance_km: number
          drive_time_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          from_location_id: string
          to_location_id: string
          distance_km: number
          drive_time_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          from_location_id?: string
          to_location_id?: string
          distance_km?: number
          drive_time_minutes?: number | null
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // VEHICLE ASSIGNMENTS TABLE
      // ==========================================
      vehicle_assignments: {
        Row: {
          id: string
          vehicle_id: string
          tournament_id: string | null
          driver_id: string | null
          card_id: string | null
          start_date: string
          end_date: string
          purpose: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id: string
          tournament_id?: string | null
          driver_id?: string | null
          card_id?: string | null
          start_date: string
          end_date: string
          purpose?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string
          tournament_id?: string | null
          driver_id?: string | null
          card_id?: string | null
          start_date?: string
          end_date?: string
          purpose?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // EXPENSES TABLE
      // ==========================================
      expenses: {
        Row: {
          id: string
          vehicle_id: string | null
          tournament_id: string | null
          expense_type: ExpenseType
          amount: number
          description: string | null
          receipt_url: string | null
          expense_date: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          vehicle_id?: string | null
          tournament_id?: string | null
          expense_type: ExpenseType
          amount: number
          description?: string | null
          receipt_url?: string | null
          expense_date?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string | null
          tournament_id?: string | null
          expense_type?: ExpenseType
          amount?: number
          description?: string | null
          receipt_url?: string | null
          expense_date?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // DISCOVERED TOURNAMENTS TABLE
      // ==========================================
      discovered_tournaments: {
        Row: {
          id: string
          name: string
          federation: string | null
          category: string | null
          level: string | null
          surface: string | null
          location: string | null
          city: string | null
          country: string | null
          start_date: string | null
          end_date: string | null
          entry_deadline: string | null
          source_url: string | null
          external_id: string | null
          raw_data: Json | null
          is_processed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          federation?: string | null
          category?: string | null
          level?: string | null
          surface?: string | null
          location?: string | null
          city?: string | null
          country?: string | null
          start_date?: string | null
          end_date?: string | null
          entry_deadline?: string | null
          source_url?: string | null
          external_id?: string | null
          raw_data?: Json | null
          is_processed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          federation?: string | null
          category?: string | null
          level?: string | null
          surface?: string | null
          location?: string | null
          city?: string | null
          country?: string | null
          start_date?: string | null
          end_date?: string | null
          entry_deadline?: string | null
          source_url?: string | null
          external_id?: string | null
          raw_data?: Json | null
          is_processed?: boolean
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // ACADEMY TOURNAMENTS TABLE
      // ==========================================
      academy_tournaments: {
        Row: {
          id: string
          discovered_tournament_id: string | null
          name: string
          location: string | null
          city: string | null
          start_date: string
          end_date: string
          category: string | null
          tournament_type: string | null
          level: string | null
          surface: string | null
          coach_in_charge_id: string | null
          vehicle_id: string | null
          hotel_name: string | null
          hotel_cost_per_night: number | null
          hotel_nights: number | null
          estimated_fuel_cost: number | null
          estimated_total_cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          discovered_tournament_id?: string | null
          name: string
          location?: string | null
          city?: string | null
          start_date: string
          end_date: string
          category?: string | null
          tournament_type?: string | null
          level?: string | null
          surface?: string | null
          coach_in_charge_id?: string | null
          vehicle_id?: string | null
          hotel_name?: string | null
          hotel_cost_per_night?: number | null
          hotel_nights?: number | null
          estimated_fuel_cost?: number | null
          estimated_total_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          discovered_tournament_id?: string | null
          name?: string
          location?: string | null
          city?: string | null
          start_date?: string
          end_date?: string
          category?: string | null
          tournament_type?: string | null
          level?: string | null
          surface?: string | null
          coach_in_charge_id?: string | null
          vehicle_id?: string | null
          hotel_name?: string | null
          hotel_cost_per_night?: number | null
          hotel_nights?: number | null
          estimated_fuel_cost?: number | null
          estimated_total_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // TOURNAMENT REGISTRATIONS TABLE
      // ==========================================
      tournament_registrations: {
        Row: {
          id: string
          tournament_id: string
          player_id: string
          status: RegistrationStatus
          entry_fee: number | null
          player_cost_share: number | null
          confirmed_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          player_id: string
          status?: RegistrationStatus
          entry_fee?: number | null
          player_cost_share?: number | null
          confirmed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          player_id?: string
          status?: RegistrationStatus
          entry_fee?: number | null
          player_cost_share?: number | null
          confirmed_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // TOURNAMENT MATCHES TABLE
      // ==========================================
      tournament_matches: {
        Row: {
          id: string
          tournament_id: string
          player_id: string
          round: TournamentRound | null
          opponent_name: string | null
          opponent_ranking: string | null
          match_date: string | null
          match_time: string | null
          court: string | null
          result: MatchResult
          score: string | null
          score_detailed: Json | null
          service_holds: number | null
          service_breaks: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          player_id: string
          round?: TournamentRound | null
          opponent_name?: string | null
          opponent_ranking?: string | null
          match_date?: string | null
          match_time?: string | null
          court?: string | null
          result?: MatchResult
          score?: string | null
          score_detailed?: Json | null
          service_holds?: number | null
          service_breaks?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          player_id?: string
          round?: TournamentRound | null
          opponent_name?: string | null
          opponent_ranking?: string | null
          match_date?: string | null
          match_time?: string | null
          court?: string | null
          result?: MatchResult
          score?: string | null
          score_detailed?: Json | null
          service_holds?: number | null
          service_breaks?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // UTR MATCHPLAY WEEKS TABLE
      // ==========================================
      utr_matchplay_weeks: {
        Row: {
          id: string
          week_date: string
          status: MatchplayWeekStatus
          notes: string | null
          created_by: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          week_date: string
          status?: MatchplayWeekStatus
          notes?: string | null
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          week_date?: string
          status?: MatchplayWeekStatus
          notes?: string | null
          created_by?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // UTR MATCHES TABLE
      // ==========================================
      utr_matches: {
        Row: {
          id: string
          matchplay_week_id: string
          player1_id: string
          player2_id: string
          player1_utr: number | null
          player2_utr: number | null
          player1_playing_direction: string | null
          player2_playing_direction: string | null
          court: string | null
          scheduled_time: string | null
          status: MatchplayMatchStatus
          result: MatchResult | null
          score: string | null
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          matchplay_week_id: string
          player1_id: string
          player2_id: string
          player1_utr?: number | null
          player2_utr?: number | null
          player1_playing_direction?: string | null
          player2_playing_direction?: string | null
          court?: string | null
          scheduled_time?: string | null
          status?: MatchplayMatchStatus
          result?: MatchResult | null
          score?: string | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          matchplay_week_id?: string
          player1_id?: string
          player2_id?: string
          player1_utr?: number | null
          player2_utr?: number | null
          player1_playing_direction?: string | null
          player2_playing_direction?: string | null
          court?: string | null
          scheduled_time?: string | null
          status?: MatchplayMatchStatus
          result?: MatchResult | null
          score?: string | null
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // UTR MATCH HISTORY TABLE
      // ==========================================
      utr_match_history: {
        Row: {
          id: string
          player1_id: string
          player2_id: string
          utr_match_id: string | null
          match_date: string
          result: MatchResult | null
          score: string | null
          winner_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          player1_id: string
          player2_id: string
          utr_match_id?: string | null
          match_date?: string
          result?: MatchResult | null
          score?: string | null
          winner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          player1_id?: string
          player2_id?: string
          utr_match_id?: string | null
          match_date?: string
          result?: MatchResult | null
          score?: string | null
          winner_id?: string | null
          created_at?: string
        }
        Relationships: []
      }

      // ==========================================
      // SESSIONS TABLE (actual DB table)
      // ==========================================
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
        Relationships: [
          {
            foreignKeyName: "sessions_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // COURTS TABLE
      // ==========================================
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
        Relationships: []
      }

      // ==========================================
      // COACHES TABLE
      // ==========================================
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
        Relationships: []
      }

      // ==========================================
      // USER PROFILES TABLE (actual DB table)
      // ==========================================
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
        Relationships: []
      }

      // ==========================================
      // PLAYER COACH ASSIGNMENTS TABLE
      // ==========================================
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
        Relationships: []
      }

      // ==========================================
      // SCRAPED TOURNAMENTS TABLE (agent)
      // ==========================================
      scraped_tournaments: {
        Row: {
          id: string
          created_at: string
          source_id: string
          external_id: string | null
          name: string
          location: string | null
          country: string | null
          start_date: string | null
          end_date: string | null
          category: string | null
          tournament_type: string | null
          level: string | null
          surface: string | null
          entry_deadline: string | null
          website: string | null
          website_url: string | null
          raw_data: Json | null
          scraped_at: string
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          source_id: string
          external_id?: string | null
          name: string
          location?: string | null
          country?: string | null
          start_date?: string | null
          end_date?: string | null
          category?: string | null
          tournament_type?: string | null
          level?: string | null
          surface?: string | null
          entry_deadline?: string | null
          website?: string | null
          website_url?: string | null
          raw_data?: Json | null
          scraped_at?: string
          status?: string
        }
        Update: {
          id?: string
          created_at?: string
          source_id?: string
          external_id?: string | null
          name?: string
          location?: string | null
          country?: string | null
          start_date?: string | null
          end_date?: string | null
          category?: string | null
          tournament_type?: string | null
          level?: string | null
          surface?: string | null
          entry_deadline?: string | null
          website?: string | null
          website_url?: string | null
          raw_data?: Json | null
          scraped_at?: string
          status?: string
        }
        Relationships: []
      }

      // ==========================================
      // SCRAPE LOGS TABLE (agent)
      // ==========================================
      scrape_logs: {
        Row: {
          id: string
          created_at: string
          source_id: string
          status: string
          tournaments_found: number
          tournaments_new: number
          errors: Json | null
          duration_ms: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          source_id: string
          status: string
          tournaments_found?: number
          tournaments_new?: number
          errors?: Json | null
          duration_ms?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          source_id?: string
          status?: string
          tournaments_found?: number
          tournaments_new?: number
          errors?: Json | null
          duration_ms?: number | null
        }
        Relationships: []
      }

      // ==========================================
      // GOALS TABLE
      // ==========================================
      goals: {
        Row: {
          id: string
          created_at: string
          player_id: string
          goal_type: string
          title: string
          description: string | null
          target_value: number | null
          target_unit: string | null
          current_value: number
          target_date: string | null
          status: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          player_id: string
          goal_type: string
          title: string
          description?: string | null
          target_value?: number | null
          target_unit?: string | null
          current_value?: number
          target_date?: string | null
          status?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          player_id?: string
          goal_type?: string
          title?: string
          description?: string | null
          target_value?: number | null
          target_unit?: string | null
          current_value?: number
          target_date?: string | null
          status?: string
          completed_at?: string | null
        }
        Relationships: []
      }

      // ==========================================
      // GOAL PROGRESS TABLE
      // ==========================================
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
        Relationships: []
      }

      // ==========================================
      // FITNESS LOGS TABLE
      // ==========================================
      fitness_logs: {
        Row: {
          id: string
          created_at: string
          player_id: string
          log_date: string
          category: string
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
          category: string
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
          category?: string
          exercise_name?: string
          sets?: number | null
          reps?: number | null
          weight_kg?: number | null
          duration_seconds?: number | null
          distance_meters?: number | null
          notes?: string | null
          rpe?: number | null
        }
        Relationships: []
      }

      // ==========================================
      // SESSION RATINGS TABLE
      // ==========================================
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
        Relationships: []
      }

      // ==========================================
      // MATCH RESULTS TABLE
      // ==========================================
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
          result: string
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
          match_type: string
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
          result: string
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
          match_type?: string
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
          result?: string
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
          match_type?: string
        }
        Relationships: []
      }

      // ==========================================
      // TOURNAMENTS TABLE (original schema)
      // ==========================================
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
          tournament_type: string
          notes: string | null
          status: string
          surface: string | null
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
          tournament_type?: string
          notes?: string | null
          status?: string
          surface?: string | null
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
          tournament_type?: string
          notes?: string | null
          status?: string
          surface?: string | null
        }
        Relationships: []
      }

      // ==========================================
      // TOURNAMENT ASSIGNMENTS TABLE
      // ==========================================
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
        Relationships: [
          {
            foreignKeyName: "tournament_assignments_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          }
        ]
      }

      // ==========================================
      // PLAYER AVAILABILITY TABLE (agent)
      // ==========================================
      player_availability: {
        Row: {
          id: string
          created_at: string
          player_id: string
          start_date: string
          end_date: string
          availability_type: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          player_id: string
          start_date: string
          end_date: string
          availability_type: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          player_id?: string
          start_date?: string
          end_date?: string
          availability_type?: string
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_coach_or_higher: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_player_available: {
        Args: {
          p_player_id: string
          p_date: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================
// HELPER TYPES
// ============================================
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Player = Database['public']['Tables']['players']['Row']
export type Coach = Profile
export type UtrHistory = Database['public']['Tables']['utr_history']['Row']
export type Injury = Database['public']['Tables']['injuries']['Row']
export type PlayerNote = Database['public']['Tables']['player_notes']['Row']
export type Whereabouts = Database['public']['Tables']['whereabouts']['Row']
export type TrainingLoad = Database['public']['Tables']['training_loads']['Row']
export type Attendance = Database['public']['Tables']['attendance']['Row']
export type MasterSchedule = Database['public']['Tables']['master_schedule']['Row']
export type MasterSchedulePlayer = Database['public']['Tables']['master_schedule_players']['Row']
export type WeeklySchedule = Database['public']['Tables']['weekly_schedules']['Row']
export type ScheduleSession = Database['public']['Tables']['schedule_sessions']['Row']
export type SessionPlayer = Database['public']['Tables']['session_players']['Row']
export type ScheduleChangeRequest = Database['public']['Tables']['schedule_change_requests']['Row']
export type ScheduleAuditLog = Database['public']['Tables']['schedule_audit_log']['Row']
export type Vehicle = Database['public']['Tables']['vehicles']['Row']
export type BusinessCard = Database['public']['Tables']['business_cards']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type LocationDistance = Database['public']['Tables']['location_distances']['Row']
export type VehicleAssignment = Database['public']['Tables']['vehicle_assignments']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type DiscoveredTournament = Database['public']['Tables']['discovered_tournaments']['Row']
export type AcademyTournament = Database['public']['Tables']['academy_tournaments']['Row']
export type Tournament = AcademyTournament
export type TournamentRegistration = Database['public']['Tables']['tournament_registrations']['Row']
export type TournamentMatch = Database['public']['Tables']['tournament_matches']['Row']
export type UtrMatchplayWeek = Database['public']['Tables']['utr_matchplay_weeks']['Row']
export type UtrMatch = Database['public']['Tables']['utr_matches']['Row']
export type UtrMatchHistory = Database['public']['Tables']['utr_match_history']['Row']

// New table types
export type Session = Database['public']['Tables']['sessions']['Row']
export type Court = Database['public']['Tables']['courts']['Row']
export type CoachRecord = Database['public']['Tables']['coaches']['Row']
export type PlayerCoachAssignment = Database['public']['Tables']['player_coach_assignments']['Row']
export type ScrapedTournament = Database['public']['Tables']['scraped_tournaments']['Row']
export type ScrapeLog = Database['public']['Tables']['scrape_logs']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type GoalProgress = Database['public']['Tables']['goal_progress']['Row']
export type FitnessLog = Database['public']['Tables']['fitness_logs']['Row']
export type SessionRating = Database['public']['Tables']['session_ratings']['Row']
export type MatchResultRecord = Database['public']['Tables']['match_results']['Row']

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export type PlayerWithCoach = Player & {
  coach?: Profile | null
}

export type PlayerWithDetails = Player & {
  coach?: Profile | null
  injuries?: Injury[]
  notes?: PlayerNote[]
  whereabouts?: Whereabouts[]
  utr_history?: UtrHistory[]
}

export type ScheduleSessionWithPlayers = ScheduleSession & {
  players?: (SessionPlayer & { player: Player })[]
  coach?: Profile | null
}

export type AcademyTournamentWithDetails = AcademyTournament & {
  coach_in_charge?: Profile | null
  vehicle?: Vehicle | null
  registrations?: (TournamentRegistration & { player: Player })[]
}

export type UtrMatchWithPlayers = UtrMatch & {
  player1?: Player | null
  player2?: Player | null
  winner?: Player | null
}
