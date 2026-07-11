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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      application_containers: {
        Row: {
          application_id: string
          container_no: string | null
          electronic_seal_no: string | null
          id: string
          line_seal_no: string | null
          quantity: string | null
          seq: number | null
          size: string | null
        }
        Insert: {
          application_id: string
          container_no?: string | null
          electronic_seal_no?: string | null
          id?: string
          line_seal_no?: string | null
          quantity?: string | null
          seq?: number | null
          size?: string | null
        }
        Update: {
          application_id?: string
          container_no?: string | null
          electronic_seal_no?: string | null
          id?: string
          line_seal_no?: string | null
          quantity?: string | null
          seq?: number | null
          size?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_containers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_items: {
        Row: {
          amount: number | null
          application_id: string
          container_id: string | null
          description: string
          gross_weight: number | null
          id: string
          net_weight: number | null
          packages: number | null
          quantity: number | null
          rate: number | null
          seq: number | null
          unit: string | null
        }
        Insert: {
          amount?: number | null
          application_id: string
          container_id?: string | null
          description: string
          gross_weight?: number | null
          id?: string
          net_weight?: number | null
          packages?: number | null
          quantity?: number | null
          rate?: number | null
          seq?: number | null
          unit?: string | null
        }
        Update: {
          amount?: number | null
          application_id?: string
          container_id?: string | null
          description?: string
          gross_weight?: number | null
          id?: string
          net_weight?: number | null
          packages?: number | null
          quantity?: number | null
          rate?: number | null
          seq?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_items_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_items_container_id_fkey"
            columns: ["container_id"]
            isOneToOne: false
            referencedRelation: "application_containers"
            referencedColumns: ["id"]
          },
        ]
      }
      application_stages: {
        Row: {
          acted_at: string | null
          acted_by: string | null
          application_id: string
          comment: string | null
          id: string
          seq: number
          stage_key: string
          stage_label: string
          status: string
        }
        Insert: {
          acted_at?: string | null
          acted_by?: string | null
          application_id: string
          comment?: string | null
          id?: string
          seq?: number
          stage_key: string
          stage_label: string
          status?: string
        }
        Update: {
          acted_at?: string | null
          acted_by?: string | null
          application_id?: string
          comment?: string | null
          id?: string
          seq?: number
          stage_key?: string
          stage_label?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_stages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          amount_in_words: string | null
          app_no: string
          bank_id: string | null
          bin_no: string | null
          consignee_address: string | null
          consignee_name: string | null
          country_origin: string | null
          created_at: string
          created_by: string | null
          current_stage: string
          customer_id: string | null
          declaration: string | null
          expected_shipment: string | null
          export_terms: string | null
          exporter_address: string | null
          exporter_name: string | null
          final_destination_id: string | null
          final_destination_text: string | null
          gst_no: string | null
          hsn_codes: string | null
          id: string
          iec_no: string | null
          invoice_currency: string | null
          invoice_date: string | null
          invoice_no: string | null
          loading_charge: number | null
          lut_no: string | null
          meta: Json | null
          notes: string | null
          notify_party: string | null
          payment_terms: string | null
          port_discharge_id: string | null
          port_discharge_text: string | null
          port_loading_id: string | null
          port_loading_text: string | null
          products_desc: string | null
          second_notify: string | null
          state_of_origin: string | null
          status: Database["public"]["Enums"]["app_status"]
          third_party: string | null
          total_amount: number | null
          total_packages: number | null
          updated_at: string
        }
        Insert: {
          amount_in_words?: string | null
          app_no: string
          bank_id?: string | null
          bin_no?: string | null
          consignee_address?: string | null
          consignee_name?: string | null
          country_origin?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: string
          customer_id?: string | null
          declaration?: string | null
          expected_shipment?: string | null
          export_terms?: string | null
          exporter_address?: string | null
          exporter_name?: string | null
          final_destination_id?: string | null
          final_destination_text?: string | null
          gst_no?: string | null
          hsn_codes?: string | null
          id?: string
          iec_no?: string | null
          invoice_currency?: string | null
          invoice_date?: string | null
          invoice_no?: string | null
          loading_charge?: number | null
          lut_no?: string | null
          meta?: Json | null
          notes?: string | null
          notify_party?: string | null
          payment_terms?: string | null
          port_discharge_id?: string | null
          port_discharge_text?: string | null
          port_loading_id?: string | null
          port_loading_text?: string | null
          products_desc?: string | null
          second_notify?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["app_status"]
          third_party?: string | null
          total_amount?: number | null
          total_packages?: number | null
          updated_at?: string
        }
        Update: {
          amount_in_words?: string | null
          app_no?: string
          bank_id?: string | null
          bin_no?: string | null
          consignee_address?: string | null
          consignee_name?: string | null
          country_origin?: string | null
          created_at?: string
          created_by?: string | null
          current_stage?: string
          customer_id?: string | null
          declaration?: string | null
          expected_shipment?: string | null
          export_terms?: string | null
          exporter_address?: string | null
          exporter_name?: string | null
          final_destination_id?: string | null
          final_destination_text?: string | null
          gst_no?: string | null
          hsn_codes?: string | null
          id?: string
          iec_no?: string | null
          invoice_currency?: string | null
          invoice_date?: string | null
          invoice_no?: string | null
          loading_charge?: number | null
          lut_no?: string | null
          meta?: Json | null
          notes?: string | null
          notify_party?: string | null
          payment_terms?: string | null
          port_discharge_id?: string | null
          port_discharge_text?: string | null
          port_loading_id?: string | null
          port_loading_text?: string | null
          products_desc?: string | null
          second_notify?: string | null
          state_of_origin?: string | null
          status?: Database["public"]["Enums"]["app_status"]
          third_party?: string | null
          total_amount?: number | null
          total_packages?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_bank_id_fkey"
            columns: ["bank_id"]
            isOneToOne: false
            referencedRelation: "banks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_final_destination_id_fkey"
            columns: ["final_destination_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_port_discharge_id_fkey"
            columns: ["port_discharge_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_port_loading_id_fkey"
            columns: ["port_loading_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      banks: {
        Row: {
          account_no: string | null
          ad_code: string | null
          bank_name: string
          branch: string | null
          created_at: string
          id: string
          ifsc_code: string | null
          swift_code: string | null
        }
        Insert: {
          account_no?: string | null
          ad_code?: string | null
          bank_name: string
          branch?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          swift_code?: string | null
        }
        Update: {
          account_no?: string | null
          ad_code?: string | null
          bank_name?: string
          branch?: string | null
          created_at?: string
          id?: string
          ifsc_code?: string | null
          swift_code?: string | null
        }
        Relationships: []
      }
      countries: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      ports: {
        Row: {
          code: string | null
          country_id: string | null
          created_at: string
          id: string
          name: string
          port_type: string | null
        }
        Insert: {
          code?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          name: string
          port_type?: string | null
        }
        Update: {
          code?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          name?: string
          port_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ports_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          default_rate: number | null
          description: string | null
          hsn_code: string | null
          id: string
          name: string
          unit: string | null
        }
        Insert: {
          created_at?: string
          default_rate?: number | null
          description?: string | null
          hsn_code?: string | null
          id?: string
          name: string
          unit?: string | null
        }
        Update: {
          created_at?: string
          default_rate?: number | null
          description?: string | null
          hsn_code?: string | null
          id?: string
          name?: string
          unit?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      shipping_lines: {
        Row: {
          code: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          id?: string
          name?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      generate_app_no: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin"
        | "documentation"
        | "sales"
        | "accounts"
        | "warehouse"
        | "production"
        | "purchase"
        | "quality"
        | "viewer"
      app_status:
        | "draft"
        | "in_progress"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "shipped"
        | "closed"
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
      app_role: [
        "super_admin",
        "admin",
        "documentation",
        "sales",
        "accounts",
        "warehouse",
        "production",
        "purchase",
        "quality",
        "viewer",
      ],
      app_status: [
        "draft",
        "in_progress",
        "pending_approval",
        "approved",
        "rejected",
        "shipped",
        "closed",
      ],
    },
  },
} as const
