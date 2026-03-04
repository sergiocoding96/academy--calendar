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
export type SessionPlayerStatus = 'confirmed' | 'cancelled' | 'no_show' | 'completed'
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
      }

      // ==========================================
      // PLAYERS TABLE
      // ==========================================
      players: {
        Row: {
          id: string
          user_id: string | null
          profile_id: string | null
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
          coach_id: string | null
          group_name: string | null
          max_players: number | null
          is_active: boolean
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
          coach_id?: string | null
          group_name?: string | null
          max_players?: number | null
          is_active?: boolean
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
          coach_id?: string | null
          group_name?: string | null
          max_players?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
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
          created_at?: string
          updated_at?: string
        }
      }

      // ==========================================
      // SCHEDULE CHANGE REQUESTS TABLE
      // ==========================================
      schedule_change_requests: {
        Row: {
          id: string
          session_id: string
          player_id: string
          requested_by: string | null
          request_type: string
          reason: string | null
          status: ChangeRequestStatus
          reviewed_by: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          player_id: string
          requested_by?: string | null
          request_type: string
          reason?: string | null
          status?: ChangeRequestStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          player_id?: string
          requested_by?: string | null
          request_type?: string
          reason?: string | null
          status?: ChangeRequestStatus
          reviewed_by?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }

      // ==========================================
      // SCHEDULE AUDIT LOG TABLE
      // ==========================================
      schedule_audit_log: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: string
          old_values: Json | null
          new_values: Json | null
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          table_name: string
          record_id: string
          action: string
          old_values?: Json | null
          new_values?: Json | null
          changed_by?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          table_name?: string
          record_id?: string
          action?: string
          old_values?: Json | null
          new_values?: Json | null
          changed_by?: string | null
          changed_at?: string
        }
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
export type TournamentRegistration = Database['public']['Tables']['tournament_registrations']['Row']
export type TournamentMatch = Database['public']['Tables']['tournament_matches']['Row']
export type UtrMatchplayWeek = Database['public']['Tables']['utr_matchplay_weeks']['Row']
export type UtrMatch = Database['public']['Tables']['utr_matches']['Row']
export type UtrMatchHistory = Database['public']['Tables']['utr_match_history']['Row']

// ============================================
// EXTENDED TYPES WITH RELATIONS
// ============================================
export type UserProfile = {
  id: string
  email: string | null
  full_name: string | null
  role: UserRole
  player_id: string | null
  coach_id: string | null
  created_at: string
  avatar_url: string | null
}

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
