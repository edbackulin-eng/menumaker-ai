export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string;
          admin_id: string;
          created_at: string;
          details: Json;
          id: string;
          target_user_id: string | null;
        };
        Insert: {
          action: string;
          admin_id: string;
          created_at?: string;
          details?: Json;
          id?: string;
          target_user_id?: string | null;
        };
        Update: {
          action?: string;
          admin_id?: string;
          created_at?: string;
          details?: Json;
          id?: string;
          target_user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_admin_id_fkey";
            columns: ["admin_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "admin_audit_log_target_user_id_fkey";
            columns: ["target_user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      api_rate_limits: {
        Row: {
          key: string;
          request_count: number;
          updated_at: string;
          window_start: string;
        };
        Insert: {
          key: string;
          request_count?: number;
          updated_at?: string;
          window_start?: string;
        };
        Update: {
          key?: string;
          request_count?: number;
          updated_at?: string;
          window_start?: string;
        };
        Relationships: [];
      };
      auth_rate_limits: {
        Row: {
          attempt_count: number;
          first_attempt_at: string;
          key: string;
          locked_until: string | null;
          updated_at: string;
        };
        Insert: {
          attempt_count?: number;
          first_attempt_at?: string;
          key: string;
          locked_until?: string | null;
          updated_at?: string;
        };
        Update: {
          attempt_count?: number;
          first_attempt_at?: string;
          key?: string;
          locked_until?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      credit_costs: {
        Row: {
          action_type: string;
          cost: number;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          action_type: string;
          cost: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          action_type?: string;
          cost?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      credits_balance: {
        Row: {
          balance: number;
          free_menus_used: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          free_menus_used?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          free_menus_used?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credits_balance_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      credits_transactions: {
        Row: {
          amount: number;
          created_at: string;
          description: string | null;
          id: string;
          related_menu_id: string | null;
          type: Database["public"]["Enums"]["credit_transaction_type"];
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          related_menu_id?: string | null;
          type: Database["public"]["Enums"]["credit_transaction_type"];
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          description?: string | null;
          id?: string;
          related_menu_id?: string | null;
          type?: Database["public"]["Enums"]["credit_transaction_type"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credits_transactions_related_menu_id_fkey";
            columns: ["related_menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "credits_transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dish_photos: {
        Row: {
          attribution_name: string | null;
          attribution_url: string | null;
          candidates: Json | null;
          created_at: string;
          external_id: string | null;
          height: number | null;
          id: string;
          photo_url: string;
          provider: string;
          query_normalized: string;
          thumb_url: string;
          updated_at: string;
          width: number | null;
        };
        Insert: {
          attribution_name?: string | null;
          attribution_url?: string | null;
          candidates?: Json | null;
          created_at?: string;
          external_id?: string | null;
          height?: number | null;
          id?: string;
          photo_url: string;
          provider: string;
          query_normalized: string;
          thumb_url: string;
          updated_at?: string;
          width?: number | null;
        };
        Update: {
          attribution_name?: string | null;
          attribution_url?: string | null;
          candidates?: Json | null;
          created_at?: string;
          external_id?: string | null;
          height?: number | null;
          id?: string;
          photo_url?: string;
          provider?: string;
          query_normalized?: string;
          thumb_url?: string;
          updated_at?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      menu_exports: {
        Row: {
          created_at: string;
          export_type: Database["public"]["Enums"]["menu_export_type"];
          file_url: string | null;
          id: string;
          menu_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          export_type: Database["public"]["Enums"]["menu_export_type"];
          file_url?: string | null;
          id?: string;
          menu_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          export_type?: Database["public"]["Enums"]["menu_export_type"];
          file_url?: string | null;
          id?: string;
          menu_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_exports_menu_id_fkey";
            columns: ["menu_id"];
            isOneToOne: false;
            referencedRelation: "menus";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_exports_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_templates: {
        Row: {
          business_types: string[];
          category: string;
          config: Json;
          created_at: string;
          engine: string;
          id: string;
          is_active: boolean;
          name: Json;
          palette: Json | null;
          photo_policy: Json | null;
          preview_image_url: string | null;
          slug: string;
          sort_order: number;
          typography: Json | null;
          updated_at: string;
        };
        Insert: {
          business_types?: string[];
          category: string;
          config?: Json;
          created_at?: string;
          engine?: string;
          id?: string;
          is_active?: boolean;
          name?: Json;
          palette?: Json | null;
          photo_policy?: Json | null;
          preview_image_url?: string | null;
          slug: string;
          sort_order?: number;
          typography?: Json | null;
          updated_at?: string;
        };
        Update: {
          business_types?: string[];
          category?: string;
          config?: Json;
          created_at?: string;
          engine?: string;
          id?: string;
          is_active?: boolean;
          name?: Json;
          palette?: Json | null;
          photo_policy?: Json | null;
          preview_image_url?: string | null;
          slug?: string;
          sort_order?: number;
          typography?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      menus: {
        Row: {
          business_type: string | null;
          content: Json;
          content_confirmed_at: string | null;
          created_at: string;
          id: string;
          is_public: boolean;
          locale: string;
          original_file_url: string | null;
          public_slug: string | null;
          source_type: Database["public"]["Enums"]["menu_source_type"];
          status: Database["public"]["Enums"]["menu_status"];
          style_overrides: Json;
          template_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          business_type?: string | null;
          content?: Json;
          content_confirmed_at?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          locale?: string;
          original_file_url?: string | null;
          public_slug?: string | null;
          source_type?: Database["public"]["Enums"]["menu_source_type"];
          status?: Database["public"]["Enums"]["menu_status"];
          style_overrides?: Json;
          template_id?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          business_type?: string | null;
          content?: Json;
          content_confirmed_at?: string | null;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          locale?: string;
          original_file_url?: string | null;
          public_slug?: string | null;
          source_type?: Database["public"]["Enums"]["menu_source_type"];
          status?: Database["public"]["Enums"]["menu_status"];
          style_overrides?: Json;
          template_id?: string | null;
          title?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menus_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "menu_templates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menus_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          created_at: string;
          credits_purchased: number;
          currency: string;
          id: string;
          status: Database["public"]["Enums"]["payment_status"];
          stripe_checkout_session_id: string | null;
          stripe_payment_id: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string;
          credits_purchased: number;
          currency?: string;
          id?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          stripe_checkout_session_id?: string | null;
          stripe_payment_id?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          credits_purchased?: number;
          currency?: string;
          id?: string;
          status?: Database["public"]["Enums"]["payment_status"];
          stripe_checkout_session_id?: string | null;
          stripe_payment_id?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          locale: string;
          role: Database["public"]["Enums"]["user_role"];
          subscription_expires_at: string | null;
          subscription_status: string | null;
          subscription_tier: string | null;
          terms_accepted_at: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          locale?: string;
          role?: Database["public"]["Enums"]["user_role"];
          subscription_expires_at?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          locale?: string;
          role?: Database["public"]["Enums"]["user_role"];
          subscription_expires_at?: string | null;
          subscription_status?: string | null;
          subscription_tier?: string | null;
          terms_accepted_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_change_user_role: {
        Args: {
          p_admin_id: string;
          p_new_role: Database["public"]["Enums"]["user_role"];
          p_target_user_id: string;
        };
        Returns: {
          new_role: Database["public"]["Enums"]["user_role"];
          old_role: Database["public"]["Enums"]["user_role"];
        }[];
      };
      admin_credits_breakdown: {
        Args: never;
        Returns: {
          total_amount: number;
          transaction_count: number;
          type: Database["public"]["Enums"]["credit_transaction_type"];
        }[];
      };
      admin_daily_activity: {
        Args: { p_days?: number };
        Returns: {
          day: string;
          new_menus: number;
          new_users: number;
        }[];
      };
      admin_dashboard_stats: {
        Args: never;
        Returns: {
          conversion_pct: number;
          free_trials_used: number;
          new_users_month: number;
          new_users_today: number;
          new_users_week: number;
          total_menus: number;
          total_users: number;
        }[];
      };
      admin_grant_credits: {
        Args: {
          p_admin_id: string;
          p_amount: number;
          p_reason: string;
          p_target_user_id: string;
        };
        Returns: {
          new_balance: number;
        }[];
      };
      admin_list_menus: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_status?: Database["public"]["Enums"]["menu_status"];
        };
        Returns: {
          created_at: string;
          id: string;
          owner_email: string;
          status: Database["public"]["Enums"]["menu_status"];
          template_id: string;
          template_name: Json;
          title: string;
          total_count: number;
        }[];
      };
      admin_list_users: {
        Args: {
          p_limit?: number;
          p_offset?: number;
          p_role?: Database["public"]["Enums"]["user_role"];
          p_search?: string;
        };
        Returns: {
          created_at: string;
          credits_balance: number;
          email: string;
          free_menus_used: number;
          full_name: string;
          id: string;
          menu_count: number;
          role: Database["public"]["Enums"]["user_role"];
          total_count: number;
        }[];
      };
      admin_locale_breakdown: {
        Args: never;
        Returns: {
          locale: string;
          user_count: number;
        }[];
      };
      admin_registration_source_breakdown: {
        Args: never;
        Returns: {
          provider: string;
          user_count: number;
        }[];
      };
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: {
          allowed: boolean;
          remaining: number;
          retry_after_seconds: number;
        }[];
      };
      complete_stripe_payment: {
        Args: {
          p_amount: number;
          p_credits: number;
          p_currency: string;
          p_stripe_checkout_session_id: string;
          p_stripe_payment_id: string;
          p_user_id: string;
        };
        Returns: {
          already_processed: boolean;
          new_balance: number;
        }[];
      };
      consume_menu_creation_credit: {
        Args: {
          p_cost: number;
          p_description: string;
          p_free_limit: number;
          p_related_menu_id: string;
          p_user_id: string;
        };
        Returns: {
          new_balance: number;
          new_free_menus_used: number;
          success: boolean;
          used_free: boolean;
        }[];
      };
      is_admin: { Args: never; Returns: boolean };
      is_login_locked: {
        Args: { p_key: string };
        Returns: {
          locked: boolean;
          retry_after_seconds: number;
        }[];
      };
      record_login_failure: {
        Args: {
          p_key: string;
          p_lockout_seconds?: number;
          p_max_attempts?: number;
          p_window_seconds?: number;
        };
        Returns: {
          attempt_count: number;
          locked_until: string;
        }[];
      };
      record_login_success: { Args: { p_key: string }; Returns: undefined };
      spend_credits: {
        Args: {
          p_amount: number;
          p_description: string;
          p_related_menu_id?: string;
          p_type: Database["public"]["Enums"]["credit_transaction_type"];
          p_user_id: string;
        };
        Returns: {
          new_balance: number;
          success: boolean;
        }[];
      };
    };
    Enums: {
      credit_transaction_type:
        | "purchase"
        | "menu_generation"
        | "menu_translation"
        | "ai_description"
        | "refund"
        | "bonus"
        | "free_tier"
        | "admin_grant";
      menu_export_type: "pdf" | "png" | "web" | "qr";
      menu_source_type: "pdf" | "docx" | "xlsx" | "text" | "manual";
      menu_status: "draft" | "processing" | "completed" | "failed";
      payment_status: "pending" | "completed" | "failed" | "refunded";
      user_role: "user" | "admin";
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      credit_transaction_type: [
        "purchase",
        "menu_generation",
        "menu_translation",
        "ai_description",
        "refund",
        "bonus",
        "free_tier",
        "admin_grant",
      ],
      menu_export_type: ["pdf", "png", "web", "qr"],
      menu_source_type: ["pdf", "docx", "xlsx", "text", "manual"],
      menu_status: ["draft", "processing", "completed", "failed"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["user", "admin"],
    },
  },
} as const;
