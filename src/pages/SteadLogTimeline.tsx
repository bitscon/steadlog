import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { getReminders, getTimelineEntries, updateReminderStatus } from '@/features/steadlog/api';
import { TimelineFeed } from '@/features/steadlog/TimelineFeed';
import type { ReminderStatus } from '@/features/steadlog/types';

const categoryOptions = ['all', 'animal', 'garden', 'task', 'note', 'photo', 'milestone', 'reminder'] as const;

export default function SteadLogTimeline() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<(typeof categoryOptions)[number]>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['steadlog-timeline', user?.id, 'full'],
    queryFn: () => getTimelineEntries(user!.id, 250),
    enabled: !!user?.id,
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['steadlog-reminders', user?.id],
    queryFn: () => getReminders(user!.id, { includeDismissed: false, limit: 25 }),
    enabled: !!user?.id,
  });

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesCategory =
        categoryFilter === 'all' ||
        (categoryFilter === 'milestone' && entry.entryType === 'milestone') ||
        (categoryFilter === 'reminder' && entry.entryType === 'reminder') ||
        entry.category === categoryFilter;

      const text = `${entry.title} ${entry.subtitle ?? ''}`.toLowerCase();
      const matchesSearch = !searchQuery.trim() || text.includes(searchQuery.trim().toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [categoryFilter, entries, searchQuery]);

  const handleReminderStatusChange = async (reminderId: string, status: ReminderStatus) => {
    if (!user?.id) return;
    try {
      await updateReminderStatus(user.id, reminderId, status);
      toast.success(`Reminder ${status}.`);
      queryClient.invalidateQueries({ queryKey: ['steadlog-timeline', user.id] });
      queryClient.invalidateQueries({ queryKey: ['steadlog-reminders', user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update reminder');
    }
  };

  if (!user?.id) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SteadLog Timeline</h1>
        <p className="text-muted-foreground mt-1">Your living homestead history: actions, reminders, and milestones.</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter Timeline</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search actions, notes, milestones..."
            className="h-11"
          />
          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as typeof categoryFilter)}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  <span className="capitalize">{option}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reminders scheduled.</p>
          ) : (
            reminders.slice(0, 5).map((reminder) => (
              <div key={reminder.id} className="text-sm flex items-center justify-between gap-2">
                <span className="font-medium truncate">{reminder.title}</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  {new Date(reminder.due_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <TimelineFeed
        entries={filteredEntries}
        loading={isLoading}
        onReminderStatusChange={handleReminderStatusChange}
      />
    </div>
  );
}
