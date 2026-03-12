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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bis_knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          content_type: string
          created_at: string
          fts: unknown
          id: string
          title: string
          url: string | null
        }
        Insert: {
          chunk_index?: number
          content: string
          content_type?: string
          created_at?: string
          fts?: unknown
          id?: string
          title: string
          url?: string | null
        }
        Update: {
          chunk_index?: number
          content?: string
          content_type?: string
          created_at?: string
          fts?: unknown
          id?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      product_reports: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          issue_type: string
          location: string | null
          photo_urls: string[] | null
          product_name: string
          purchase_place: string | null
          status: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          issue_type: string
          location?: string | null
          photo_urls?: string[] | null
          product_name: string
          purchase_place?: string | null
          status?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          issue_type?: string
          location?: string | null
          photo_urls?: string[] | null
          product_name?: string
          purchase_place?: string | null
          status?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          created_at: string
          id: string
          is_complaint: boolean
          product_id: string
          rating: number
          review_text: string | null
          reviewer_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_complaint?: boolean
          product_id: string
          rating: number
          review_text?: string | null
          reviewer_name: string
        }
        Update: {
          created_at?: string
          id?: string
          is_complaint?: boolean
          product_id?: string
          rating?: number
          review_text?: string | null
          reviewer_name?: string
        }
        Relationships: []
      }
      safety_alerts: {
        Row: {
          affected_products: string | null
          alert_date: string
          category: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          severity: string
          source: string | null
          title: string
        }
        Insert: {
          affected_products?: string | null
          alert_date?: string
          category: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          severity?: string
          source?: string | null
          title: string
        }
        Update: {
          affected_products?: string | null
          alert_date?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          severity?: string
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      scan_history: {
        Row: {
          analysis_json: Json | null
          brand: string | null
          category: string | null
          certification_marks: string[] | null
          created_at: string
          id: string
          image_url: string
          product_name: string | null
          recommendation: string | null
          risk_level: string | null
          safety_observations: string[] | null
          summary: string | null
        }
        Insert: {
          analysis_json?: Json | null
          brand?: string | null
          category?: string | null
          certification_marks?: string[] | null
          created_at?: string
          id?: string
          image_url: string
          product_name?: string | null
          recommendation?: string | null
          risk_level?: string | null
          safety_observations?: string[] | null
          summary?: string | null
        }
        Update: {
          analysis_json?: Json | null
          brand?: string | null
          category?: string | null
          certification_marks?: string[] | null
          created_at?: string
          id?: string
          image_url?: string
          product_name?: string | null
          recommendation?: string | null
          risk_level?: string | null
          safety_observations?: string[] | null
          summary?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_bis_chunks: {
        Args: {
          filter_type?: string
          match_count?: number
          search_query: string
        }
        Returns: {
          chunk_index: number
          content: string
          content_type: string
          id: string
          rank: number
          title: string
          url: string
        }[]
      }
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
