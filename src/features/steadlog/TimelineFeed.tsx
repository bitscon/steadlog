import { format } from 'date-fns';
import {
  Bell,
  Camera,
  CheckCircle2,
  Leaf,
  ListTodo,
  NotebookPen,
  PawPrint,
  Sparkles,
  WifiOff,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ReminderStatus, TimelineEntry } from '@/features/steadlog/types';

interface TimelineFeedProps {
  entries: TimelineEntry[];
  loading?: boolean;
  onReminderStatusChange?: (reminderId: string, status: ReminderStatus) => void;
}

function getCategoryIcon(category?: string) {
  switch (category) {
    case 'animal':
      return PawPrint;
    case 'garden':
      return Leaf;
    case 'task':
      return ListTodo;
    case 'note':
      return NotebookPen;
    case 'photo':
      return Camera;
    default:
      return Sparkles;
  }
}

export function TimelineFeed({ entries, loading = false, onReminderStatusChange }: TimelineFeedProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="h-24 animate-pulse bg-muted/40 rounded-md" />
          </Card>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          No timeline entries yet. Start by logging your first homestead action.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const Icon = getCategoryIcon(entry.category);
        const isReminder = entry.entryType === 'reminder' && entry.reminder;
        const isMilestone = entry.entryType === 'milestone';
        const media = entry.media ?? [];

        return (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 min-w-0">
                  {isReminder ? (
                    <Bell className="h-4 w-4 text-amber-500" />
                  ) : isMilestone ? (
                    <Sparkles className="h-4 w-4 text-primary" />
                  ) : (
                    <Icon className="h-4 w-4 text-primary" />
                  )}
                  <span className="truncate">{entry.title}</span>
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {format(new Date(entry.timestamp), 'MMM d, h:mm a')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {entry.subtitle && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{entry.subtitle}</p>}

              <div className="flex flex-wrap gap-2">
                {entry.category && (
                  <Badge variant="outline" className="capitalize">
                    {entry.category}
                  </Badge>
                )}
                {entry.syncState === 'pending' && (
                  <Badge className="bg-amber-500/10 text-amber-700 border-amber-200">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline Pending
                  </Badge>
                )}
                {isMilestone && <Badge className="bg-primary/10 text-primary">Milestone</Badge>}
                {isReminder && (
                  <Badge className="bg-blue-500/10 text-blue-700 border-blue-200 capitalize">
                    Reminder {entry.reminder.status}
                  </Badge>
                )}
              </div>

              {media.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {media.map((item) => (
                    <img
                      key={item.id}
                      src={item.public_url ?? ''}
                      alt="Homestead log attachment"
                      className="h-24 w-full object-cover rounded-md border"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}

              {isReminder && onReminderStatusChange && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReminderStatusChange(entry.reminder.id, 'completed')}
                  >
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReminderStatusChange(entry.reminder.id, 'dismissed')}
                  >
                    Dismiss
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
