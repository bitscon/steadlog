import { useMemo, useState, type ComponentType } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Check,
  Droplets,
  Egg,
  Leaf,
  ListTodo,
  Loader2,
  Mic,
  NotebookPen,
  PawPrint,
  Plus,
  ShieldPlus,
  Sprout,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createAnimal, getAnimals } from '@/features/animals/api';
import { createHomesteadAction } from '@/features/steadlog/api';
import { ensureDefaultLogPresets, type LogPreset } from '@/features/steadlog/presetsApi';
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

const presetLoggedActionTextMap: Record<string, string> = {
  'Collect Eggs': 'Collected Eggs',
  'Feed Animals': 'Fed Animals',
  'Water Garden': 'Watered Garden',
  Harvest: 'Harvested',
  'Vaccinate Animal': 'Vaccinated Animal',
  'Plant Seeds': 'Planted Seeds',
};

const presetIconMap: Record<string, ComponentType<{ className?: string }>> = {
  egg: Egg,
  'paw-print': PawPrint,
  leaf: Leaf,
  droplets: Droplets,
  'shield-plus': ShieldPlus,
  sprout: Sprout,
};

function getCategoryIcon(category: ActionCategory): ComponentType<{ className?: string }> {
  const match = categories.find((item) => item.key === category);
  return match?.icon ?? ListTodo;
}

function getPresetIcon(preset: LogPreset): ComponentType<{ className?: string }> {
  return presetIconMap[preset.icon] ?? getCategoryIcon(preset.category);
}

function toPresetActionType(title: string): string {
  return presetLoggedActionTextMap[title] ?? title;
}

export function QuickLogPanel({ userId }: QuickLogPanelProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState<ActionCategory>('animal');
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [showInlineAnimalCreate, setShowInlineAnimalCreate] = useState(false);
  const [newAnimalName, setNewAnimalName] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('');

  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDueAt, setReminderDueAt] = useState('');

  const { data: presets = [], isLoading: presetsLoading } = useQuery({
    queryKey: ['log-presets', userId],
    queryFn: () => ensureDefaultLogPresets(userId),
  });

  const { data: animals = [], isLoading: animalsLoading } = useQuery({
    queryKey: ['animals', userId],
    queryFn: () => getAnimals(userId),
    enabled: category === 'animal',
  });

  const selectedAnimal = useMemo(
    () => animals.find((animal) => animal.id === selectedAnimalId),
    [animals, selectedAnimalId]
  );

  const isInlineAnimalCreateValid = newAnimalName.trim().length > 0 && newAnimalSpecies.trim().length > 0;
  const isFormValid = useMemo(() => actionType.trim().length > 1, [actionType]);
  const canSave = isFormValid && !saving;

  const quickPlaceholder = useMemo(() => {
    switch (category) {
      case 'animal':
        return selectedAnimal ? `Vaccinated ${selectedAnimal.name}` : 'Vaccinated goat';
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
  }, [category, selectedAnimal]);

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
    setShowInlineAnimalCreate(false);
    setNewAnimalName('');
    setNewAnimalSpecies('');
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
      let animalId: string | undefined;
      let animalName: string | undefined;
      const hasAnyInlineAnimalInput = newAnimalName.trim().length > 0 || newAnimalSpecies.trim().length > 0;

      if (category === 'animal') {
        if (selectedAnimalId) {
          animalId = selectedAnimalId;
          animalName = selectedAnimal?.name;
        } else if ((showInlineAnimalCreate || animals.length === 0) && hasAnyInlineAnimalInput) {
          if (!isInlineAnimalCreateValid) {
            toast.error('Quick add requires animal name and species.');
            setSaving(false);
            return;
          }

          const createdAnimal = await createAnimal(userId, {
            name: newAnimalName.trim(),
            species: newAnimalSpecies.trim(),
          });
          animalId = createdAnimal.id;
          animalName = createdAnimal.name;
          setSelectedAnimalId(createdAnimal.id);
          queryClient.invalidateQueries({ queryKey: ['animals', userId] });
        }
      }

      const result = await createHomesteadAction(userId, {
        category,
        action_type: actionType.trim(),
        animal_id: animalId,
        notes: notes.trim() || undefined,
        location: location.trim() || undefined,
        metadata: animalName ? { animal_name: animalName } : undefined,
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
      queryClient.invalidateQueries({ queryKey: ['log-presets', userId] });
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Quick Presets</Label>
            <span className="text-xs text-muted-foreground">Custom Log -&gt;</span>
          </div>

          {presetsLoading ? (
            <p className="text-sm text-muted-foreground">Loading presets...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {presets.map((preset) => {
                const Icon = getPresetIcon(preset);
                return (
                  <Button
                    key={preset.id}
                    type="button"
                    variant="outline"
                    className="h-12 justify-start px-3"
                    onClick={() => {
                      setCategory(preset.category);
                      setActionType(toPresetActionType(preset.title));
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="truncate">{preset.title}</span>
                  </Button>
                );
              })}
            </div>
          )}
        </div>

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
                onClick={() => {
                  setCategory(item.key);
                  if (item.key !== 'animal') {
                    setShowInlineAnimalCreate(false);
                  }
                }}
              >
                <Icon className="mr-2 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {category === 'animal' && (
          <div className="rounded-md border p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Select Animal (optional)</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => setShowInlineAnimalCreate((prev) => !prev)}
              >
                <Plus className="mr-1 h-4 w-4" />
                {showInlineAnimalCreate ? 'Cancel' : 'Quick Add'}
              </Button>
            </div>

            {animalsLoading ? (
              <p className="text-sm text-muted-foreground">Loading animals...</p>
            ) : animals.length > 0 ? (
              <Select value={selectedAnimalId || undefined} onValueChange={setSelectedAnimalId}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose animal profile" />
                </SelectTrigger>
                <SelectContent>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name} ({animal.species})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">
                No animal profiles yet. You can quick add one below or log without selecting an animal.
              </p>
            )}

            {(showInlineAnimalCreate || animals.length === 0) && (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new-animal-name">Animal Name</Label>
                  <Input
                    id="new-animal-name"
                    value={newAnimalName}
                    onChange={(event) => setNewAnimalName(event.target.value)}
                    placeholder="Daisy"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-animal-species">Species</Label>
                  <Input
                    id="new-animal-species"
                    value={newAnimalSpecies}
                    onChange={(event) => setNewAnimalSpecies(event.target.value)}
                    placeholder="Goat"
                    className="h-11 text-base"
                  />
                </div>
              </div>
            )}
          </div>
        )}

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
          disabled={!canSave}
          onClick={saveAction}
        >
          {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />}
          Save Log
        </Button>
      </CardContent>
    </Card>
  );
}
