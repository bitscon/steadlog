import { useAuth } from '@/contexts/AuthContext';
import { useReminderEngine } from '@/features/praxis/useReminderEngine';
import { useSyncQueue } from '@/features/praxis/useSyncQueue';

export function PraxisBackgroundServices() {
  const { user } = useAuth();
  useSyncQueue(user?.id);
  useReminderEngine(user?.id);

  return null;
}
