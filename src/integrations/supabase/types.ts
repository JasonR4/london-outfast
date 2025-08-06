export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      content_pages: {
        Row: {
          content: Json
          created_at: string
          created_by: string
          id: string
          meta_description: string | null
          page_type: string
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by: string
          id?: string
          meta_description?: string | null
          page_type?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          meta_description?: string | null
          page_type?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      discount_tiers: {
        Row: {
          created_at: string
          created_by: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          max_incharges: number | null
          media_format_id: string
          min_incharges: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_percentage: number
          id?: string
          is_active?: boolean
          max_incharges?: number | null
          media_format_id: string
          min_incharges: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_incharges?: number | null
          media_format_id?: string
          min_incharges?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_tiers_media_format_id_fkey"
            columns: ["media_format_id"]
            isOneToOne: false
            referencedRelation: "media_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          setting_key: string
          setting_type: string
          setting_value?: Json
          updated_at?: string
          updated_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          content: Json
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          section_key: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          content?: Json
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          section_key: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          section_key?: string
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
      media_formats: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          dimensions: string | null
          format_name: string
          format_slug: string
          id: string
          is_active: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          format_name: string
          format_slug: string
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          dimensions?: string | null
          format_name?: string
          format_slug?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      media_library: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          file_size: number
          file_type: string
          filename: string
          id: string
          original_name: string
          storage_path: string
          uploaded_by: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          original_name: string
          storage_path: string
          uploaded_by: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          original_name?: string
          storage_path?: string
          uploaded_by?: string
        }
        Relationships: []
      }
      production_cost_tiers: {
        Row: {
          cost_per_unit: number
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          max_quantity: number | null
          media_format_id: string
          min_quantity: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cost_per_unit: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_quantity?: number | null
          media_format_id: string
          min_quantity: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cost_per_unit?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          max_quantity?: number | null
          media_format_id?: string
          min_quantity?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_cost_tiers_media_format_id_fkey"
            columns: ["media_format_id"]
            isOneToOne: false
            referencedRelation: "media_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_cards: {
        Row: {
          base_rate_per_incharge: number
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          location_area: string
          location_markup_percentage: number | null
          media_format_id: string
          reduced_price: number | null
          sale_price: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_rate_per_incharge: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          location_area: string
          location_markup_percentage?: number | null
          media_format_id: string
          reduced_price?: number | null
          sale_price?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_rate_per_incharge?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          location_area?: string
          location_markup_percentage?: number | null
          media_format_id?: string
          reduced_price?: number | null
          sale_price?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rate_cards_media_format_id_fkey"
            columns: ["media_format_id"]
            isOneToOne: false
            referencedRelation: "media_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_pages: {
        Row: {
          alt_texts: string[] | null
          canonical_url: string | null
          competitor_analysis: Json | null
          content_score: number | null
          content_structure: Json | null
          created_at: string
          created_by: string
          external_links_count: number | null
          focus_keyword: string
          h1_heading: string | null
          h2_headings: string[] | null
          h3_headings: string[] | null
          id: string
          internal_links_count: number | null
          keywords: string[] | null
          london_locations: string[] | null
          meta_description: string
          meta_title: string
          mobile_friendly: boolean | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_slug: string
          page_speed_score: number | null
          schema_markup: Json | null
          ssl_enabled: boolean | null
          twitter_description: string | null
          twitter_image: string | null
          twitter_title: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          alt_texts?: string[] | null
          canonical_url?: string | null
          competitor_analysis?: Json | null
          content_score?: number | null
          content_structure?: Json | null
          created_at?: string
          created_by: string
          external_links_count?: number | null
          focus_keyword: string
          h1_heading?: string | null
          h2_headings?: string[] | null
          h3_headings?: string[] | null
          id?: string
          internal_links_count?: number | null
          keywords?: string[] | null
          london_locations?: string[] | null
          meta_description: string
          meta_title: string
          mobile_friendly?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_slug: string
          page_speed_score?: number | null
          schema_markup?: Json | null
          ssl_enabled?: boolean | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          alt_texts?: string[] | null
          canonical_url?: string | null
          competitor_analysis?: Json | null
          content_score?: number | null
          content_structure?: Json | null
          created_at?: string
          created_by?: string
          external_links_count?: number | null
          focus_keyword?: string
          h1_heading?: string | null
          h2_headings?: string[] | null
          h3_headings?: string[] | null
          id?: string
          internal_links_count?: number | null
          keywords?: string[] | null
          london_locations?: string[] | null
          meta_description?: string
          meta_title?: string
          mobile_friendly?: boolean | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_slug?: string
          page_speed_score?: number | null
          schema_markup?: Json | null
          ssl_enabled?: boolean | null
          twitter_description?: string | null
          twitter_image?: string | null
          twitter_title?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
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
