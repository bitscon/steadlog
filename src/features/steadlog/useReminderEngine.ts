import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

import { getDueReminders, updateReminderStatus } from '@/features/steadlog/api';

const REMINDER_POLL_MS = 60_000;

const notifiedCacheKey = 'steadlog.reminders.notified.v1';
const legacyNotifiedCacheKey = 'praxis.reminders.notified.v1';

function loadNotifiedCache(): string[] {
  try {
    const raw = localStorage.getItem(notifiedCacheKey) ?? localStorage.getItem(legacyNotifiedCacheKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifiedCache(ids: string[]) {
  localStorage.setItem(notifiedCacheKey, JSON.stringify(ids.slice(-300)));
  localStorage.removeItem(legacyNotifiedCacheKey);
}

export function useReminderEngine(userId?: string) {
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState<string[]>(() => loadNotifiedCache());
  const notifiedSet = useMemo(() => new Set(notifiedIds), [notifiedIds]);

  const notifyBrowser = useCallback((title: string, body: string) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
      return;
    }
    if (Notification.permission === 'default') {
      void Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }, []);

  const checkDue = useCallback(async () => {
    if (!userId || !navigator.onLine || running) return;
    setRunning(true);
    try {
      const dueReminders = await getDueReminders(userId, new Date());
      for (const reminder of dueReminders) {
        if (notifiedSet.has(reminder.id)) continue;

        toast.info(`Reminder: ${reminder.title}`, {
          description: reminder.notes ?? `Due ${new Date(reminder.due_at).toLocaleString()}`,
        });
        notifyBrowser(`SteadLog Reminder: ${reminder.title}`, reminder.notes ?? 'Reminder is now due.');

        await updateReminderStatus(userId, reminder.id, 'sent', true);
        const nextNotifiedIds = [...notifiedSet, reminder.id];
        setNotifiedIds(nextNotifiedIds);
        saveNotifiedCache(nextNotifiedIds);
      }

      if (dueReminders.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['steadlog-reminders', userId] });
        queryClient.invalidateQueries({ queryKey: ['steadlog-timeline', userId] });
      }
    } finally {
      setRunning(false);
    }
  }, [notifyBrowser, notifiedSet, queryClient, running, userId]);

  useEffect(() => {
    if (!userId) return;

    void checkDue();
    const interval = window.setInterval(() => {
      void checkDue();
    }, REMINDER_POLL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [checkDue, userId]);

  return {
    checkDue,
  };
}
