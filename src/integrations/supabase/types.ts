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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          breed: string | null;
          birth_date: string | null;
          weight_lbs: number | null;
          gender: string | null;
          breeding_status: string | null;
          notes: string | null;
          property_id: string | null;
          photo_url: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          breed?: string | null;
          birth_date?: string | null;
          weight_lbs?: number | null;
          gender?: string | null;
          breeding_status?: string | null;
          notes?: string | null;
          property_id?: string | null;
          photo_url?: string | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          breed?: string | null;
          birth_date?: string | null;
          weight_lbs?: number | null;
          gender?: string | null;
          breeding_status?: string | null;
          notes?: string | null;
          property_id?: string | null;
          photo_url?: string | null;
          created_at?: string;
        }
      }
      breeding_events: {
        Row: {
          id: string;
          user_id: string;
          sire_id: string;
          dam_id: string;
          breeding_date: string;
          expected_birth_date: string | null;
          actual_birth_date: string | null;
          offspring_count: number | null;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          sire_id: string;
          dam_id: string;
          breeding_date: string;
          expected_birth_date?: string | null;
          actual_birth_date?: string | null;
          offspring_count?: number | null;
          notes?: string | null;
          status: string;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          sire_id?: string;
          dam_id?: string;
          breeding_date?: string;
          expected_birth_date?: string | null;
          actual_birth_date?: string | null;
          offspring_count?: number | null;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        }
      }
      financial_categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          created_at?: string;
        }
      }
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          type: 'income' | 'expense';
          category_id: string;
          description: string;
          date: string;
          property_id: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          type: 'income' | 'expense';
          category_id: string;
          description: string;
          date: string;
          property_id?: string | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          type?: 'income' | 'expense';
          category_id?: string;
          description?: string;
          date?: string;
          property_id?: string | null;
          created_at?: string;
        }
      }
      goal_updates: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          update_text: string;
          progress_percentage: number;
          created_at: string;
        }
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          update_text: string;
          progress_percentage: number;
          created_at?: string;
        }
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          update_text?: string;
          progress_percentage?: number;
          created_at?: string;
        }
      }
      homestead_goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          target_date: string | null;
          category: string;
          priority: 'low' | 'medium' | 'high';
          status: 'active' | 'completed' | 'paused';
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          target_date?: string | null;
          category: string;
          priority: 'low' | 'medium' | 'high';
          status: 'active' | 'completed' | 'paused';
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          target_date?: string | null;
          category?: string;
          priority?: 'low' | 'medium' | 'high';
          status?: 'active' | 'completed' | 'paused';
          created_at?: string;
          updated_at?: string;
        }
      }
      homestead_action_media: {
        Row: {
          id: string;
          action_id: string;
          user_id: string;
          storage_path: string;
          public_url: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
          metadata: Json;
        }
        Insert: {
          id?: string;
          action_id: string;
          user_id: string;
          storage_path: string;
          public_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          metadata?: Json;
        }
        Update: {
          id?: string;
          action_id?: string;
          user_id?: string;
          storage_path?: string;
          public_url?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
          metadata?: Json;
        }
      }
      homestead_actions: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          category: 'animal' | 'garden' | 'task' | 'note' | 'photo';
          action_type: string;
          animal_id: string | null;
          garden_id: string | null;
          notes: string | null;
          action_timestamp: string;
          location: string | null;
          media_ids: string[];
          created_at: string;
          created_at_device: string | null;
          sync_state: 'pending' | 'synced' | 'failed';
          metadata: Json;
        }
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          category: 'animal' | 'garden' | 'task' | 'note' | 'photo';
          action_type: string;
          animal_id?: string | null;
          garden_id?: string | null;
          notes?: string | null;
          action_timestamp?: string;
          location?: string | null;
          media_ids?: string[];
          created_at?: string;
          created_at_device?: string | null;
          sync_state?: 'pending' | 'synced' | 'failed';
          metadata?: Json;
        }
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          category?: 'animal' | 'garden' | 'task' | 'note' | 'photo';
          action_type?: string;
          animal_id?: string | null;
          garden_id?: string | null;
          notes?: string | null;
          action_timestamp?: string;
          location?: string | null;
          media_ids?: string[];
          created_at?: string;
          created_at_device?: string | null;
          sync_state?: 'pending' | 'synced' | 'failed';
          metadata?: Json;
        }
      }
      infrastructure: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          status: 'planned' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          estimated_cost: number;
          planned_completion: string | null;
          materials_needed: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: string;
          status: 'planned' | 'in_progress' | 'completed';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          estimated_cost?: number;
          planned_completion?: string | null;
          materials_needed?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: string;
          status?: 'planned' | 'in_progress' | 'completed';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          estimated_cost?: number;
          planned_completion?: string | null;
          materials_needed?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      }
      inventory_items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          minimum_quantity: number;
          location: string | null;
          notes: string | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          quantity: number;
          unit: string;
          minimum_quantity: number;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          quantity?: number;
          unit?: string;
          minimum_quantity?: number;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
        }
      }
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          mood: string | null;
          weather: string | null;
          tags: string[] | null;
          entry_date: string;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          mood?: string | null;
          weather?: string | null;
          tags?: string[] | null;
          entry_date: string;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          mood?: string | null;
          weather?: string | null;
          tags?: string[] | null;
          entry_date?: string;
          created_at?: string;
          updated_at?: string;
        }
      }
      praxis_milestones: {
        Row: {
          id: string;
          user_id: string;
          action_id: string | null;
          milestone_type: string;
          title: string;
          description: string | null;
          achieved_at: string;
          created_at: string;
          metadata: Json;
        }
        Insert: {
          id?: string;
          user_id: string;
          action_id?: string | null;
          milestone_type: string;
          title: string;
          description?: string | null;
          achieved_at?: string;
          created_at?: string;
          metadata?: Json;
        }
        Update: {
          id?: string;
          user_id?: string;
          action_id?: string | null;
          milestone_type?: string;
          title?: string;
          description?: string | null;
          achieved_at?: string;
          created_at?: string;
          metadata?: Json;
        }
      }
      praxis_reminders: {
        Row: {
          id: string;
          user_id: string;
          action_id: string | null;
          client_id: string;
          title: string;
          category: string;
          due_at: string;
          status: 'pending' | 'sent' | 'completed' | 'dismissed';
          notes: string | null;
          notified_at: string | null;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          action_id?: string | null;
          client_id?: string;
          title: string;
          category?: string;
          due_at: string;
          status?: 'pending' | 'sent' | 'completed' | 'dismissed';
          notes?: string | null;
          notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          action_id?: string | null;
          client_id?: string;
          title?: string;
          category?: string;
          due_at?: string;
          status?: 'pending' | 'sent' | 'completed' | 'dismissed';
          notes?: string | null;
          notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      }
      properties: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          size_acres: number | null;
          location: string | null;
          property_type: string | null;
          purchase_date: string | null;
          purchase_price: number | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          size_acres?: number | null;
          location?: string | null;
          property_type?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          size_acres?: number | null;
          location?: string | null;
          property_type?: string | null;
          purchase_date?: string | null;
          purchase_price?: number | null;
          created_at?: string;
        }
      }
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'completed';
          due_date: string | null;
          assigned_to: string | null;
          property_id: string | null;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'completed';
          due_date?: string | null;
          assigned_to?: string | null;
          property_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          priority?: 'low' | 'medium' | 'high';
          status?: 'pending' | 'in_progress' | 'completed';
          due_date?: string | null;
          assigned_to?: string | null;
          property_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      }
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        }
      }
      user_privacy_settings: {
        Row: {
          id: string;
          user_id: string;
          show_on_leaderboard: boolean;
          display_name: string | null;
          show_achievements: boolean;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          show_on_leaderboard?: boolean;
          display_name?: string | null;
          show_achievements?: boolean;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          show_on_leaderboard?: boolean;
          display_name?: string | null;
          show_achievements?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      }
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_xp: number;
          level: number;
          created_at: string;
          updated_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          total_xp?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          total_xp?: number;
          level?: number;
          created_at?: string;
          updated_at?: string;
        }
      }
      xp_events: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          xp: number;
          metadata: Record<string, unknown> | null;
          created_at: string;
        }
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          xp: number;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        }
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          xp?: number;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    Enums: {
      // Infrastructure statuses and priorities
      INFRASTRUCTURE_STATUS: ['planned', 'in_progress', 'completed'] as const,
      INFRASTRUCTURE_PRIORITY: ['low', 'medium', 'high', 'urgent'] as const,
      
      // Transaction types
      TRANSACTION_TYPE: ['income', 'expense'] as const,
      
      // Goal priorities and statuses
      GOAL_PRIORITY: ['low', 'medium', 'high'] as const,
      GOAL_STATUS: ['active', 'completed', 'paused'] as const,
      
      // Task priorities and statuses
      TASK_PRIORITY: ['low', 'medium', 'high'] as const,
      TASK_STATUS: ['pending', 'in_progress', 'completed'] as const,

      // Praxis core logging categories and sync states
      PRAXIS_ACTION_CATEGORY: ['animal', 'garden', 'task', 'note', 'photo'] as const,
      PRAXIS_SYNC_STATE: ['pending', 'synced', 'failed'] as const,
      PRAXIS_REMINDER_STATUS: ['pending', 'sent', 'completed', 'dismissed'] as const,
    },
  },
} as const
