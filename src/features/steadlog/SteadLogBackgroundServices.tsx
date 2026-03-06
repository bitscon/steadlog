import { useAuth } from '@/contexts/AuthContext';
import { useReminderEngine } from '@/features/steadlog/useReminderEngine';
import { useSyncQueue } from '@/features/steadlog/useSyncQueue';

export function SteadLogBackgroundServices() {
  const { user } = useAuth();
  useSyncQueue(user?.id);
  useReminderEngine(user?.id);

  return null;
}
