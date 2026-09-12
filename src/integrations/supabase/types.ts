export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      integration_settings: {
        Row: {
          admin_note: string | null;
          category: string;
          config: Json;
          created_at: string;
          display_name: string;
          enabled: boolean;
          id: string;
          mode: string;
          provider_key: string;
          sort_order: number;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          admin_note?: string | null;
          category: string;
          config?: Json;
          created_at?: string;
          display_name: string;
          enabled?: boolean;
          id?: string;
          mode?: string;
          provider_key: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          admin_note?: string | null;
          category?: string;
          config?: Json;
          created_at?: string;
          display_name?: string;
          enabled?: boolean;
          id?: string;
          mode?: string;
          provider_key?: string;
          sort_order?: number;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      legal_documents: {
        Row: {
          body: string;
          approved_at: string | null;
          approved_by: string | null;
          created_at: string;
          effective_date: string | null;
          id: string;
          slug: string;
          review_status: string;
          summary: string | null;
          title: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
        };
        Insert: {
          body?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          effective_date?: string | null;
          id?: string;
          slug: string;
          review_status?: string;
          summary?: string | null;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Update: {
          body?: string;
          approved_at?: string | null;
          approved_by?: string | null;
          created_at?: string;
          effective_date?: string | null;
          id?: string;
          slug?: string;
          review_status?: string;
          summary?: string | null;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          line_total_kurus: number | null;
          order_id: string;
          product_id: string;
          product_name: string;
          product_slug: string;
          quantity: number;
          stage: string | null;
          unit_price_kurus: number | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          line_total_kurus?: number | null;
          order_id: string;
          product_id: string;
          product_name: string;
          product_slug: string;
          quantity: number;
          stage?: string | null;
          unit_price_kurus?: number | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          line_total_kurus?: number | null;
          order_id?: string;
          product_id?: string;
          product_name?: string;
          product_slug?: string;
          quantity?: number;
          stage?: string | null;
          unit_price_kurus?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          address_line: string;
          city: string;
          created_at: string;
          district: string;
          email: string;
          full_name: string;
          id: string;
          item_count: number;
          note: string | null;
          order_number: string;
          payment_method_id: string;
          payment_method_title: string;
          phone: string;
          shipping_kurus: number | null;
          shipping_option_id: string;
          shipping_option_title: string;
          status: string;
          subtotal_kurus: number | null;
          total_kurus: number | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          address_line: string;
          city: string;
          created_at?: string;
          district: string;
          email: string;
          full_name: string;
          id?: string;
          item_count?: number;
          note?: string | null;
          order_number: string;
          payment_method_id: string;
          payment_method_title: string;
          phone: string;
          shipping_kurus?: number | null;
          shipping_option_id: string;
          shipping_option_title: string;
          status?: string;
          subtotal_kurus?: number | null;
          total_kurus?: number | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          address_line?: string;
          city?: string;
          created_at?: string;
          district?: string;
          email?: string;
          full_name?: string;
          id?: string;
          item_count?: number;
          note?: string | null;
          order_number?: string;
          payment_method_id?: string;
          payment_method_title?: string;
          phone?: string;
          shipping_kurus?: number | null;
          shipping_option_id?: string;
          shipping_option_title?: string;
          status?: string;
          subtotal_kurus?: number | null;
          total_kurus?: number | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      product_settings: {
        Row: {
          admin_note: string | null;
          created_at: string;
          direct_sale_enabled: boolean;
          id: string;
          ingredients: string[];
          price_kurus: number | null;
          slug: string;
          stock: string;
          updated_at: string;
          updated_by: string | null;
          weight: string | null;
        };
        Insert: {
          admin_note?: string | null;
          created_at?: string;
          direct_sale_enabled?: boolean;
          id?: string;
          ingredients?: string[];
          price_kurus?: number | null;
          slug: string;
          stock?: string;
          updated_at?: string;
          updated_by?: string | null;
          weight?: string | null;
        };
        Update: {
          admin_note?: string | null;
          created_at?: string;
          direct_sale_enabled?: boolean;
          id?: string;
          ingredients?: string[];
          price_kurus?: number | null;
          slug?: string;
          stock?: string;
          updated_at?: string;
          updated_by?: string | null;
          weight?: string | null;
        };
        Relationships: [];
      };
      shipment_events: {
        Row: {
          created_at: string;
          id: string;
          occurred_at: string;
          order_number: string;
          payload: Json | null;
          provider_key: string;
          status: string;
          status_detail: string | null;
          tracking_number: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          occurred_at?: string;
          order_number: string;
          payload?: Json | null;
          provider_key: string;
          status: string;
          status_detail?: string | null;
          tracking_number?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          occurred_at?: string;
          order_number?: string;
          payload?: Json | null;
          provider_key?: string;
          status?: string;
          status_detail?: string | null;
          tracking_number?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      record_cookie_consent: {
        Args: { p_anonymous_id: string; p_choice: string; p_policy_version: string };
        Returns: undefined;
      };
      request_marketing_subscription: {
        Args: { p_consent_version: string; p_email: string; p_market_code: string };
        Returns: undefined;
      };
      customer_get_account: { Args: { p_user_id: string }; Returns: Json };
      customer_upsert_profile: {
        Args: { p_full_name: string; p_phone: string; p_user_id: string };
        Returns: undefined;
      };
      customer_save_address: {
        Args: {
          p_address: Json;
          p_address_id: string | null;
          p_is_default: boolean;
          p_label: string;
          p_phone: string;
          p_recipient_name: string;
          p_user_id: string;
        };
        Returns: string;
      };
      customer_delete_address: {
        Args: { p_address_id: string; p_user_id: string };
        Returns: undefined;
      };
      customer_get_commerce_order: {
        Args: { p_order_number: string; p_user_id: string };
        Returns: Json;
      };
      customer_list_commerce_orders: { Args: { p_user_id: string }; Returns: Json };
      track_commerce_order: {
        Args: { p_email: string; p_order_number: string; p_phone_last4: string };
        Returns: Json;
      };
      admin_operational_health: { Args: { p_actor_id: string }; Returns: Json };
      admin_retry_outbox_event: {
        Args: { p_actor_id: string; p_event_id: string };
        Returns: undefined;
      };
      adjust_inventory: {
        Args: {
          p_actor_id: string;
          p_idempotency_key: string;
          p_quantity_delta: number;
          p_reason: string;
          p_variant_id: string;
          p_warehouse_id: string;
        };
        Returns: Json;
      };
      admin_get_order: { Args: { p_actor_id: string; p_order_number: string }; Returns: Json };
      admin_search_orders: {
        Args: {
          p_actor_id: string;
          p_limit?: number;
          p_market_code?: string;
          p_offset?: number;
          p_query?: string | null;
          p_status?: string | null;
        };
        Returns: Json;
      };
      claim_outbox_events: {
        Args: { p_lease_seconds?: number; p_limit?: number; p_worker_id: string };
        Returns: Json[];
      };
      consume_rate_limit: {
        Args: {
          p_limit: number;
          p_scope: string;
          p_subject_hash: string;
          p_window_seconds: number;
        };
        Returns: Json;
      };
      apply_verified_payment_event: {
        Args: {
          p_amount_minor: number;
          p_currency_code: string;
          p_event_type: string;
          p_payload: Json;
          p_payment_status: string;
          p_provider: string;
          p_provider_event_id: string;
          p_provider_reference: string;
        };
        Returns: Json;
      };
      attach_payment_provider_reference: {
        Args: { p_attempt_id: string; p_provider_reference: string };
        Returns: undefined;
      };
      create_commerce_checkout: {
        Args: {
          p_billing_address: Json;
          p_customer_email: string;
          p_customer_note?: string | null;
          p_customer_phone: string;
          p_idempotency_key: string;
          p_items: Json;
          p_market_code: string;
          p_privacy_version: string;
          p_shipping_address: Json;
          p_terms_version: string;
          p_user_id: string | null;
        };
        Returns: Json;
      };
      create_payment_attempt: {
        Args: { p_idempotency_key: string; p_order_id: string; p_provider: string };
        Returns: Json;
      };
      finish_outbox_event: {
        Args: {
          p_error?: string | null;
          p_event_id: string;
          p_success: boolean;
          p_worker_id: string;
        };
        Returns: undefined;
      };
      release_expired_inventory_reservations: {
        Args: { p_limit?: number };
        Returns: number;
      };
      request_payment_refund: {
        Args: {
          p_actor_id: string | null;
          p_amount_minor: number;
          p_idempotency_key: string;
          p_order_id: string;
          p_reason: string;
        };
        Returns: Json;
      };
      request_order_fulfilment: {
        Args: {
          p_actor_id: string | null;
          p_idempotency_key: string;
          p_order_id: string;
          p_provider: string;
          p_service_code: string;
        };
        Returns: Json;
      };
      request_order_invoice: {
        Args: { p_actor_id: string | null; p_order_id: string; p_provider: string };
        Returns: Json;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "admin" | "editor" | "user";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const;
