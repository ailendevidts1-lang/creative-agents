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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_projects: {
        Row: {
          architecture: Json
          created_at: string
          deployment_targets: string[]
          description: string
          design_system: Json | null
          id: string
          metadata: Json | null
          name: string
          project_type: string
          requirements: Json
          tech_stack: Json
          timeline: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          architecture: Json
          created_at?: string
          deployment_targets?: string[]
          description: string
          design_system?: Json | null
          id?: string
          metadata?: Json | null
          name: string
          project_type: string
          requirements: Json
          tech_stack: Json
          timeline: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          architecture?: Json
          created_at?: string
          deployment_targets?: string[]
          description?: string
          design_system?: Json | null
          id?: string
          metadata?: Json | null
          name?: string
          project_type?: string
          requirements?: Json
          tech_stack?: Json
          timeline?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      business_analytics: {
        Row: {
          business_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          metric: string
          period: string | null
          value: number | null
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric: string
          period?: string | null
          value?: number | null
        }
        Update: {
          business_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          metric?: string
          period?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "business_analytics_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_assets: {
        Row: {
          business_id: string | null
          content: string | null
          created_at: string
          id: string
          metadata: Json | null
          name: string
          type: string
          uri: string | null
        }
        Insert: {
          business_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name: string
          type: string
          uri?: string | null
        }
        Update: {
          business_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          name?: string
          type?: string
          uri?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_assets_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_ideas: {
        Row: {
          analysis: Json | null
          created_at: string
          description: string | null
          difficulty: string | null
          expected_roi: number | null
          id: string
          investment: number | null
          market: string | null
          ramp_time: string | null
          title: string
          user_id: string
        }
        Insert: {
          analysis?: Json | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          expected_roi?: number | null
          id?: string
          investment?: number | null
          market?: string | null
          ramp_time?: string | null
          title: string
          user_id: string
        }
        Update: {
          analysis?: Json | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          expected_roi?: number | null
          id?: string
          investment?: number | null
          market?: string | null
          ramp_time?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      business_plans: {
        Row: {
          budget: number | null
          channels: string[] | null
          created_at: string
          id: string
          idea_id: string | null
          milestones: string[] | null
          niche: string | null
          okrs: Json | null
          ready: boolean | null
          timeline: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget?: number | null
          channels?: string[] | null
          created_at?: string
          id?: string
          idea_id?: string | null
          milestones?: string[] | null
          niche?: string | null
          okrs?: Json | null
          ready?: boolean | null
          timeline?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          budget?: number | null
          channels?: string[] | null
          created_at?: string
          id?: string
          idea_id?: string | null
          milestones?: string[] | null
          niche?: string | null
          okrs?: Json | null
          ready?: boolean | null
          timeline?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "business_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      business_tasks: {
        Row: {
          assignee: string | null
          business_id: string | null
          created_at: string
          description: string | null
          due_at: string | null
          id: string
          metadata: Json | null
          priority: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          assignee?: string | null
          business_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          assignee?: string | null
          business_id?: string | null
          created_at?: string
          description?: string | null
          due_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_tasks_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          channels: string[] | null
          created_at: string
          daily_revenue: number | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          next_tasks: string[] | null
          progress: number | null
          roi: number | null
          status: string
          total_revenue: number | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          created_at?: string
          daily_revenue?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          next_tasks?: string[] | null
          progress?: number | null
          roi?: number | null
          status?: string
          total_revenue?: number | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channels?: string[] | null
          created_at?: string
          daily_revenue?: number | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          next_tasks?: string[] | null
          progress?: number | null
          roi?: number | null
          status?: string
          total_revenue?: number | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_skills: {
        Row: {
          bg_color: string
          color: string
          component_code: string
          component_name: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bg_color: string
          color: string
          component_code: string
          component_name: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bg_color?: string
          color?: string
          component_code?: string
          component_name?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          query: string
          response: string | null
          sources: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          response?: string | null
          sources?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          response?: string | null
          sources?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_used: string | null
          name: string
          user_id: string | null
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_used?: string | null
          name: string
          user_id?: string | null
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_used?: string | null
          name?: string
          user_id?: string | null
          value?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      timers: {
        Row: {
          created_at: string
          duration: number
          expires_at: string
          id: string
          name: string
          remaining: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration: number
          expires_at: string
          id?: string
          name: string
          remaining: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          expires_at?: string
          id?: string
          name?: string
          remaining?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          default_timer_sound: string | null
          id: string
          updated_at: string
          user_id: string
          voice_response_enabled: boolean | null
          weather_location: string | null
        }
        Insert: {
          created_at?: string
          default_timer_sound?: string | null
          id?: string
          updated_at?: string
          user_id: string
          voice_response_enabled?: boolean | null
          weather_location?: string | null
        }
        Update: {
          created_at?: string
          default_timer_sound?: string | null
          id?: string
          updated_at?: string
          user_id?: string
          voice_response_enabled?: boolean | null
          weather_location?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "creator" | "admin"
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
      app_role: ["user", "creator", "admin"],
    },
  },
} as const
