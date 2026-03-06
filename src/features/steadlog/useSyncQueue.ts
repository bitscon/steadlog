import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { flushQueuedHomesteadActions, getOfflineQueueCount } from '@/features/steadlog/api';

const SYNC_INTERVAL_MS = 30_000;

interface UseSyncQueueOptions {
  enableAutoSync?: boolean;
}

export function useSyncQueue(userId?: string, options?: UseSyncQueueOptions) {
  const enableAutoSync = options?.enableAutoSync ?? true;
  const queryClient = useQueryClient();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshPendingCount = useCallback(() => {
    if (!userId) return;
    setPendingCount(getOfflineQueueCount(userId));
  }, [userId]);

  const syncNow = useCallback(async () => {
    if (!userId || !navigator.onLine || syncing) return;

    setSyncing(true);
    try {
      const result = await flushQueuedHomesteadActions(userId);
      refreshPendingCount();

      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} queued log${result.synced === 1 ? '' : 's'}.`);
        queryClient.invalidateQueries({ queryKey: ['steadlog-timeline', userId] });
        queryClient.invalidateQueries({ queryKey: ['steadlog-reminders', userId] });
      }
    } finally {
      setSyncing(false);
    }
  }, [queryClient, refreshPendingCount, syncing, userId]);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    if (!userId || !enableAutoSync) return;

    const onOnline = () => {
      void syncNow();
    };

    window.addEventListener('online', onOnline);
    const interval = window.setInterval(() => {
      void syncNow();
      refreshPendingCount();
    }, SYNC_INTERVAL_MS);

    return () => {
      window.removeEventListener('online', onOnline);
      window.clearInterval(interval);
    };
  }, [enableAutoSync, refreshPendingCount, syncNow, userId]);

  return {
    pendingCount,
    syncing,
    syncNow,
    refreshPendingCount,
  };
}
