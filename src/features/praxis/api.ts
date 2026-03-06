import { addDays, subDays } from 'date-fns';

import { supabase } from '@/integrations/supabase/client';
import {
  countQueuedActionsForUser,
  getQueuedActionsForUser,
  queueOfflineAction,
  removeQueuedAction,
  toPendingAction,
  updateQueuedAction,
} from '@/features/praxis/offlineQueue';
import type {
  CreateActionResult,
  HomesteadAction,
  HomesteadActionInput,
  HomesteadActionMedia,
  PraxisMilestone,
  PraxisReminder,
  ReminderDraft,
  ReminderStatus,
  TimelineEntry,
} from '@/features/praxis/types';

const ACTION_MEDIA_BUCKET = 'homestead-action-media';

function normalizeActionPayload(
  input: HomesteadActionInput
): Omit<HomesteadActionInput, 'media_files'> & { client_id: string; created_at_device: string } {
  return {
    ...input,
    client_id: input.client_id ?? crypto.randomUUID(),
    created_at_device: input.created_at_device ?? new Date().toISOString(),
    action_timestamp: input.action_timestamp ?? new Date().toISOString(),
    metadata: input.metadata ?? {},
  };
}

function isLikelyNetworkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('fetch')
  );
}

function toStoragePath(userId: string, actionId: string, clientId: string, index: number, file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return `${userId}/${actionId}/${clientId}-${index}.${ext}`;
}

