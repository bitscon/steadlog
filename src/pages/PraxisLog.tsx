import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CloudOff, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { getTimelineEntries, updateReminderStatus } from '@/features/praxis/api';
import { QuickLogPanel } from '@/features/praxis/QuickLogPanel';
import { TimelineFeed } from '@/features/praxis/TimelineFeed';
import type { ReminderStatus } from '@/features/praxis/types';
import { useSyncQueue } from '@/features/praxis/useSyncQueue';

export default function PraxisLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { pendingCount, syncing, syncNow } = useSyncQueue(user?.id);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['praxis-timeline', user?.id, 'recent'],
    queryFn: () => getTimelineEntries(user!.id, 25),
    enabled: !!user?.id,
  });

  const handleReminderStatusChange = async (reminderId: string, status: ReminderStatus) => {
    if (!user?.id) return;
    try {
      await updateReminderStatus(user.id, reminderId, status);
      toast.success(`Reminder ${status}.`);
      queryClient.invalidateQueries({ queryKey: ['praxis-timeline', user.id] });
      queryClient.invalidateQueries({ queryKey: ['praxis-reminders', user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update reminder');
    }
  };

  if (!user?.id) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Praxis Quick Log</h1>
          <p className="text-muted-foreground mt-1">
            Barn-first logging for one-hand use, offline resilience, and timeline memory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">
              <CloudOff className="h-3.5 w-3.5 mr-1" />
              {pendingCount} queued
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => void syncNow()} disabled={syncing || pendingCount === 0}>
            <RefreshCcw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      <QuickLogPanel userId={user.id} />

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Recent Timeline</h2>
        <TimelineFeed
          entries={entries}
          loading={isLoading}
          onReminderStatusChange={handleReminderStatusChange}
        />
      </div>
    </div>
  );
}
