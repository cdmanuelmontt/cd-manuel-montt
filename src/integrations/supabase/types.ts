export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      club_info: {
        Row: {
          content: string
          created_at: string
          id: string
          section: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          section: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          section?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          match_date: string
          series: string
          title: string | null
          tournament_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          match_date: string
          series: string
          title?: string | null
          tournament_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          match_date?: string
          series?: string
          title?: string | null
          tournament_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          away_score: number | null
          away_team_id: string
          created_at: string
          group_id: string | null
          home_score: number | null
          home_team_id: string
          id: string
          match_date: string | null
          match_label: string | null
          match_time: string | null
          phase_id: string | null
          round: string | null
          series_id: string
          status: string
          tournament_id: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          away_score?: number | null
          away_team_id: string
          created_at?: string
          group_id?: string | null
          home_score?: number | null
          home_team_id: string
          id?: string
          match_date?: string | null
          match_label?: string | null
          match_time?: string | null
          phase_id?: string | null
          round?: string | null
          series_id: string
          status?: string
          tournament_id: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          away_score?: number | null
          away_team_id?: string
          created_at?: string
          group_id?: string | null
          home_score?: number | null
          home_team_id?: string
          id?: string
          match_date?: string | null
          match_label?: string | null
          match_time?: string | null
          phase_id?: string | null
          round?: string | null
          series_id?: string
          status?: string
          tournament_id?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_matches_series"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "phase_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "tournament_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      next_matches: {
        Row: {
          created_at: string
          id: string
          match_date: string
          match_time: string | null
          round: string | null
          series_id: string
          team_id: string
          tournament_id: string
          updated_at: string
          venue: string | null
          vs_team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_date: string
          match_time?: string | null
          round?: string | null
          series_id: string
          team_id: string
          tournament_id: string
          updated_at?: string
          venue?: string | null
          vs_team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_date?: string
          match_time?: string | null
          round?: string | null
          series_id?: string
          team_id?: string
          tournament_id?: string
          updated_at?: string
          venue?: string | null
          vs_team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_next_matches_series"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "next_matches_vs_team_id_fkey"
            columns: ["vs_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      phase_groups: {
        Row: {
          created_at: string
          group_name: string
          group_order: number
          id: string
          phase_id: string
        }
        Insert: {
          created_at?: string
          group_name: string
          group_order: number
          id?: string
          phase_id: string
        }
        Update: {
          created_at?: string
          group_name?: string
          group_order?: number
          id?: string
          phase_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "phase_groups_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "tournament_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      series: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      standings: {
        Row: {
          created_at: string
          draws: number | null
          goals_against: number | null
          goals_for: number | null
          group_id: string | null
          id: string
          losses: number | null
          matches_played: number | null
          phase_id: string | null
          points: number | null
          position: number | null
          punishment_points: number | null
          punishment_reason: string | null
          series_id: string
          team_id: string | null
          tournament_id: string | null
          updated_at: string
          wins: number | null
        }
        Insert: {
          created_at?: string
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_id?: string | null
          id?: string
          losses?: number | null
          matches_played?: number | null
          phase_id?: string | null
          points?: number | null
          position?: number | null
          punishment_points?: number | null
          punishment_reason?: string | null
          series_id: string
          team_id?: string | null
          tournament_id?: string | null
          updated_at?: string
          wins?: number | null
        }
        Update: {
          created_at?: string
          draws?: number | null
          goals_against?: number | null
          goals_for?: number | null
          group_id?: string | null
          id?: string
          losses?: number | null
          matches_played?: number | null
          phase_id?: string | null
          points?: number | null
          position?: number | null
          punishment_points?: number | null
          punishment_reason?: string | null
          series_id?: string
          team_id?: string | null
          tournament_id?: string | null
          updated_at?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_standings_series"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "phase_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "tournament_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "standings_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      suspended_players: {
        Row: {
          created_at: string
          id: string
          name: string
          reason: string | null
          remaining_matches: number
          series_id: string
          team_id: string | null
          tournament_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          reason?: string | null
          remaining_matches?: number
          series_id: string
          team_id?: string | null
          tournament_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          reason?: string | null
          remaining_matches?: number
          series_id?: string
          team_id?: string | null
          tournament_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_suspended_players_series"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suspended_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suspended_players_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      team_tournaments: {
        Row: {
          created_at: string
          id: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_tournaments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_tournaments_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          series_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          series_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          series_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_teams_series"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_phases: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          phase_order: number
          phase_type: string
          start_date: string | null
          status: string
          tournament_series_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          phase_order: number
          phase_type: string
          start_date?: string | null
          status?: string
          tournament_series_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          phase_order?: number
          phase_type?: string
          start_date?: string | null
          status?: string
          tournament_series_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_phases_tournament_series_id_fkey"
            columns: ["tournament_series_id"]
            isOneToOne: false
            referencedRelation: "tournament_series"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_series: {
        Row: {
          created_at: string
          id: string
          series_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          series_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          series_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_series_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_series_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          name: string
          points_draw: number
          points_loss: number
          points_win: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          points_draw?: number
          points_loss?: number
          points_win?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          points_draw?: number
          points_loss?: number
          points_win?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_groups_for_phase: {
        Args: { p_phase_id: string }
        Returns: {
          group_id: string
          group_name: string
          group_order: number
        }[]
      }
      get_phases_for_tournament_series: {
        Args: { p_series_id: string; p_tournament_id: string }
        Returns: {
          phase_id: string
          phase_name: string
          phase_order: number
          phase_status: string
          phase_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_phase: { Args: { p_phase_id: string }; Returns: boolean }
      rebuild_standings_for_tournament_series:
        | {
            Args: {
              p_series_id?: string
              p_series_name?: string
              p_tournament_id?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_group_id?: string
              p_phase_id?: string
              p_series_id?: string
              p_series_name?: string
              p_tournament_id?: string
            }
            Returns: undefined
          }
      recalculate_standings_positions: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "futbol" | "content"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "futbol", "content"],
    },
  },
} as const
