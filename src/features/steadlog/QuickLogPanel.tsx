import { useMemo, useState, type ComponentType } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Check, Leaf, ListTodo, Loader2, Mic, NotebookPen, PawPrint } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createHomesteadAction } from '@/features/steadlog/api';
import type { ActionCategory } from '@/features/steadlog/types';
import { cn } from '@/lib/utils';

interface QuickLogPanelProps {
  userId: string;
}

const categories: Array<{
  key: ActionCategory;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: 'animal', label: 'Animal', icon: PawPrint },
  { key: 'garden', label: 'Garden', icon: Leaf },
  { key: 'task', label: 'Task', icon: ListTodo },
  { key: 'note', label: 'Note', icon: NotebookPen },
  { key: 'photo', label: 'Photo', icon: Camera },
];

export function QuickLogPanel({ userId }: QuickLogPanelProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<ActionCategory>('animal');
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDueAt, setReminderDueAt] = useState('');

  const isFormValid = useMemo(() => actionType.trim().length > 1, [actionType]);

  const quickPlaceholder = useMemo(() => {
    switch (category) {
      case 'animal':
        return 'Vaccinated goats';
      case 'garden':
        return 'Planted carrots';
      case 'task':
        return 'Cleaned water buckets';
      case 'note':
        return 'Observed early blight signs';
      case 'photo':
        return 'Photo: tomato leaf disease';
      default:
        return 'Log your action';
    }
  }, [category]);

  const startVoiceCapture = () => {
    const speechWindow = window as Window & {
      webkitSpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
      };
      SpeechRecognition?: new () => {
        lang: string;
        interimResults: boolean;
        maxAlternatives: number;
        start: () => void;
        onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
        onerror: () => void;
        onend: () => void;
      };
    };

    const SpeechRecognitionImpl = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      toast.error('Voice input is not supported on this browser.');
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        setActionType((prev) => (prev ? `${prev} ${transcript}` : transcript));
      }
    };
    recognition.onerror = () => {
      toast.error('Voice capture failed. Please try again.');
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);

    setIsListening(true);
    recognition.start();
  };

  const resetForm = () => {
    setActionType('');
    setNotes('');
    setLocation('');
    setMediaFiles([]);
    setReminderEnabled(false);
    setReminderTitle('');
    setReminderDueAt('');
  };

  const saveAction = async () => {
    if (!isFormValid || saving) return;

    if (reminderEnabled && (!reminderDueAt || !reminderTitle.trim())) {
      toast.error('Reminder title and due date are required.');
      return;
    }

    setSaving(true);
    try {
      const result = await createHomesteadAction(userId, {
        category,
        action_type: actionType.trim(),
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        media_files: mediaFiles,
        reminder: reminderEnabled
          ? {
              title: reminderTitle.trim(),
              due_at: new Date(reminderDueAt).toISOString(),
              category,
            }
          : undefined,
      });

      if (result.queued) {
        toast.success('Saved offline. SteadLog will sync when connection returns.');
      } else {
        toast.success('Action logged to timeline.');
      }

      if (result.queued && mediaFiles.length > 0) {
        toast.info('Photos will require a connected upload. The action has been queued now.');
      }

      queryClient.invalidateQueries({ queryKey: ['steadlog-timeline', userId] });
      queryClient.invalidateQueries({ queryKey: ['steadlog-reminders', userId] });
      resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save action';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Log Action</CardTitle>
        <CardDescription>Tap category, describe action, save. Built for under 5 seconds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {categories.map((item) => {
            const Icon = item.icon;
            const selected = item.key === category;
            return (
              <Button
                key={item.key}
                type="button"
                variant={selected ? 'default' : 'outline'}
                className={cn('h-14 text-base justify-start px-3', selected && 'ring-2 ring-primary/60')}
                onClick={() => setCategory(item.key)}
              >
                <Icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quick-action">Action</Label>
          <div className="flex gap-2">
            <Input
              id="quick-action"
              value={actionType}
              onChange={(event) => setActionType(event.target.value)}
              placeholder={quickPlaceholder}
              className="h-12 text-base"
              maxLength={180}
            />
            <Button
              type="button"
              variant="secondary"
              className="h-12 px-4"
              onClick={startVoiceCapture}
              disabled={isListening}
            >
              {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="CD&T 2 ml, left shoulder"
              className="min-h-24 text-base"
              maxLength={500}
            />
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Goat barn, north pen"
                className="h-12 text-base"
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photos">Attach Photo (optional)</Label>
              <Input
                id="photos"
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setMediaFiles(Array.from(event.target.files ?? []))}
                className="h-12 text-base"
              />
              {mediaFiles.length > 0 && (
                <p className="text-xs text-muted-foreground">{mediaFiles.length} photo(s) selected</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-md border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Add reminder</p>
            <Button
              type="button"
              variant={reminderEnabled ? 'default' : 'outline'}
              className="h-10"
              onClick={() => setReminderEnabled((prev) => !prev)}
            >
              {reminderEnabled ? 'Enabled' : 'Optional'}
            </Button>
          </div>
          {reminderEnabled && (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                value={reminderTitle}
                onChange={(event) => setReminderTitle(event.target.value)}
                placeholder="Booster shot reminder"
                className="h-11"
              />
              <Input
                type="datetime-local"
                value={reminderDueAt}
                onChange={(event) => setReminderDueAt(event.target.value)}
                className="h-11"
              />
            </div>
          )}
        </div>

        <Button
          type="button"
          className="h-14 w-full text-lg"
          disabled={!isFormValid || saving}
          onClick={saveAction}
        >
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
          Save Log
        </Button>
      </CardContent>
    </Card>
  );
}
