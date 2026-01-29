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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agentes: {
        Row: {
          can_recruit_subagents: boolean | null
          ciudad: string | null
          created_at: string
          estado: Database["public"]["Enums"]["agent_status"] | null
          id: string
          line_leader_id: string | null
          nombre: string
          pais: string
          ref_code: string | null
          user_id: string | null
          whatsapp: string
        }
        Insert: {
          can_recruit_subagents?: boolean | null
          ciudad?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["agent_status"] | null
          id?: string
          line_leader_id?: string | null
          nombre: string
          pais: string
          ref_code?: string | null
          user_id?: string | null
          whatsapp: string
        }
        Update: {
          can_recruit_subagents?: boolean | null
          ciudad?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["agent_status"] | null
          id?: string
          line_leader_id?: string | null
          nombre?: string
          pais?: string
          ref_code?: string | null
          user_id?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "agentes_line_leader_id_fkey"
            columns: ["line_leader_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_logs: {
        Row: {
          ai_recommendation: string | null
          ai_summary: string | null
          created_at: string
          id: string
          lead_id: string | null
          transcript: Json | null
        }
        Insert: {
          ai_recommendation?: string | null
          ai_summary?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          transcript?: Json | null
        }
        Update: {
          ai_recommendation?: string | null
          ai_summary?: string | null
          created_at?: string
          id?: string
          lead_id?: string | null
          transcript?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_assets: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          tag: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
          tag?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          tag?: string | null
        }
        Relationships: []
      }
      cms_content: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      cms_faq: {
        Row: {
          active: boolean
          answer: string
          id: string
          order: number
          question: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          id?: string
          order?: number
          question: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          id?: string
          order?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_lobbies: {
        Row: {
          active: boolean
          badge: string | null
          category: string
          cta_link: string | null
          cta_text: string
          description: string | null
          id: string
          image_url: string | null
          order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          category: string
          cta_link?: string | null
          cta_text?: string
          description?: string | null
          id?: string
          image_url?: string | null
          order?: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          category?: string
          cta_link?: string | null
          cta_text?: string
          description?: string | null
          id?: string
          image_url?: string | null
          order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_mobile_ctas: {
        Row: {
          button_key: string
          id: string
          link: string
          order: number
          text: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          button_key: string
          id?: string
          link: string
          order?: number
          text: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          button_key?: string
          id?: string
          link?: string
          order?: number
          text?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: []
      }
      cms_promos_carousel: {
        Row: {
          active: boolean
          cta_link: string | null
          cta_text: string
          id: string
          image_url: string | null
          order: number
          subtitle: string | null
          target_country: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cta_link?: string | null
          cta_text?: string
          id?: string
          image_url?: string | null
          order?: number
          subtitle?: string | null
          target_country?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cta_link?: string | null
          cta_text?: string
          id?: string
          image_url?: string | null
          order?: number
          subtitle?: string | null
          target_country?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_sections: {
        Row: {
          enabled: boolean
          id: string
          key: string
          order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          enabled?: boolean
          id?: string
          key: string
          order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          enabled?: boolean
          id?: string
          key?: string
          order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_seo: {
        Row: {
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          page_key: string
          updated_at: string
        }
        Insert: {
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_key: string
          updated_at?: string
        }
        Update: {
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          page_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_spotlight_games: {
        Row: {
          active: boolean
          category: string
          cta_link: string | null
          cta_text: string
          id: string
          image_url: string | null
          name: string
          order: number
          speed_tag: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          cta_link?: string | null
          cta_text?: string
          id?: string
          image_url?: string | null
          name: string
          order?: number
          speed_tag?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          cta_link?: string | null
          cta_text?: string
          id?: string
          image_url?: string | null
          name?: string
          order?: number
          speed_tag?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          aposto_antes: boolean | null
          asignado_agente_id: string | null
          banca_300: boolean | null
          binance_verificada: boolean | null
          ciudad: string | null
          created_at: string
          edad: number | null
          email: string | null
          estado: Database["public"]["Enums"]["lead_status"] | null
          etiqueta: Database["public"]["Enums"]["score_label"] | null
          exp_atencion: boolean | null
          exp_casinos: boolean | null
          horas_dia: Database["public"]["Enums"]["hours_per_day"] | null
          id: string
          nombre: string
          origen: string | null
          p2p_nivel: Database["public"]["Enums"]["p2p_level"] | null
          pais: string
          prefiere_usdt: boolean | null
          quiere_empezar: boolean | null
          ref_code: string | null
          score: number | null
          tipo: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string
        }
        Insert: {
          aposto_antes?: boolean | null
          asignado_agente_id?: string | null
          banca_300?: boolean | null
          binance_verificada?: boolean | null
          ciudad?: string | null
          created_at?: string
          edad?: number | null
          email?: string | null
          estado?: Database["public"]["Enums"]["lead_status"] | null
          etiqueta?: Database["public"]["Enums"]["score_label"] | null
          exp_atencion?: boolean | null
          exp_casinos?: boolean | null
          horas_dia?: Database["public"]["Enums"]["hours_per_day"] | null
          id?: string
          nombre: string
          origen?: string | null
          p2p_nivel?: Database["public"]["Enums"]["p2p_level"] | null
          pais: string
          prefiere_usdt?: boolean | null
          quiere_empezar?: boolean | null
          ref_code?: string | null
          score?: number | null
          tipo?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp: string
        }
        Update: {
          aposto_antes?: boolean | null
          asignado_agente_id?: string | null
          banca_300?: boolean | null
          binance_verificada?: boolean | null
          ciudad?: string | null
          created_at?: string
          edad?: number | null
          email?: string | null
          estado?: Database["public"]["Enums"]["lead_status"] | null
          etiqueta?: Database["public"]["Enums"]["score_label"] | null
          exp_atencion?: boolean | null
          exp_casinos?: boolean | null
          horas_dia?: Database["public"]["Enums"]["hours_per_day"] | null
          id?: string
          nombre?: string
          origen?: string | null
          p2p_nivel?: Database["public"]["Enums"]["p2p_level"] | null
          pais?: string
          prefiere_usdt?: boolean | null
          quiere_empezar?: boolean | null
          ref_code?: string | null
          score?: number | null
          tipo?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_asignado_agente_fk"
            columns: ["asignado_agente_id"]
            isOneToOne: false
            referencedRelation: "agentes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          enabled_countries: Json | null
          fallback_mode: boolean | null
          from_email: string | null
          gemini_api_key: string | null
          id: string
          scoring_rules: Json | null
          smtp_host: string | null
          smtp_pass: string | null
          smtp_port: number | null
          smtp_user: string | null
          updated_at: string
          whatsapp_default: string | null
        }
        Insert: {
          enabled_countries?: Json | null
          fallback_mode?: boolean | null
          from_email?: string | null
          gemini_api_key?: string | null
          id?: string
          scoring_rules?: Json | null
          smtp_host?: string | null
          smtp_pass?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string
          whatsapp_default?: string | null
        }
        Update: {
          enabled_countries?: Json | null
          fallback_mode?: boolean | null
          from_email?: string | null
          gemini_api_key?: string | null
          id?: string
          scoring_rules?: Json | null
          smtp_host?: string | null
          smtp_pass?: string | null
          smtp_port?: number | null
          smtp_user?: string | null
          updated_at?: string
          whatsapp_default?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      auto_assign_agent: {
        Args: { p_country?: string; p_ref_code?: string }
        Returns: string
      }
      get_agent_load: { Args: { agent_id: string }; Returns: number }
      get_line_leader_agent_ids: {
        Args: { p_line_leader_id: string }
        Returns: string[]
      }
      get_user_agent_id: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      promote_user_to_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
    }
    Enums: {
      agent_status: "activo" | "inactivo"
      app_role: "admin" | "user" | "line_leader" | "agent"
      hours_per_day: "1-2" | "3-5" | "6+"
      lead_status:
        | "nuevo"
        | "contactado"
        | "asignado"
        | "cerrado"
        | "descartado"
      p2p_level: "basico" | "medio" | "avanzado"
      score_label:
        | "AGENTE_POTENCIAL_ALTO"
        | "AGENTE_POTENCIAL_MEDIO"
        | "AGENTE_POTENCIAL_BAJO"
        | "CLIENTE"
        | "NO_PRIORITARIO"
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
      agent_status: ["activo", "inactivo"],
      app_role: ["admin", "user", "line_leader", "agent"],
      hours_per_day: ["1-2", "3-5", "6+"],
      lead_status: ["nuevo", "contactado", "asignado", "cerrado", "descartado"],
      p2p_level: ["basico", "medio", "avanzado"],
      score_label: [
        "AGENTE_POTENCIAL_ALTO",
        "AGENTE_POTENCIAL_MEDIO",
        "AGENTE_POTENCIAL_BAJO",
        "CLIENTE",
        "NO_PRIORITARIO",
      ],
    },
  },
} as const
