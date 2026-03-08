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
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      agent_configs: {
        Row: {
          agent_type: string
          created_at: string
          description: string | null
          id: string
          max_tokens: number | null
          name: string
          settings: Json | null
          system_prompt: string | null
          temperature: number | null
          updated_at: string
          user_id: string
          voice_id: string | null
          voice_model: string | null
          voice_speed: number | null
        }
        Insert: {
          agent_type: string
          created_at?: string
          description?: string | null
          id?: string
          max_tokens?: number | null
          name: string
          settings?: Json | null
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
          voice_model?: string | null
          voice_speed?: number | null
        }
        Update: {
          agent_type?: string
          created_at?: string
          description?: string | null
          id?: string
          max_tokens?: number | null
          name?: string
          settings?: Json | null
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          voice_model?: string | null
          voice_speed?: number | null
        }
        Relationships: []
      }
      automations: {
        Row: {
          actions: Json | null
          category: string | null
          created_at: string
          description: string | null
          executions: number | null
          id: string
          last_run_at: string | null
          name: string
          status: string
          success_rate: number | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actions?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          executions?: number | null
          id?: string
          last_run_at?: string | null
          name: string
          status?: string
          success_rate?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actions?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          executions?: number | null
          id?: string
          last_run_at?: string | null
          name?: string
          status?: string
          success_rate?: number | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          budget_spent: number | null
          budget_total: number | null
          created_at: string
          end_date: string | null
          id: string
          name: string
          objective: string | null
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_spent?: number | null
          budget_total?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name: string
          objective?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_spent?: number | null
          budget_total?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          name?: string
          objective?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          channel: string
          created_at: string
          id: string
          lead_id: string
          product_id: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          id?: string
          lead_id: string
          product_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          id?: string
          lead_id?: string
          product_id?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      creative_assets: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          name: string
          specs: Json | null
          type: string
          updated_at: string
          url: string | null
          user_id: string
          variant_meta: Json | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          name: string
          specs?: Json | null
          type: string
          updated_at?: string
          url?: string | null
          user_id: string
          variant_meta?: Json | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          name?: string
          specs?: Json | null
          type?: string
          updated_at?: string
          url?: string | null
          user_id?: string
          variant_meta?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          id: string
          is_connected: boolean | null
          last_sync_at: string | null
          provider: string
          user_id: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          provider: string
          user_id: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          id?: string
          is_connected?: boolean | null
          last_sync_at?: string | null
          provider?: string
          user_id?: string
        }
        Relationships: []
      }
      knowledge_chunks: {
        Row: {
          content: string
          created_at: string
          embedding: Json | null
          id: string
          metadata: Json | null
          product_id: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: Json | null
          id?: string
          metadata?: Json | null
          product_id: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: Json | null
          id?: string
          metadata?: Json | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_psychology: {
        Row: {
          analyzed_at: string
          big5_scores: Json | null
          communication_style: string | null
          created_at: string
          disc_profile: string | null
          disc_scores: Json | null
          id: string
          lead_id: string
          prompt_injection: string | null
        }
        Insert: {
          analyzed_at?: string
          big5_scores?: Json | null
          communication_style?: string | null
          created_at?: string
          disc_profile?: string | null
          disc_scores?: Json | null
          id?: string
          lead_id: string
          prompt_injection?: string | null
        }
        Update: {
          analyzed_at?: string
          big5_scores?: Json | null
          communication_style?: string | null
          created_at?: string
          disc_profile?: string | null
          disc_scores?: Json | null
          id?: string
          lead_id?: string
          prompt_injection?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_psychology_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_agent: string | null
          company: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_at: string | null
          name: string
          phone: string | null
          position: string | null
          score: number | null
          sentiment: string | null
          source: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agent?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name: string
          phone?: string | null
          position?: string | null
          score?: number | null
          sentiment?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_agent?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name?: string
          phone?: string | null
          position?: string | null
          score?: number | null
          sentiment?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketplace_agents: {
        Row: {
          agent_name: string
          agent_type: string
          author: string | null
          category: string | null
          config: Json | null
          description: string | null
          id: string
          installed_at: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          agent_name: string
          agent_type: string
          author?: string | null
          category?: string | null
          config?: Json | null
          description?: string | null
          id?: string
          installed_at?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          author?: string | null
          category?: string | null
          config?: Json | null
          description?: string | null
          id?: string
          installed_at?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          agent_type: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
        }
        Insert: {
          agent_type?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
        }
        Update: {
          agent_type?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          checkout_link: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          name: string
          price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkout_link?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkout_link?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          audience: string | null
          brand_colors: Json | null
          brand_description: string | null
          brand_name: string | null
          brand_tone: string | null
          company: string | null
          created_at: string
          document: string | null
          full_name: string | null
          id: string
          main_challenges: Json | null
          monthly_budget: string | null
          objective: string | null
          onboarding_completed: boolean | null
          phone: string | null
          sector: string | null
          selected_agents: Json | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          audience?: string | null
          brand_colors?: Json | null
          brand_description?: string | null
          brand_name?: string | null
          brand_tone?: string | null
          company?: string | null
          created_at?: string
          document?: string | null
          full_name?: string | null
          id?: string
          main_challenges?: Json | null
          monthly_budget?: string | null
          objective?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          sector?: string | null
          selected_agents?: Json | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          audience?: string | null
          brand_colors?: Json | null
          brand_description?: string | null
          brand_name?: string | null
          brand_tone?: string | null
          company?: string | null
          created_at?: string
          document?: string | null
          full_name?: string | null
          id?: string
          main_challenges?: Json | null
          monthly_budget?: string | null
          objective?: string | null
          onboarding_completed?: boolean | null
          phone?: string | null
          sector?: string | null
          selected_agents?: Json | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      safety_rules: {
        Row: {
          action: string | null
          condition: Json
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          rule_type: string | null
          user_id: string
          violations_count: number | null
        }
        Insert: {
          action?: string | null
          condition: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          rule_type?: string | null
          user_id: string
          violations_count?: number | null
        }
        Update: {
          action?: string | null
          condition?: Json
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          rule_type?: string | null
          user_id?: string
          violations_count?: number | null
        }
        Relationships: []
      }
      safety_violations: {
        Row: {
          action_taken: string | null
          conversation_id: string | null
          created_at: string
          id: string
          original_message: string | null
          rule_id: string
          violation_reason: string | null
        }
        Insert: {
          action_taken?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          original_message?: string | null
          rule_id: string
          violation_reason?: string | null
        }
        Update: {
          action_taken?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          original_message?: string | null
          rule_id?: string
          violation_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_violations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_violations_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "safety_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          leads_contacted: number | null
          responses_received: number | null
          revenue: number | null
          sales_completed: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          leads_contacted?: number | null
          responses_received?: number | null
          revenue?: number | null
          sales_completed?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          leads_contacted?: number | null
          responses_received?: number | null
          revenue?: number | null
          sales_completed?: number | null
          user_id?: string
        }
        Relationships: []
      }
      sales_script_variants: {
        Row: {
          agent_type: string
          content: string
          conversion_rate: number | null
          conversions: number | null
          created_at: string
          id: string
          impressions: number | null
          is_champion: boolean | null
          name: string
          parent_id: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: string
          content: string
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          is_champion?: boolean | null
          name: string
          parent_id?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: string
          content?: string
          conversion_rate?: number | null
          conversions?: number | null
          created_at?: string
          id?: string
          impressions?: number | null
          is_champion?: boolean | null
          name?: string
          parent_id?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_script_variants_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "sales_script_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      script_evolution_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          metrics: Json | null
          new_champion_id: string | null
          old_champion_id: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          metrics?: Json | null
          new_champion_id?: string | null
          old_champion_id?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          metrics?: Json | null
          new_champion_id?: string | null
          old_champion_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "script_evolution_log_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "sales_script_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      video_projects: {
        Row: {
          ai_prompt: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          name: string
          output_url: string | null
          quality: string | null
          ratio: string | null
          status: string | null
          style: string | null
          template: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_prompt?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          name: string
          output_url?: string | null
          quality?: string | null
          ratio?: string | null
          status?: string | null
          style?: string | null
          template?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_prompt?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          name?: string
          output_url?: string | null
          quality?: string | null
          ratio?: string | null
          status?: string | null
          style?: string | null
          template?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_calls: {
        Row: {
          conversation_id: string | null
          created_at: string
          direction: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          latency_avg_ms: number | null
          lead_id: string | null
          phone_number: string
          recording_url: string | null
          sentiment: string | null
          started_at: string | null
          status: string | null
          transcript: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          direction?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          latency_avg_ms?: number | null
          lead_id?: string | null
          phone_number: string
          recording_url?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          direction?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          latency_avg_ms?: number | null
          lead_id?: string | null
          phone_number?: string
          recording_url?: string | null
          sentiment?: string | null
          started_at?: string | null
          status?: string | null
          transcript?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_calls_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_calls_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_agent: string | null
          id: string
          progress: number | null
          started_at: string | null
          status: string
          steps: Json | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_agent?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          status?: string
          steps?: Json | null
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_agent?: string | null
          id?: string
          progress?: number | null
          started_at?: string | null
          status?: string
          steps?: Json | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          agents: Json | null
          conditions: Json | null
          created_at: string
          description: string | null
          id: string
          last_run_at: string | null
          name: string
          status: string
          success_rate: number | null
          total_runs: number | null
          triggers: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agents?: Json | null
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_run_at?: string | null
          name: string
          status?: string
          success_rate?: number | null
          total_runs?: number | null
          triggers?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agents?: Json | null
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_run_at?: string | null
          name?: string
          status?: string
          success_rate?: number | null
          total_runs?: number | null
          triggers?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
