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
      admin_audit_events: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          id: string
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          id?: string
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          actor_type: string
          correlation_id: string | null
          created_at: string
          id: number
          market_id: string | null
          metadata: Json
          resource_id: string | null
          resource_type: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_type: string
          correlation_id?: string | null
          created_at?: string
          id?: never
          market_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_type?: string
          correlation_id?: string | null
          created_at?: string
          id?: never
          market_id?: string | null
          metadata?: Json
          resource_id?: string | null
          resource_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_products: {
        Row: {
          brand: string
          created_at: string
          id: string
          product_type: string
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          brand?: string
          created_at?: string
          id?: string
          product_type?: string
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          brand?: string
          created_at?: string
          id?: string
          product_type?: string
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_variants: {
        Row: {
          active: boolean
          attributes: Json
          barcode: string | null
          created_at: string
          id: string
          product_id: string
          sku: string
          updated_at: string
          weight_grams: number
        }
        Insert: {
          active?: boolean
          attributes?: Json
          barcode?: string | null
          created_at?: string
          id?: string
          product_id: string
          sku: string
          updated_at?: string
          weight_grams: number
        }
        Update: {
          active?: boolean
          attributes?: Json
          barcode?: string | null
          created_at?: string
          id?: string
          product_id?: string
          sku?: string
          updated_at?: string
          weight_grams?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalog_products"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_order_items: {
        Row: {
          created_at: string
          discount_minor: number
          id: string
          line_total_minor: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          snapshot: Json
          tax_minor: number
          unit_price_minor: number
          variant_id: string
        }
        Insert: {
          created_at?: string
          discount_minor?: number
          id?: string
          line_total_minor: number
          order_id: string
          product_name: string
          quantity: number
          sku: string
          snapshot?: Json
          tax_minor?: number
          unit_price_minor: number
          variant_id: string
        }
        Update: {
          created_at?: string
          discount_minor?: number
          id?: string
          line_total_minor?: number
          order_id?: string
          product_name?: string
          quantity?: number
          sku?: string
          snapshot?: Json
          tax_minor?: number
          unit_price_minor?: number
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commerce_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commerce_order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      commerce_orders: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          billing_address: Json
          created_at: string
          currency_code: string
          customer_email: string
          customer_note: string | null
          customer_phone: string
          discount_minor: number
          grand_total_minor: number
          id: string
          market_id: string
          order_number: string
          placed_at: string | null
          privacy_version: string
          shipping_address: Json
          shipping_minor: number
          status: Database["public"]["Enums"]["commerce_order_status"]
          subtotal_minor: number
          tax_minor: number
          terms_version: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          billing_address: Json
          created_at?: string
          currency_code: string
          customer_email: string
          customer_note?: string | null
          customer_phone: string
          discount_minor?: number
          grand_total_minor: number
          id?: string
          market_id: string
          order_number: string
          placed_at?: string | null
          privacy_version: string
          shipping_address: Json
          shipping_minor?: number
          status?: Database["public"]["Enums"]["commerce_order_status"]
          subtotal_minor: number
          tax_minor?: number
          terms_version: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          billing_address?: Json
          created_at?: string
          currency_code?: string
          customer_email?: string
          customer_note?: string | null
          customer_phone?: string
          discount_minor?: number
          grand_total_minor?: number
          id?: string
          market_id?: string
          order_number?: string
          placed_at?: string | null
          privacy_version?: string
          shipping_address?: Json
          shipping_minor?: number
          status?: Database["public"]["Enums"]["commerce_order_status"]
          subtotal_minor?: number
          tax_minor?: number
          terms_version?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commerce_orders_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      content_entries: {
        Row: {
          body: string
          canonical_path: string | null
          category: string
          content_type: string
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          excerpt: string
          id: string
          locale: string
          market_id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          body?: string
          canonical_path?: string | null
          category?: string
          content_type: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string
          id?: string
          locale?: string
          market_id: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          body?: string
          canonical_path?: string | null
          category?: string
          content_type?: string
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string
          id?: string
          locale?: string
          market_id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_entries_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      cookie_consent_receipts: {
        Row: {
          anonymous_id: string
          choice: string
          id: string
          policy_version: string
          recorded_at: string
        }
        Insert: {
          anonymous_id: string
          choice: string
          id?: string
          policy_version: string
          recorded_at?: string
        }
        Update: {
          anonymous_id?: string
          choice?: string
          id?: string
          policy_version?: string
          recorded_at?: string
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address: Json
          created_at: string
          id: string
          is_default: boolean
          label: string | null
          market_id: string
          phone: string
          recipient_name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address: Json
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          market_id: string
          phone: string
          recipient_name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: Json
          created_at?: string
          id?: string
          is_default?: boolean
          label?: string | null
          market_id?: string
          phone?: string
          recipient_name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_profiles: {
        Row: {
          created_at: string
          default_market_id: string | null
          full_name: string | null
          locale: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_market_id?: string | null
          full_name?: string | null
          locale?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_market_id?: string | null
          full_name?: string | null
          locale?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_profiles_default_market_id_fkey"
            columns: ["default_market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      idempotency_records: {
        Row: {
          created_at: string
          expires_at: string
          idempotency_key: string
          locked_until: string | null
          request_hash: string
          resource_id: string | null
          response_body: Json | null
          response_status: number | null
          scope: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          idempotency_key: string
          locked_until?: string | null
          request_hash: string
          resource_id?: string | null
          response_body?: Json | null
          response_status?: number | null
          scope: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          idempotency_key?: string
          locked_until?: string | null
          request_hash?: string
          resource_id?: string | null
          response_body?: Json | null
          response_status?: number | null
          scope?: string
          updated_at?: string
        }
        Relationships: []
      }
      incident_updates: {
        Row: {
          author_id: string | null
          created_at: string
          id: number
          incident_id: string
          note: string
          status: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: never
          incident_id: string
          note: string
          status: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: never
          incident_id?: string
          note?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "operational_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_settings: {
        Row: {
          admin_note: string | null
          category: string
          config: Json
          created_at: string
          display_name: string
          enabled: boolean
          id: string
          mode: string
          provider_key: string
          sort_order: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          admin_note?: string | null
          category: string
          config?: Json
          created_at?: string
          display_name: string
          enabled?: boolean
          id?: string
          mode?: string
          provider_key: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          admin_note?: string | null
          category?: string
          config?: Json
          created_at?: string
          display_name?: string
          enabled?: boolean
          id?: string
          mode?: string
          provider_key?: string
          sort_order?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      inventory_adjustment_requests: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          idempotency_key: string
          quantity_delta: number
          reason: string
          variant_id: string
          warehouse_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          idempotency_key: string
          quantity_delta: number
          reason: string
          variant_id: string
          warehouse_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          quantity_delta?: number
          reason?: string
          variant_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_adjustment_requests_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_adjustment_requests_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_balances: {
        Row: {
          on_hand: number
          reorder_point: number
          reserved: number
          updated_at: string
          variant_id: string
          version: number
          warehouse_id: string
        }
        Insert: {
          on_hand?: number
          reorder_point?: number
          reserved?: number
          updated_at?: string
          variant_id: string
          version?: number
          warehouse_id: string
        }
        Update: {
          on_hand?: number
          reorder_point?: number
          reserved?: number
          updated_at?: string
          variant_id?: string
          version?: number
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_balances_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_balances_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_ledger: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: number
          on_hand_delta: number
          order_id: string | null
          quantity_delta: number
          reason: string | null
          reservation_id: string | null
          reserved_delta: number
          variant_id: string
          warehouse_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: never
          on_hand_delta?: number
          order_id?: string | null
          quantity_delta?: number
          reason?: string | null
          reservation_id?: string | null
          reserved_delta?: number
          variant_id: string
          warehouse_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: never
          on_hand_delta?: number
          order_id?: string | null
          quantity_delta?: number
          reason?: string | null
          reservation_id?: string | null
          reserved_delta?: number
          variant_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_ledger_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "inventory_reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_ledger_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_operations: {
        Row: {
          actor_id: string
          created_at: string
          id: string
          idempotency_key: string
          operation_type: string
          quantity_delta: number
          quantity_input: number
          reason: string
          variant_id: string
          warehouse_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          id?: string
          idempotency_key: string
          operation_type: string
          quantity_delta: number
          quantity_input: number
          reason: string
          variant_id: string
          warehouse_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          operation_type?: string
          quantity_delta?: number
          quantity_input?: number
          reason?: string
          variant_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_operations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_operations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          quantity: number
          status: Database["public"]["Enums"]["commerce_reservation_status"]
          updated_at: string
          variant_id: string
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          order_id: string
          quantity: number
          status?: Database["public"]["Enums"]["commerce_reservation_status"]
          updated_at?: string
          variant_id: string
          warehouse_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          quantity?: number
          status?: Database["public"]["Enums"]["commerce_reservation_status"]
          updated_at?: string
          variant_id?: string
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          document_reference: string | null
          id: string
          issued_at: string | null
          order_id: string
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["commerce_invoice_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          document_reference?: string | null
          id?: string
          issued_at?: string | null
          order_id: string
          provider: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["commerce_invoice_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          document_reference?: string | null
          id?: string
          issued_at?: string | null
          order_id?: string
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["commerce_invoice_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          archived_at: string
          body: string
          effective_date: string | null
          id: string
          legal_document_id: string
          review_status: string
          slug: string
          summary: string | null
          title: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string
          body: string
          effective_date?: string | null
          id?: string
          legal_document_id: string
          review_status: string
          slug: string
          summary?: string | null
          title: string
          version: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          archived_at?: string
          body?: string
          effective_date?: string | null
          id?: string
          legal_document_id?: string
          review_status?: string
          slug?: string
          summary?: string | null
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_versions_legal_document_id_fkey"
            columns: ["legal_document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          body: string
          created_at: string
          effective_date: string | null
          id: string
          review_status: string
          slug: string
          summary: string | null
          title: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          review_status?: string
          slug: string
          summary?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          body?: string
          created_at?: string
          effective_date?: string | null
          id?: string
          review_status?: string
          slug?: string
          summary?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      legal_entities: {
        Row: {
          active: boolean
          created_at: string
          id: string
          market_id: string
          mersis_number: string | null
          registered_address: Json
          registered_name: string
          support_email: string | null
          support_phone: string | null
          tax_identifier: string | null
          tax_office: string | null
          trade_registry_number: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          market_id: string
          mersis_number?: string | null
          registered_address?: Json
          registered_name: string
          support_email?: string | null
          support_phone?: string | null
          tax_identifier?: string | null
          tax_office?: string | null
          trade_registry_number?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          market_id?: string
          mersis_number?: string | null
          registered_address?: Json
          registered_name?: string
          support_email?: string | null
          support_phone?: string | null
          tax_identifier?: string | null
          tax_office?: string | null
          trade_registry_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "legal_entities_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_listings: {
        Row: {
          compare_at_price_minor: number | null
          created_at: string
          currency_code: string
          description: string | null
          id: string
          locale: string
          market_id: string
          metadata: Json
          name: string
          published_at: string | null
          sale_enabled: boolean
          tax_category: string
          unit_price_minor: number
          updated_at: string
          variant_id: string
        }
        Insert: {
          compare_at_price_minor?: number | null
          created_at?: string
          currency_code: string
          description?: string | null
          id?: string
          locale: string
          market_id: string
          metadata?: Json
          name: string
          published_at?: string | null
          sale_enabled?: boolean
          tax_category: string
          unit_price_minor: number
          updated_at?: string
          variant_id: string
        }
        Update: {
          compare_at_price_minor?: number | null
          created_at?: string
          currency_code?: string
          description?: string | null
          id?: string
          locale?: string
          market_id?: string
          metadata?: Json
          name?: string
          published_at?: string | null
          sale_enabled?: boolean
          tax_category?: string
          unit_price_minor?: number
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_listings_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_listings_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "catalog_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_subscriptions: {
        Row: {
          confirmed_at: string | null
          consent_version: string
          consented_at: string
          created_at: string
          email: string
          id: string
          market_code: string
          status: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          consent_version: string
          consented_at?: string
          created_at?: string
          email: string
          id?: string
          market_code?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          consent_version?: string
          consented_at?: string
          created_at?: string
          email?: string
          id?: string
          market_code?: string
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      markets: {
        Row: {
          code: string
          country_code: string | null
          created_at: string
          currency_code: string
          default_locale: string
          enabled: boolean
          id: string
          name: string
          primary_domain: string
          settings: Json
          supported_locales: Json
          timezone: string
          updated_at: string
        }
        Insert: {
          code: string
          country_code?: string | null
          created_at?: string
          currency_code: string
          default_locale: string
          enabled?: boolean
          id?: string
          name: string
          primary_domain: string
          settings?: Json
          supported_locales?: Json
          timezone: string
          updated_at?: string
        }
        Update: {
          code?: string
          country_code?: string | null
          created_at?: string
          currency_code?: string
          default_locale?: string
          enabled?: boolean
          id?: string
          name?: string
          primary_domain?: string
          settings?: Json
          supported_locales?: Json
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_deliveries: {
        Row: {
          attempt_count: number
          channel: string
          created_at: string
          id: string
          idempotency_key: string
          last_error: string | null
          order_id: string | null
          provider: string
          provider_reference: string | null
          recipient_hash: string
          sent_at: string | null
          status: string
          template_key: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          channel: string
          created_at?: string
          id?: string
          idempotency_key: string
          last_error?: string | null
          order_id?: string | null
          provider: string
          provider_reference?: string | null
          recipient_hash: string
          sent_at?: string | null
          status?: string
          template_key: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          channel?: string
          created_at?: string
          id?: string
          idempotency_key?: string
          last_error?: string | null
          order_id?: string | null
          provider?: string
          provider_reference?: string | null
          recipient_hash?: string
          sent_at?: string | null
          status?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_incidents: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string
          id: string
          market_id: string | null
          opened_by: string | null
          resolved_at: string | null
          severity: string
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          market_id?: string | null
          opened_by?: string | null
          resolved_at?: string | null
          severity: string
          source?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string
          id?: string
          market_id?: string | null
          opened_by?: string | null
          resolved_at?: string | null
          severity?: string
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_incidents_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      order_internal_notes: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          order_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          order_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_internal_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total_kurus: number | null
          order_id: string
          product_id: string
          product_name: string
          product_slug: string
          quantity: number
          stage: string | null
          unit_price_kurus: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_kurus?: number | null
          order_id: string
          product_id: string
          product_name: string
          product_slug: string
          quantity: number
          stage?: string | null
          unit_price_kurus?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          line_total_kurus?: number | null
          order_id?: string
          product_id?: string
          product_name?: string
          product_slug?: string
          quantity?: number
          stage?: string | null
          unit_price_kurus?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_service_requests: {
        Row: {
          created_at: string
          id: string
          order_id: string
          reason: string
          request_type: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          reason: string
          request_type: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          reason?: string
          request_type?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_service_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          from_status:
            | Database["public"]["Enums"]["commerce_order_status"]
            | null
          id: number
          metadata: Json
          order_id: string
          reason: string | null
          to_status: Database["public"]["Enums"]["commerce_order_status"]
        }
        Insert: {
          actor_id?: string | null
          actor_type: string
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["commerce_order_status"]
            | null
          id?: never
          metadata?: Json
          order_id: string
          reason?: string | null
          to_status: Database["public"]["Enums"]["commerce_order_status"]
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          from_status?:
            | Database["public"]["Enums"]["commerce_order_status"]
            | null
          id?: never
          metadata?: Json
          order_id?: string
          reason?: string | null
          to_status?: Database["public"]["Enums"]["commerce_order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_line: string
          city: string
          created_at: string
          district: string
          email: string
          full_name: string
          id: string
          item_count: number
          note: string | null
          order_number: string
          payment_method_id: string
          payment_method_title: string
          phone: string
          shipping_kurus: number | null
          shipping_option_id: string
          shipping_option_title: string
          status: string
          subtotal_kurus: number | null
          total_kurus: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line: string
          city: string
          created_at?: string
          district: string
          email: string
          full_name: string
          id?: string
          item_count?: number
          note?: string | null
          order_number: string
          payment_method_id: string
          payment_method_title: string
          phone: string
          shipping_kurus?: number | null
          shipping_option_id: string
          shipping_option_title: string
          status?: string
          subtotal_kurus?: number | null
          total_kurus?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line?: string
          city?: string
          created_at?: string
          district?: string
          email?: string
          full_name?: string
          id?: string
          item_count?: number
          note?: string | null
          order_number?: string
          payment_method_id?: string
          payment_method_title?: string
          phone?: string
          shipping_kurus?: number | null
          shipping_option_id?: string
          shipping_option_title?: string
          status?: string
          subtotal_kurus?: number | null
          total_kurus?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      outbox_events: {
        Row: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          available_at: string
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          payload: Json
          processed_at: string | null
          status: string
        }
        Insert: {
          aggregate_id: string
          aggregate_type: string
          attempt_count?: number
          available_at?: string
          created_at?: string
          event_type: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          payload: Json
          processed_at?: string | null
          status?: string
        }
        Update: {
          aggregate_id?: string
          aggregate_type?: string
          attempt_count?: number
          available_at?: string
          created_at?: string
          event_type?: string
          id?: string
          last_error?: string | null
          locked_at?: string | null
          locked_by?: string | null
          payload?: Json
          processed_at?: string | null
          status?: string
        }
        Relationships: []
      }
      payment_attempts: {
        Row: {
          amount_minor: number
          created_at: string
          currency_code: string
          failure_code: string | null
          failure_message: string | null
          id: string
          idempotency_key: string
          order_id: string
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["commerce_payment_status"]
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          currency_code: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          idempotency_key: string
          order_id: string
          provider: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["commerce_payment_status"]
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          currency_code?: string
          failure_code?: string | null
          failure_message?: string | null
          id?: string
          idempotency_key?: string
          order_id?: string
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["commerce_payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_settings: {
        Row: {
          admin_note: string | null
          created_at: string
          direct_sale_enabled: boolean
          id: string
          ingredients: string[]
          price_kurus: number | null
          slug: string
          stock: string
          updated_at: string
          updated_by: string | null
          weight: string | null
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          direct_sale_enabled?: boolean
          id?: string
          ingredients?: string[]
          price_kurus?: number | null
          slug: string
          stock?: string
          updated_at?: string
          updated_by?: string | null
          weight?: string | null
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          direct_sale_enabled?: boolean
          id?: string
          ingredients?: string[]
          price_kurus?: number | null
          slug?: string
          stock?: string
          updated_at?: string
          updated_by?: string | null
          weight?: string | null
        }
        Relationships: []
      }
      promotion_codes: {
        Row: {
          active: boolean
          code: string
          created_at: string
          created_by: string | null
          discount_type: string
          discount_value: number
          ends_at: string
          id: string
          market_id: string
          maximum_discount_minor: number | null
          minimum_subtotal_minor: number
          name: string
          per_customer_limit: number
          starts_at: string
          total_usage_limit: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          created_by?: string | null
          discount_type: string
          discount_value: number
          ends_at: string
          id?: string
          market_id: string
          maximum_discount_minor?: number | null
          minimum_subtotal_minor?: number
          name: string
          per_customer_limit?: number
          starts_at: string
          total_usage_limit?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          created_by?: string | null
          discount_type?: string
          discount_value?: number
          ends_at?: string
          id?: string
          market_id?: string
          maximum_discount_minor?: number | null
          minimum_subtotal_minor?: number
          name?: string
          per_customer_limit?: number
          starts_at?: string
          total_usage_limit?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_codes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_redemptions: {
        Row: {
          created_at: string
          customer_email: string
          discount_minor: number
          id: string
          order_id: string
          promotion_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          discount_minor: number
          id?: string
          order_id: string
          promotion_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          discount_minor?: number
          id?: string
          order_id?: string
          promotion_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_redemptions_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotion_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limit_buckets: {
        Row: {
          expires_at: string
          request_count: number
          scope: string
          subject_hash: string
          window_started_at: string
        }
        Insert: {
          expires_at: string
          request_count?: number
          scope: string
          subject_hash: string
          window_started_at: string
        }
        Update: {
          expires_at?: string
          request_count?: number
          scope?: string
          subject_hash?: string
          window_started_at?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount_minor: number
          created_at: string
          id: string
          idempotency_key: string
          payment_attempt_id: string
          provider_reference: string | null
          reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_minor: number
          created_at?: string
          id?: string
          idempotency_key: string
          payment_attempt_id: string
          provider_reference?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_minor?: number
          created_at?: string
          id?: string
          idempotency_key?: string
          payment_attempt_id?: string
          provider_reference?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_payment_attempt_id_fkey"
            columns: ["payment_attempt_id"]
            isOneToOne: false
            referencedRelation: "payment_attempts"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          created_at: string
          id: string
          occurred_at: string
          order_number: string
          payload: Json | null
          provider_key: string
          status: string
          status_detail: string | null
          tracking_number: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          occurred_at?: string
          order_number: string
          payload?: Json | null
          provider_key: string
          status: string
          status_detail?: string | null
          tracking_number?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          occurred_at?: string
          order_number?: string
          payload?: Json | null
          provider_key?: string
          status?: string
          status_detail?: string | null
          tracking_number?: string | null
        }
        Relationships: []
      }
      shipments: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          idempotency_key: string
          label_reference: string | null
          order_id: string
          provider: string
          provider_reference: string | null
          service_code: string
          shipped_at: string | null
          status: Database["public"]["Enums"]["commerce_shipment_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          idempotency_key: string
          label_reference?: string | null
          order_id: string
          provider: string
          provider_reference?: string | null
          service_code: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["commerce_shipment_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          idempotency_key?: string
          label_reference?: string | null
          order_id?: string
          provider?: string
          provider_reference?: string | null
          service_code?: string
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["commerce_shipment_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_memberships: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string | null
          staff_role: Database["public"]["Enums"]["staff_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          staff_role: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          staff_role?: Database["public"]["Enums"]["staff_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      staff_role_permissions: {
        Row: {
          created_at: string
          permission: string
          staff_role: Database["public"]["Enums"]["staff_role"]
        }
        Insert: {
          created_at?: string
          permission: string
          staff_role: Database["public"]["Enums"]["staff_role"]
        }
        Update: {
          created_at?: string
          permission?: string
          staff_role?: Database["public"]["Enums"]["staff_role"]
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          author_id: string
          author_type: string
          body: string
          created_at: string
          id: string
          internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          author_type: string
          body: string
          created_at?: string
          id?: string
          internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          author_type?: string
          body?: string
          created_at?: string
          id?: string
          internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          market_id: string
          order_id: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          id?: string
          market_id: string
          order_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          market_id?: string
          order_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "commerce_orders"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      warehouses: {
        Row: {
          active: boolean
          address: Json
          code: string
          created_at: string
          id: string
          market_id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: Json
          code: string
          created_at?: string
          id?: string
          market_id: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: Json
          code?: string
          created_at?: string
          id?: string
          market_id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouses_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempt_count: number
          event_type: string
          id: string
          last_error: string | null
          payload: Json
          processed_at: string | null
          processing_status: string
          provider: string
          provider_event_id: string
          received_at: string
          signature_valid: boolean
        }
        Insert: {
          attempt_count?: number
          event_type: string
          id?: string
          last_error?: string | null
          payload: Json
          processed_at?: string | null
          processing_status?: string
          provider: string
          provider_event_id: string
          received_at?: string
          signature_valid?: boolean
        }
        Update: {
          attempt_count?: number
          event_type?: string
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          processing_status?: string
          provider?: string
          provider_event_id?: string
          received_at?: string
          signature_valid?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_inventory: {
        Args: {
          p_actor_id: string
          p_idempotency_key: string
          p_quantity_delta: number
          p_reason: string
          p_variant_id: string
          p_warehouse_id: string
        }
        Returns: Json
      }
      admin_dashboard_summary: {
        Args: { p_actor_id: string; p_market_code?: string }
        Returns: Json
      }
      admin_get_customer_360: {
        Args: { p_actor_id: string; p_user_id: string }
        Returns: Json
      }
      admin_get_order: {
        Args: { p_actor_id: string; p_order_number: string }
        Returns: Json
      }
      admin_get_reports: {
        Args: {
          p_actor_id: string
          p_from_date?: string
          p_market_code?: string
          p_to_date?: string
        }
        Returns: Json
      }
      admin_get_staff_access: { Args: { p_actor_id: string }; Returns: Json }
      admin_launch_readiness: {
        Args: { p_actor_id: string; p_market_code?: string }
        Returns: Json
      }
      admin_list_content: {
        Args: { p_actor_id: string; p_market_code?: string }
        Returns: Json
      }
      admin_list_incidents: {
        Args: { p_actor_id: string; p_market_code?: string }
        Returns: Json
      }
      admin_list_inventory: {
        Args: { p_actor_id: string; p_market_code?: string }
        Returns: Json
      }
      admin_list_inventory_movements: {
        Args: {
          p_actor_id: string
          p_limit?: number
          p_market_code?: string
          p_query?: string
        }
        Returns: Json
      }
      admin_list_markets: { Args: { p_actor_id: string }; Returns: Json }
      admin_list_order_requests: {
        Args: { p_actor_id: string; p_status?: string }
        Returns: Json
      }
      admin_list_promotions: {
        Args: { p_actor_id: string; p_market_code?: string }
        Returns: Json
      }
      admin_list_support_tickets: {
        Args: { p_actor_id: string; p_query?: string; p_status?: string }
        Returns: Json
      }
      admin_operational_health: { Args: { p_actor_id: string }; Returns: Json }
      admin_record_inventory_operation: {
        Args: {
          p_actor_id: string
          p_idempotency_key: string
          p_operation_type: string
          p_quantity: number
          p_reason: string
          p_reorder_point: number
          p_variant_id: string
          p_warehouse_id: string
        }
        Returns: Json
      }
      admin_resolve_order_request: {
        Args: {
          p_actor_id: string
          p_request_id: string
          p_resolution_note: string
          p_status: string
        }
        Returns: undefined
      }
      admin_retry_outbox_event: {
        Args: { p_actor_id: string; p_event_id: string }
        Returns: undefined
      }
      admin_save_content: {
        Args: {
          p_actor_id: string
          p_body: string
          p_canonical_path: string
          p_category: string
          p_content_type: string
          p_cover_image_url: string
          p_excerpt: string
          p_id: string
          p_locale: string
          p_market_code: string
          p_seo_description: string
          p_seo_title: string
          p_slug: string
          p_status: string
          p_title: string
        }
        Returns: string
      }
      admin_save_incident: {
        Args: {
          p_actor_id: string
          p_description: string
          p_incident_id: string
          p_market_code: string
          p_note?: string
          p_severity: string
          p_status: string
          p_title: string
        }
        Returns: string
      }
      admin_search_customers: {
        Args: {
          p_actor_id: string
          p_limit?: number
          p_offset?: number
          p_query?: string
        }
        Returns: Json
      }
      admin_search_orders: {
        Args: {
          p_actor_id: string
          p_limit?: number
          p_market_code?: string
          p_offset?: number
          p_query?: string
          p_status?: string
        }
        Returns: Json
      }
      admin_set_checkout_enabled: {
        Args: { p_actor_id: string; p_enabled: boolean; p_market_code: string }
        Returns: Json
      }
      admin_set_staff_role: {
        Args: {
          p_active: boolean
          p_actor_id: string
          p_staff_role: Database["public"]["Enums"]["staff_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      admin_set_user_role: {
        Args: {
          p_actor_id: string
          p_enabled: boolean
          p_role: Database["public"]["Enums"]["app_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      admin_update_market: {
        Args: {
          p_actor_id: string
          p_default_locale: string
          p_domain: string
          p_enabled: boolean
          p_market_code: string
          p_name: string
          p_supported_locales: Json
          p_timezone: string
        }
        Returns: undefined
      }
      admin_update_order_workflow: {
        Args: {
          p_actor_id: string
          p_assigned_to?: string
          p_assignment_action?: string
          p_next_status?: Database["public"]["Enums"]["commerce_order_status"]
          p_note?: string
          p_order_number: string
        }
        Returns: undefined
      }
      admin_update_support_ticket: {
        Args: {
          p_actor_id: string
          p_assigned_to: string
          p_internal?: boolean
          p_message: string
          p_priority: string
          p_status: string
          p_ticket_id: string
        }
        Returns: undefined
      }
      admin_upsert_promotion: {
        Args: {
          p_active: boolean
          p_actor_id: string
          p_code: string
          p_discount_type: string
          p_discount_value: number
          p_ends_at: string
          p_id: string
          p_market_code: string
          p_maximum_discount_minor: number
          p_minimum_subtotal_minor: number
          p_name: string
          p_per_customer_limit: number
          p_starts_at: string
          p_total_usage_limit: number
        }
        Returns: string
      }
      apply_verified_payment_event: {
        Args: {
          p_amount_minor: number
          p_currency_code: string
          p_event_type: string
          p_payload: Json
          p_payment_status: string
          p_provider: string
          p_provider_event_id: string
          p_provider_reference: string
        }
        Returns: Json
      }
      attach_payment_provider_reference: {
        Args: { p_attempt_id: string; p_provider_reference: string }
        Returns: undefined
      }
      claim_outbox_events: {
        Args: {
          p_lease_seconds?: number
          p_limit?: number
          p_worker_id: string
        }
        Returns: {
          aggregate_id: string
          aggregate_type: string
          attempt_count: number
          available_at: string
          created_at: string
          event_type: string
          id: string
          last_error: string | null
          locked_at: string | null
          locked_by: string | null
          payload: Json
          processed_at: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "outbox_events"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      consume_rate_limit: {
        Args: {
          p_limit: number
          p_scope: string
          p_subject_hash: string
          p_window_seconds: number
        }
        Returns: Json
      }
      create_commerce_checkout: {
        Args: {
          p_billing_address: Json
          p_customer_email: string
          p_customer_note?: string
          p_customer_phone: string
          p_idempotency_key: string
          p_items: Json
          p_market_code: string
          p_privacy_version: string
          p_shipping_address: Json
          p_terms_version: string
          p_user_id: string
        }
        Returns: Json
      }
      create_payment_attempt: {
        Args: {
          p_idempotency_key: string
          p_order_id: string
          p_provider: string
        }
        Returns: Json
      }
      current_user_has_permission: {
        Args: { p_permission: string }
        Returns: boolean
      }
      customer_create_order_request: {
        Args: {
          p_order_number: string
          p_reason: string
          p_request_type: string
          p_user_id: string
        }
        Returns: string
      }
      customer_create_support_ticket: {
        Args: {
          p_body: string
          p_category: string
          p_order_number?: string
          p_subject: string
          p_user_id: string
        }
        Returns: string
      }
      customer_delete_address: {
        Args: { p_address_id: string; p_user_id: string }
        Returns: undefined
      }
      customer_get_account: { Args: { p_user_id: string }; Returns: Json }
      customer_get_commerce_order: {
        Args: { p_order_number: string; p_user_id: string }
        Returns: Json
      }
      customer_list_commerce_orders: {
        Args: { p_user_id: string }
        Returns: Json
      }
      customer_list_order_requests: {
        Args: { p_order_number: string; p_user_id: string }
        Returns: Json
      }
      customer_list_support_tickets: {
        Args: { p_user_id: string }
        Returns: Json
      }
      customer_reply_support_ticket: {
        Args: { p_body: string; p_ticket_number: string; p_user_id: string }
        Returns: undefined
      }
      customer_save_address: {
        Args: {
          p_address: Json
          p_address_id: string
          p_is_default: boolean
          p_label: string
          p_phone: string
          p_recipient_name: string
          p_user_id: string
        }
        Returns: string
      }
      customer_upsert_profile: {
        Args: { p_full_name: string; p_phone: string; p_user_id: string }
        Returns: undefined
      }
      defer_outbox_event: {
        Args: {
          p_event_id: string
          p_reason: string
          p_retry_after_seconds?: number
          p_worker_id: string
        }
        Returns: undefined
      }
      finish_outbox_event: {
        Args: {
          p_error?: string
          p_event_id: string
          p_success: boolean
          p_worker_id: string
        }
        Returns: undefined
      }
      has_permission: {
        Args: { p_permission: string; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_support_ticket_number: { Args: never; Returns: string }
      quote_promotion: {
        Args: {
          p_code: string
          p_customer_email?: string
          p_market_code: string
          p_subtotal_minor: number
        }
        Returns: Json
      }
      record_cookie_consent: {
        Args: {
          p_anonymous_id: string
          p_choice: string
          p_policy_version: string
        }
        Returns: undefined
      }
      release_expired_inventory_reservations: {
        Args: { p_limit?: number }
        Returns: number
      }
      request_marketing_subscription: {
        Args: {
          p_consent_version: string
          p_email: string
          p_market_code: string
        }
        Returns: undefined
      }
      request_order_fulfilment: {
        Args: {
          p_actor_id: string
          p_idempotency_key: string
          p_order_id: string
          p_provider: string
          p_service_code: string
        }
        Returns: Json
      }
      request_order_invoice: {
        Args: { p_actor_id: string; p_order_id: string; p_provider: string }
        Returns: Json
      }
      request_payment_refund: {
        Args: {
          p_actor_id: string
          p_amount_minor: number
          p_idempotency_key: string
          p_order_id: string
          p_reason: string
        }
        Returns: Json
      }
      run_commerce_maintenance: {
        Args: { p_idempotency_batch?: number; p_rate_limit_batch?: number }
        Returns: Json
      }
      track_commerce_order: {
        Args: { p_email: string; p_order_number: string; p_phone_last4: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
      commerce_invoice_status:
        | "queued"
        | "issued"
        | "failed"
        | "cancelled"
        | "credited"
      commerce_order_status:
        | "draft"
        | "awaiting_payment"
        | "payment_processing"
        | "paid"
        | "fulfilment_pending"
        | "fulfilled"
        | "cancelled"
        | "refunded"
        | "failed"
      commerce_payment_status:
        | "created"
        | "pending"
        | "requires_action"
        | "authorized"
        | "captured"
        | "failed"
        | "cancelled"
        | "partially_refunded"
        | "refunded"
      commerce_reservation_status:
        | "active"
        | "consumed"
        | "released"
        | "expired"
      commerce_shipment_status:
        | "pending"
        | "ready"
        | "shipped"
        | "in_transit"
        | "delivered"
        | "exception"
        | "cancelled"
        | "returned"
      staff_role:
        | "owner"
        | "general_manager"
        | "store_manager"
        | "order_agent"
        | "warehouse_agent"
        | "customer_support"
        | "accountant"
        | "content_manager"
        | "compliance_officer"
        | "system_admin"
        | "report_viewer"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "editor", "user"],
      commerce_invoice_status: [
        "queued",
        "issued",
        "failed",
        "cancelled",
        "credited",
      ],
      commerce_order_status: [
        "draft",
        "awaiting_payment",
        "payment_processing",
        "paid",
        "fulfilment_pending",
        "fulfilled",
        "cancelled",
        "refunded",
        "failed",
      ],
      commerce_payment_status: [
        "created",
        "pending",
        "requires_action",
        "authorized",
        "captured",
        "failed",
        "cancelled",
        "partially_refunded",
        "refunded",
      ],
      commerce_reservation_status: [
        "active",
        "consumed",
        "released",
        "expired",
      ],
      commerce_shipment_status: [
        "pending",
        "ready",
        "shipped",
        "in_transit",
        "delivered",
        "exception",
        "cancelled",
        "returned",
      ],
      staff_role: [
        "owner",
        "general_manager",
        "store_manager",
        "order_agent",
        "warehouse_agent",
        "customer_support",
        "accountant",
        "content_manager",
        "compliance_officer",
        "system_admin",
        "report_viewer",
      ],
    },
  },
} as const
