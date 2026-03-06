import type { HomesteadAction, HomesteadActionInput, OfflineQueuedAction } from '@/features/praxis/types';

const OFFLINE_QUEUE_STORAGE_KEY = 'praxis.offline.queue.v1';

function loadQueue(): OfflineQueuedAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineQueuedAction[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineQueuedAction[]) {
  localStorage.setItem(OFFLINE_QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

export function queueOfflineAction(userId: string, payload: HomesteadActionInput): OfflineQueuedAction {
  const queue = loadQueue();
  const queued: OfflineQueuedAction = {
    queue_id: crypto.randomUUID(),
    user_id: userId,
    queued_at: new Date().toISOString(),
    retry_count: 0,
    payload: {
      ...payload,
      client_id: payload.client_id ?? crypto.randomUUID(),
      created_at_device: payload.created_at_device ?? new Date().toISOString(),
      media_file_names: payload.media_files?.map((file) => file.name),
    },
  };

  // Local queue does not store raw File blobs. They cannot be safely serialized to localStorage.
  delete (queued.payload as Partial<OfflineQueuedAction['payload']> & { media_files?: File[] }).media_files;

  queue.push(queued);
  saveQueue(queue);
  return queued;
}

export function getQueuedActionsForUser(userId: string): OfflineQueuedAction[] {
  return loadQueue()
    .filter((item) => item.user_id === userId)
    .sort((a, b) => new Date(a.queued_at).getTime() - new Date(b.queued_at).getTime());
}

export function countQueuedActionsForUser(userId: string): number {
  return getQueuedActionsForUser(userId).length;
}

export function updateQueuedAction(updated: OfflineQueuedAction) {
  const queue = loadQueue();
  const next = queue.map((item) => (item.queue_id === updated.queue_id ? updated : item));
  saveQueue(next);
}

export function removeQueuedAction(queueId: string) {
  const queue = loadQueue();
  const next = queue.filter((item) => item.queue_id !== queueId);
  saveQueue(next);
}

export function toPendingAction(item: OfflineQueuedAction): HomesteadAction {
  return {
    id: `pending-${item.payload.client_id}`,
    user_id: item.user_id,
    client_id: item.payload.client_id,
    category: item.payload.category,
    action_type: item.payload.action_type,
    animal_id: item.payload.animal_id ?? null,
    garden_id: item.payload.garden_id ?? null,
    notes: item.payload.notes ?? null,
    action_timestamp: item.payload.action_timestamp ?? item.payload.created_at_device,
    location: item.payload.location ?? null,
    media_ids: [],
    created_at: item.queued_at,
    created_at_device: item.payload.created_at_device,
    sync_state: 'pending',
    metadata: {
      ...(item.payload.metadata ?? {}),
      queued: true,
      queue_id: item.queue_id,
      media_file_names: item.payload.media_file_names ?? [],
      retry_count: item.retry_count,
    },
  };
}