async function uploadActionMedia(
  userId: string,
  action: HomesteadAction,
  files: File[],
  clientId: string
): Promise<HomesteadActionMedia[]> {
  const uploadedRows: Array<{
    action_id: string;
    user_id: string;
    storage_path: string;
    public_url: string;
    mime_type: string | null;
    size_bytes: number | null;
    metadata: Record<string, unknown>;
  }> = [];

  for (const [index, file] of files.entries()) {
    const storagePath = toStoragePath(userId, action.id, clientId, index, file);

    const { error: uploadError } = await supabase.storage
      .from(ACTION_MEDIA_BUCKET)
      .upload(storagePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(ACTION_MEDIA_BUCKET).getPublicUrl(storagePath);

    uploadedRows.push({
      action_id: action.id,
      user_id: userId,
      storage_path: storagePath,
      public_url: publicUrl,
      mime_type: file.type || null,
      size_bytes: file.size ?? null,
      metadata: {
        name: file.name,
      },
    });
  }

  if (!uploadedRows.length) return [];

  const { data, error } = await supabase
    .from('homestead_action_media')
    .upsert(uploadedRows, {
      onConflict: 'action_id,storage_path',
    })
    .select('*');

  if (error) throw error;
  return data ?? [];
}

async function createReminderInternal(
  userId: string,
  reminder: ReminderDraft,
  actionId?: string | null
): Promise<PraxisReminder> {
  const payload = {
    user_id: userId,
    action_id: actionId ?? null,
    client_id: reminder.client_id ?? crypto.randomUUID(),
    title: reminder.title,
    category: reminder.category ?? 'task',
    due_at: reminder.due_at,
    notes: reminder.notes ?? null,
  };

  const { data, error } = await supabase
    .from('praxis_reminders')
    .upsert(payload, {
      onConflict: 'user_id,client_id',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

async function persistHomesteadActionOnline(
  userId: string,
  input: HomesteadActionInput
): Promise<CreateActionResult> {
  const normalized = normalizeActionPayload(input);
  const insertPayload = {
    user_id: userId,
    client_id: normalized.client_id,
    category: normalized.category,
    action_type: normalized.action_type,
    animal_id: normalized.animal_id ?? null,
    garden_id: normalized.garden_id ?? null,
    notes: normalized.notes ?? null,
    action_timestamp: normalized.action_timestamp,
    location: normalized.location ?? null,
    created_at_device: normalized.created_at_device,
    sync_state: 'synced' as const,
    metadata: normalized.metadata ?? {},
  };

  const { data: action, error } = await supabase
    .from('homestead_actions')
    .upsert(insertPayload, {
      onConflict: 'user_id,client_id',
    })
    .select('*')
    .single();

  if (error) throw error;

  let reminder: PraxisReminder | null = null;
  if (normalized.reminder) {
    reminder = await createReminderInternal(userId, normalized.reminder, action.id);
  }

  let media: HomesteadActionMedia[] = [];
  if (input.media_files && input.media_files.length > 0) {
    media = await uploadActionMedia(userId, action, input.media_files, normalized.client_id);
  }

  let finalAction = action;
  if (media.length > 0) {
    const { data: updatedAction, error: updateError } = await supabase
      .from('homestead_actions')
      .update({
        media_ids: media.map((item) => item.id),
        sync_state: 'synced',
      })
      .eq('id', action.id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (updateError) throw updateError;
    finalAction = updatedAction;
  }

  return {
    action: finalAction,
    queued: false,
    reminder,
    media,
  };
}

export async function createHomesteadAction(
  userId: string,
  input: HomesteadActionInput,
  options?: { queueOnFailure?: boolean }
): Promise<CreateActionResult> {
  const queueOnFailure = options?.queueOnFailure ?? true;
  const mediaNames = input.media_files?.map((file) => file.name) ?? [];

  if (!navigator.onLine && queueOnFailure) {
    const queued = queueOfflineAction(userId, input);
    return {
      action: toPendingAction(queued),
      queued: true,
      reminder: null,
      media: [],
    };
  }

  try {
    return await persistHomesteadActionOnline(userId, input);
  } catch (error) {
    if (queueOnFailure && isLikelyNetworkError(error)) {
      const queued = queueOfflineAction(userId, input);
      return {
        action: {
          ...toPendingAction(queued),
          metadata: {
            ...(toPendingAction(queued).metadata as Record<string, unknown>),
            media_file_names: mediaNames,
          },
        },
        queued: true,
        reminder: null,
        media: [],
      };
    }
    throw error;
  }
}

export async function flushQueuedHomesteadActions(userId: string): Promise<{ synced: number; failed: number }> {
  const queued = getQueuedActionsForUser(userId);
  let synced = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      await createHomesteadAction(
        userId,
        {
          ...item.payload,
          media_files: [],
        },
        {
          queueOnFailure: false,
        }
      );
      removeQueuedAction(item.queue_id);
      synced += 1;
    } catch (error) {
      failed += 1;
      updateQueuedAction({
        ...item,
        retry_count: item.retry_count + 1,
        last_error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { synced, failed };
}

export function getOfflineQueueCount(userId: string): number {
  return countQueuedActionsForUser(userId);
}

export function getPendingQueuedActionRows(userId: string): HomesteadAction[] {
  return getQueuedActionsForUser(userId).map((item) => toPendingAction(item));
}

export async function getHomesteadActions(userId: string, limit = 100): Promise<HomesteadAction[]> {
  const { data, error } = await supabase
    .from('homestead_actions')
    .select('*')
    .eq('user_id', userId)
    .order('action_timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getActionMediaByActionIds(
  userId: string,
  actionIds: string[]
): Promise<HomesteadActionMedia[]> {
  if (!actionIds.length) return [];

  const { data, error } = await supabase
    .from('homestead_action_media')
    .select('*')
    .eq('user_id', userId)
    .in('action_id', actionIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getMilestones(userId: string, limit = 25): Promise<PraxisMilestone[]> {
  const { data, error } = await supabase
    .from('praxis_milestones')
    .select('*')
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function getReminders(
  userId: string,
  opts?: { includeDismissed?: boolean; limit?: number }
): Promise<PraxisReminder[]> {
  let query = supabase
    .from('praxis_reminders')
    .select('*')
    .eq('user_id', userId)
    .order('due_at', { ascending: true })
    .limit(opts?.limit ?? 100);

  if (!opts?.includeDismissed) {
    query = query.neq('status', 'dismissed');
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getDueReminders(userId: string, at = new Date()): Promise<PraxisReminder[]> {
  const nowIso = at.toISOString();
  const { data, error } = await supabase
    .from('praxis_reminders')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .lte('due_at', nowIso)
    .order('due_at', { ascending: true })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function createReminder(
  userId: string,
  reminder: ReminderDraft,
  actionId?: string | null
): Promise<PraxisReminder> {
  return createReminderInternal(userId, reminder, actionId);
}

export async function updateReminderStatus(
  userId: string,
  reminderId: string,
  status: ReminderStatus,
  markNotified = false
): Promise<PraxisReminder> {
  const { data, error } = await supabase
    .from('praxis_reminders')
    .update({
      status,
      notified_at: markNotified ? new Date().toISOString() : null,
    })
    .eq('id', reminderId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function getTimelineEntries(userId: string, limit = 120): Promise<TimelineEntry[]> {
  const [actions, milestones, reminders] = await Promise.all([
    getHomesteadActions(userId, limit),
    getMilestones(userId, Math.min(limit, 40)),
    getReminders(userId, { includeDismissed: false, limit: Math.min(limit, 80) }),
  ]);

  const actionMedia = await getActionMediaByActionIds(
    userId,
    actions.map((action) => action.id)
  );
  const mediaByActionId = actionMedia.reduce<Record<string, HomesteadActionMedia[]>>((acc, media) => {
    if (!acc[media.action_id]) acc[media.action_id] = [];
    acc[media.action_id].push(media);
    return acc;
  }, {});

  const actionEntries: TimelineEntry[] = actions.map((action) => ({
    id: `action-${action.id}`,
    entryType: 'action',
    timestamp: action.action_timestamp,
    title: action.action_type,
    subtitle: action.notes ?? undefined,
    category: action.category,
    syncState: action.sync_state,
    action,
    media: mediaByActionId[action.id] ?? [],
  }));

  const milestoneEntries: TimelineEntry[] = milestones.map((milestone) => ({
    id: `milestone-${milestone.id}`,
    entryType: 'milestone',
    timestamp: milestone.achieved_at,
    title: milestone.title,
    subtitle: milestone.description ?? undefined,
    milestone,
  }));

  const reminderWindowStart = subDays(new Date(), 30).toISOString();
  const reminderWindowEnd = addDays(new Date(), 90).toISOString();

  const reminderEntries: TimelineEntry[] = reminders
    .filter((reminder) => reminder.due_at >= reminderWindowStart && reminder.due_at <= reminderWindowEnd)
    .map((reminder) => ({
      id: `reminder-${reminder.id}`,
      entryType: 'reminder',
      timestamp: reminder.due_at,
      title: reminder.title,
      subtitle: reminder.notes ?? undefined,
      category: reminder.category,
      reminder,
    }));

  const offlineEntries: TimelineEntry[] = getPendingQueuedActionRows(userId).map((action) => ({
    id: `offline-${action.client_id}`,
    entryType: 'action',
    timestamp: action.action_timestamp,
    title: action.action_type,
    subtitle: action.notes ?? undefined,
    category: action.category,
    syncState: 'pending',
    action,
    media: [],
  }));

  return [...actionEntries, ...milestoneEntries, ...reminderEntries, ...offlineEntries]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}
