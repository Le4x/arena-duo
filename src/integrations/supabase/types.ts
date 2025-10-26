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
      answers: {
        Row: {
          answer: string
          id: string
          is_correct: boolean | null
          question_id: string | null
          team_id: string | null
          timestamp: string | null
        }
        Insert: {
          answer: string
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          team_id?: string | null
          timestamp?: string | null
        }
        Update: {
          answer?: string
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          team_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          buzzer_locked: boolean | null
          buzzer_winner_id: string | null
          created_at: string | null
          current_question_id: string | null
          current_round_id: string | null
          id: string
          is_live: boolean | null
          max_teams: number | null
          project_name: string
          time_remaining: number | null
          timer_active: boolean | null
          updated_at: string | null
          websocket_port: number | null
        }
        Insert: {
          buzzer_locked?: boolean | null
          buzzer_winner_id?: string | null
          created_at?: string | null
          current_question_id?: string | null
          current_round_id?: string | null
          id?: string
          is_live?: boolean | null
          max_teams?: number | null
          project_name?: string
          time_remaining?: number | null
          timer_active?: boolean | null
          updated_at?: string | null
          websocket_port?: number | null
        }
        Update: {
          buzzer_locked?: boolean | null
          buzzer_winner_id?: string | null
          created_at?: string | null
          current_question_id?: string | null
          current_round_id?: string | null
          id?: string
          is_live?: boolean | null
          max_teams?: number | null
          project_name?: string
          time_remaining?: number | null
          timer_active?: boolean | null
          updated_at?: string | null
          websocket_port?: number | null
        }
        Relationships: []
      }
      joker_usage: {
        Row: {
          id: string
          joker_type: string
          question_id: string | null
          team_id: string | null
          used_at: string | null
        }
        Insert: {
          id?: string
          joker_type: string
          question_id?: string | null
          team_id?: string | null
          used_at?: string | null
        }
        Update: {
          id?: string
          joker_type?: string
          question_id?: string | null
          team_id?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "joker_usage_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "joker_usage_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          audio_file: string | null
          choices: Json | null
          correct_answer: string
          created_at: string | null
          duration: number | null
          id: string
          points: number | null
          round_id: string | null
          text: string
          type: string
        }
        Insert: {
          audio_file?: string | null
          choices?: Json | null
          correct_answer: string
          created_at?: string | null
          duration?: number | null
          id?: string
          points?: number | null
          round_id?: string | null
          text: string
          type: string
        }
        Update: {
          audio_file?: string | null
          choices?: Json | null
          correct_answer?: string
          created_at?: string | null
          duration?: number | null
          id?: string
          points?: number | null
          round_id?: string | null
          text?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      rounds: {
        Row: {
          created_at: string | null
          id: string
          order_number: number
          session_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_number: number
          session_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: string
          order_number?: number
          session_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          color: string
          connected: boolean | null
          created_at: string | null
          id: string
          jokers_remaining: number | null
          name: string
          score: number | null
          session_id: string | null
        }
        Insert: {
          color: string
          connected?: boolean | null
          created_at?: string | null
          id?: string
          jokers_remaining?: number | null
          name: string
          score?: number | null
          session_id?: string | null
        }
        Update: {
          color?: string
          connected?: boolean | null
          created_at?: string | null
          id?: string
          jokers_remaining?: number | null
          name?: string
          score?: number | null
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
