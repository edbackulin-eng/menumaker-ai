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
          category: string;
          config: Json;
          created_at: string;
          id: string;
          is_active: boolean;
          name: Json;
          preview_image_url: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          category: string;
          config?: Json;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: Json;
          preview_image_url?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          category?: string;
          config?: Json;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: Json;
          preview_image_url?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      menus: {
        Row: {
          content: Json;
          created_at: string;
          id: string;
          is_public: boolean;
          locale: string;
          original_file_url: string | null;
          public_slug: string | null;
          source_type: Database["public"]["Enums"]["menu_source_type"];
          status: Database["public"]["Enums"]["menu_status"];
          template_id: string | null;
          title: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: Json;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          locale?: string;
          original_file_url?: string | null;
          public_slug?: string | null;
          source_type?: Database["public"]["Enums"]["menu_source_type"];
          status?: Database["public"]["Enums"]["menu_status"];
          template_id?: string | null;
          title: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: Json;
          created_at?: string;
          id?: string;
          is_public?: boolean;
          locale?: string;
          original_file_url?: string | null;
          public_slug?: string | null;
          source_type?: Database["public"]["Enums"]["menu_source_type"];
          status?: Database["public"]["Enums"]["menu_status"];
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
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: {
      credit_transaction_type:
        | "purchase"
        | "menu_generation"
        | "menu_translation"
        | "ai_description"
        | "refund"
        | "bonus"
        | "free_tier";
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
      ],
      menu_export_type: ["pdf", "png", "web", "qr"],
      menu_source_type: ["pdf", "docx", "xlsx", "text", "manual"],
      menu_status: ["draft", "processing", "completed", "failed"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      user_role: ["user", "admin"],
    },
  },
} as const;
