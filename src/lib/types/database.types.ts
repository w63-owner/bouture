export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          address_street: string | null;
          address_city: string | null;
          address_postal: string | null;
          address_country: string | null;
          address_lat: number | null;
          address_lng: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          bio?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          address_postal?: string | null;
          address_country?: string | null;
          address_lat?: number | null;
          address_lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          address_street?: string | null;
          address_city?: string | null;
          address_postal?: string | null;
          address_country?: string | null;
          address_lat?: number | null;
          address_lng?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      species: {
        Row: {
          id: number;
          common_name: string;
          scientific_name: string | null;
          family: string | null;
          illustration_url: string | null;
          visual_category: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          common_name: string;
          scientific_name?: string | null;
          family?: string | null;
          illustration_url?: string | null;
          visual_category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          common_name?: string;
          scientific_name?: string | null;
          family?: string | null;
          illustration_url?: string | null;
          visual_category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      plant_library: {
        Row: {
          id: string;
          user_id: string;
          species_name: string;
          species_id: number | null;
          photos: string[];
          notes: string | null;
          status: Database["public"]["Enums"]["plant_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          species_name: string;
          species_id?: number | null;
          photos: string[];
          notes?: string | null;
          status?: Database["public"]["Enums"]["plant_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          species_name?: string;
          species_id?: number | null;
          photos?: string[];
          notes?: string | null;
          status?: Database["public"]["Enums"]["plant_status"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_library_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plant_library_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
        ];
      };
      listings: {
        Row: {
          id: string;
          donor_id: string;
          species_name: string;
          species_id: number | null;
          size: Database["public"]["Enums"]["listing_size"];
          description: string | null;
          photos: string[];
          location_exact: unknown;
          location_public: unknown;
          address_city: string | null;
          is_active: boolean;
          plant_library_id: string | null;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          species_name: string;
          species_id?: number | null;
          size: Database["public"]["Enums"]["listing_size"];
          description?: string | null;
          photos: string[];
          location_exact: unknown;
          location_public: unknown;
          address_city?: string | null;
          is_active?: boolean;
          plant_library_id?: string | null;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          species_name?: string;
          species_id?: number | null;
          size?: Database["public"]["Enums"]["listing_size"];
          description?: string | null;
          photos?: string[];
          location_exact?: unknown;
          location_public?: unknown;
          address_city?: string | null;
          is_active?: boolean;
          plant_library_id?: string | null;
          transaction_type?: Database["public"]["Enums"]["transaction_type"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_donor_id_fkey";
            columns: ["donor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_species_id_fkey";
            columns: ["species_id"];
            isOneToOne: false;
            referencedRelation: "species";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listings_plant_library_id_fkey";
            columns: ["plant_library_id"];
            isOneToOne: false;
            referencedRelation: "plant_library";
            referencedColumns: ["id"];
          },
        ];
      };
      conversations: {
        Row: {
          id: string;
          participant_a: string;
          participant_b: string;
          listing_id: string | null;
          last_message_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          participant_a: string;
          participant_b: string;
          listing_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          participant_a?: string;
          participant_b?: string;
          listing_id?: string | null;
          last_message_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_participant_a_fkey";
            columns: ["participant_a"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_participant_b_fkey";
            columns: ["participant_b"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          type: Database["public"]["Enums"]["message_type"];
          image_url: string | null;
          metadata: Record<string, unknown> | null;
          status: Database["public"]["Enums"]["message_status"];
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          type?: Database["public"]["Enums"]["message_type"];
          image_url?: string | null;
          metadata?: Record<string, unknown> | null;
          status?: Database["public"]["Enums"]["message_status"];
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string | null;
          type?: Database["public"]["Enums"]["message_type"];
          image_url?: string | null;
          metadata?: Record<string, unknown> | null;
          status?: Database["public"]["Enums"]["message_status"];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          keys_p256dh: string;
          keys_auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          keys_p256dh?: string;
          keys_auth?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      transactions: {
        Row: {
          id: string;
          giver_id: string;
          receiver_id: string;
          listing_id: string;
          offered_listing_id: string | null;
          conversation_id: string | null;
          status: Database["public"]["Enums"]["transaction_status"];
          giver_confirmed_at: string | null;
          receiver_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          giver_id: string;
          receiver_id: string;
          listing_id: string;
          offered_listing_id?: string | null;
          conversation_id?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          giver_confirmed_at?: string | null;
          receiver_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          giver_id?: string;
          receiver_id?: string;
          listing_id?: string;
          offered_listing_id?: string | null;
          conversation_id?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"];
          giver_confirmed_at?: string | null;
          receiver_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_giver_id_fkey";
            columns: ["giver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_receiver_id_fkey";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_offered_listing_id_fkey";
            columns: ["offered_listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_listings_in_bounds: {
        Args: {
          north: number;
          south: number;
          east: number;
          west: number;
          filter_species?: string[] | null;
          filter_sizes?:
            | Database["public"]["Enums"]["listing_size"][]
            | null;
          filter_radius_km?: number | null;
          center_lat?: number | null;
          center_lng?: number | null;
          p_species_id?: number | null;
        };
        Returns: {
          id: string;
          donor_id: string;
          species_name: string;
          size: Database["public"]["Enums"]["listing_size"];
          description: string | null;
          photos: string[];
          lat: number;
          lng: number;
          address_city: string | null;
          donor_username: string;
          donor_avatar: string | null;
          created_at: string;
          transaction_type: Database["public"]["Enums"]["transaction_type"];
        }[];
      };
      get_or_create_conversation: {
        Args: {
          other_user_id: string;
          for_listing_id: string;
        };
        Returns: string;
      };
      get_user_conversations: {
        Args: Record<PropertyKey, never>;
        Returns: {
          conversation_id: string;
          listing_id: string | null;
          listing_species: string | null;
          listing_photo: string | null;
          listing_size:
            | Database["public"]["Enums"]["listing_size"]
            | null;
          other_user_id: string;
          other_username: string | null;
          other_avatar: string | null;
          last_message_content: string | null;
          last_message_type:
            | Database["public"]["Enums"]["message_type"]
            | null;
          last_message_at: string | null;
          unread_count: number;
        }[];
      };
    };
    Enums: {
      listing_size:
        | "graine"
        | "tubercule"
        | "xs"
        | "s"
        | "m"
        | "l"
        | "xl"
        | "xxl";
      message_type: "text" | "image" | "exchange_proposal";
      message_status: "sending" | "sent" | "delivered" | "read";
      plant_status: "collection" | "for_donation" | "donated";
      transaction_type: "don_uniquement" | "echange_uniquement" | "les_deux";
      transaction_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "cancelled"
        | "giver_confirmed"
        | "receiver_confirmed"
        | "completed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
