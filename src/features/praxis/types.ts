import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export const ACTION_CATEGORIES = ['animal', 'garden', 'task', 'note', 'photo'] as const;
export type ActionCategory = (typeof ACTION_CATEGORIES)[number];

export type SyncState = 'pending' | 'synced' | 'failed';
export type ReminderStatus = 'pending' | 'sent' | 'completed' | 'dismissed';

export interface ReminderDraft {
  title: string;
  due_at: string;
  notes?: string;
  category?: string;
  client_id?: string;
}

export interface HomesteadActionInput {
  client_id?: string;
  category: ActionCategory;
  action_type: string;
  notes?: string;
  action_timestamp?: string;
  location?: string;
  animal_id?: string | null;
  garden_id?: string | null;
  created_at_device?: string;
  metadata?: Record<string, unknown>;
  reminder?: ReminderDraft;
  media_files?: File[];
}

export type HomesteadAction = Tables<'homestead_actions'>;
export type HomesteadActionInsert = TablesInsert<'homestead_actions'>;
export type HomesteadActionMedia = Tables<'homestead_action_media'>;
export type SteadLogReminder = Tables<'praxis_reminders'>;
export type SteadLogMilestone = Tables<'praxis_milestones'>;

export interface TimelineEntry {
  id: string;
  entryType: 'action' | 'milestone' | 'reminder';
  timestamp: string;
  title: string;
  subtitle?: string;
  category?: string;
  syncState?: SyncState;
  action?: HomesteadAction;
  reminder?: SteadLogReminder;
  milestone?: SteadLogMilestone;
  media?: HomesteadActionMedia[];
}

export interface CreateActionResult {
  action: HomesteadAction;
  queued: boolean;
  reminder?: SteadLogReminder | null;
  media?: HomesteadActionMedia[];
}

export interface OfflineQueuedAction {
  queue_id: string;
  user_id: string;
  queued_at: string;
  retry_count: number;
  last_error?: string;
  payload: Omit<HomesteadActionInput, 'media_files'> & {
    client_id: string;
    created_at_device: string;
    media_file_names?: string[];
  };
}
