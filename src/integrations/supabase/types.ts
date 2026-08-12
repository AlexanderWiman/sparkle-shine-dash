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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          addons: Json
          booking_number: string
          created_at: string
          customer_name: string
          date: string
          email: string
          extras: Json
          facility_id: string | null
          gdpr_consent: boolean
          id: string
          location: string
          notes: string | null
          payment_method: string | null
          payment_status: string
          phone: string
          service_id: string
          service_name: string
          service_price: number
          source: string | null
          status: string
          time: string
          total_price: number
          updated_at: string
          vehicle_brand: string
          vehicle_model: string
          vehicle_registration: string
          vehicle_size: string | null
        }
        Insert: {
          addons?: Json
          booking_number: string
          created_at?: string
          customer_name: string
          date: string
          email?: string
          extras?: Json
          facility_id?: string | null
          gdpr_consent?: boolean
          id?: string
          location?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string
          service_id: string
          service_name: string
          service_price?: number
          source?: string | null
          status?: string
          time: string
          total_price?: number
          updated_at?: string
          vehicle_brand?: string
          vehicle_model?: string
          vehicle_registration?: string
          vehicle_size?: string | null
        }
        Update: {
          addons?: Json
          booking_number?: string
          created_at?: string
          customer_name?: string
          date?: string
          email?: string
          extras?: Json
          facility_id?: string | null
          gdpr_consent?: boolean
          id?: string
          location?: string
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          phone?: string
          service_id?: string
          service_name?: string
          service_price?: number
          source?: string | null
          status?: string
          time?: string
          total_price?: number
          updated_at?: string
          vehicle_brand?: string
          vehicle_model?: string
          vehicle_registration?: string
          vehicle_size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          capacity: number
          city: string
          created_at: string
          email: string | null
          geofence_radius: number
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours_saturday: string
          opening_hours_sunday: string | null
          opening_hours_weekdays: string
          phone: string | null
          postal_code: string
          street_address: string
          updated_at: string
        }
        Insert: {
          capacity?: number
          city?: string
          created_at?: string
          email?: string | null
          geofence_radius?: number
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours_saturday?: string
          opening_hours_sunday?: string | null
          opening_hours_weekdays?: string
          phone?: string | null
          postal_code?: string
          street_address?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          city?: string
          created_at?: string
          email?: string | null
          geofence_radius?: number
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours_saturday?: string
          opening_hours_sunday?: string | null
          opening_hours_weekdays?: string
          phone?: string | null
          postal_code?: string
          street_address?: string
          updated_at?: string
        }
        Relationships: []
      }
      landing_page_content: {
        Row: {
          content: Json
          id: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempt_timestamp: string
          created_at: string
          id: string
          success: boolean
          username: string
        }
        Insert: {
          attempt_timestamp?: string
          created_at?: string
          id?: string
          success?: boolean
          username: string
        }
        Update: {
          attempt_timestamp?: string
          created_at?: string
          id?: string
          success?: boolean
          username?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          description: string
          discount: number | null
          discount_amount: number | null
          id: string
          is_active: boolean
          title: string
          updated_at: string
          valid_from: string
          valid_to: string
        }
        Insert: {
          created_at?: string
          description?: string
          discount?: number | null
          discount_amount?: number | null
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
          valid_from: string
          valid_to: string
        }
        Update: {
          created_at?: string
          description?: string
          discount?: number | null
          discount_amount?: number | null
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
          valid_from?: string
          valid_to?: string
        }
        Relationships: []
      }
      partner_api_keys: {
        Row: {
          api_key_hash: string
          api_key_prefix: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          name: string
          source_tag: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          api_key_hash: string
          api_key_prefix: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name: string
          source_tag: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          api_key_hash?: string
          api_key_prefix?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          name?: string
          source_tag?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          facility_id: string | null
          id: string
          must_change_password: boolean
          phone: string | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name: string
          facility_id?: string | null
          id: string
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string
          facility_id?: string | null
          id?: string
          must_change_password?: boolean
          phone?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      scheduled_notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          location_id: string | null
          message: string
          scheduled_for: string
          sent_at: string | null
          status: string
          target: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          location_id?: string | null
          message: string
          scheduled_for: string
          sent_at?: string | null
          status?: string
          target: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          location_id?: string | null
          message?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          target?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      todos: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          facility_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          facility_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          facility_id?: string | null
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
      cleanup_old_login_attempts: { Args: never; Returns: undefined }
      get_user_facilities: { Args: { _user_id: string }; Returns: string[] }
      get_user_facility_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_chef_at_facility: {
        Args: { _facility_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_locked_out: { Args: { _username: string }; Returns: boolean }
      record_login_attempt: {
        Args: { _success: boolean; _username: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "chef" | "arbetare"
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
      app_role: ["admin", "chef", "arbetare"],
    },
  },
} as const
