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
      creative_design_cost_tiers: {
        Row: {
          category: string
          cost_per_unit: number
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          location_area: string | null
          max_quantity: number | null
          media_format_id: string
          min_quantity: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category: string
          cost_per_unit: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          location_area?: string | null
          max_quantity?: number | null
          media_format_id: string
          min_quantity: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          cost_per_unit?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          location_area?: string | null
          max_quantity?: number | null
          media_format_id?: string
          min_quantity?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creative_design_cost_tiers_media_format_id_fkey"
            columns: ["media_format_id"]
            isOneToOne: false
            referencedRelation: "media_formats"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_tiers: {
        Row: {
          created_at: string
          created_by: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          max_periods: number | null
          media_format_id: string
          min_periods: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          discount_percentage: number
          id?: string
          is_active?: boolean
          max_periods?: number | null
          media_format_id: string
          min_periods?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_periods?: number | null
          media_format_id?: string
          min_periods?: number | null
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
      incharge_periods: {
        Row: {
          created_at: string
          end_date: string
          id: string
          period_number: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          period_number: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          period_number?: number
          start_date?: string
          updated_at?: string
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
          category: string | null
          cost_per_unit: number
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          location_area: string | null
          max_quantity: number | null
          media_format_id: string
          min_quantity: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          cost_per_unit: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          location_area?: string | null
          max_quantity?: number | null
          media_format_id: string
          min_quantity: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          cost_per_unit?: number
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          location_area?: string | null
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
      quote_items: {
        Row: {
          base_cost: number | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          created_at: string
          creative_cost: number | null
          creative_needs: string | null
          discount_amount: number | null
          discount_percentage: number | null
          format_name: string
          format_slug: string
          id: string
          original_cost: number | null
          production_cost: number | null
          quantity: number
          quote_id: string
          selected_areas: string[]
          selected_periods: number[]
          subtotal: number | null
          total_cost: number | null
          total_inc_vat: number | null
          updated_at: string
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          base_cost?: number | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string
          creative_cost?: number | null
          creative_needs?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          format_name: string
          format_slug: string
          id?: string
          original_cost?: number | null
          production_cost?: number | null
          quantity?: number
          quote_id: string
          selected_areas?: string[]
          selected_periods?: number[]
          subtotal?: number | null
          total_cost?: number | null
          total_inc_vat?: number | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          base_cost?: number | null
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string
          creative_cost?: number | null
          creative_needs?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          format_name?: string
          format_slug?: string
          id?: string
          original_cost?: number | null
          production_cost?: number | null
          quantity?: number
          quote_id?: string
          selected_areas?: string[]
          selected_periods?: number[]
          subtotal?: number | null
          total_cost?: number | null
          total_inc_vat?: number | null
          updated_at?: string
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          additional_requirements: string | null
          approved_at: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          confirmed_details: Json | null
          contact_company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_details: Json | null
          created_at: string
          id: string
          rejected_at: string | null
          rejection_reason: string | null
          status: string
          subtotal: number | null
          timeline: string | null
          total_cost: number | null
          total_inc_vat: number | null
          updated_at: string
          user_id: string | null
          user_session_id: string
          vat_amount: number | null
          vat_rate: number | null
          website: string | null
        }
        Insert: {
          additional_requirements?: string | null
          approved_at?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_details?: Json | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_details?: Json | null
          created_at?: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          subtotal?: number | null
          timeline?: string | null
          total_cost?: number | null
          total_inc_vat?: number | null
          updated_at?: string
          user_id?: string | null
          user_session_id: string
          vat_amount?: number | null
          vat_rate?: number | null
          website?: string | null
        }
        Update: {
          additional_requirements?: string | null
          approved_at?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_details?: Json | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_details?: Json | null
          created_at?: string
          id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          status?: string
          subtotal?: number | null
          timeline?: string | null
          total_cost?: number | null
          total_inc_vat?: number | null
          updated_at?: string
          user_id?: string | null
          user_session_id?: string
          vat_amount?: number | null
          vat_rate?: number | null
          website?: string | null
        }
        Relationships: []
      }
      rate_card_periods: {
        Row: {
          created_at: string
          id: string
          incharge_period_id: string
          is_enabled: boolean
          rate_card_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          incharge_period_id: string
          is_enabled?: boolean
          rate_card_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          incharge_period_id?: string
          is_enabled?: boolean
          rate_card_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rate_card_periods_incharge_period_id_fkey"
            columns: ["incharge_period_id"]
            isOneToOne: false
            referencedRelation: "incharge_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rate_card_periods_rate_card_id_fkey"
            columns: ["rate_card_id"]
            isOneToOne: false
            referencedRelation: "rate_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_cards: {
        Row: {
          base_rate_per_incharge: number
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          incharge_period: number | null
          is_active: boolean
          is_date_specific: boolean | null
          location_area: string
          location_markup_percentage: number | null
          media_format_id: string
          quantity_per_medium: number | null
          reduced_price: number | null
          sale_price: number | null
          start_date: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          base_rate_per_incharge: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          incharge_period?: number | null
          is_active?: boolean
          is_date_specific?: boolean | null
          location_area: string
          location_markup_percentage?: number | null
          media_format_id: string
          quantity_per_medium?: number | null
          reduced_price?: number | null
          sale_price?: number | null
          start_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          base_rate_per_incharge?: number
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          incharge_period?: number | null
          is_active?: boolean
          is_date_specific?: boolean | null
          location_area?: string
          location_markup_percentage?: number | null
          media_format_id?: string
          quantity_per_medium?: number | null
          reduced_price?: number | null
          sale_price?: number | null
          start_date?: string | null
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
