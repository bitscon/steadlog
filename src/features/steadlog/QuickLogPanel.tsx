import { useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
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
  Settings2,
  ShieldPlus,
  Sprout,
  Trash2,
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
import {
  createLogPreset,
  deleteLogPreset,
  ensureDefaultLogPresets,
  updateLogPreset,
  type LogPreset,
} from '@/features/steadlog/presetsApi';
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

const presetIconOptions: Array<{
  value: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: 'egg', label: 'Egg', icon: Egg },
  { value: 'paw-print', label: 'Paw', icon: PawPrint },
  { value: 'leaf', label: 'Leaf', icon: Leaf },
  { value: 'droplets', label: 'Water', icon: Droplets },
  { value: 'shield-plus', label: 'Vaccine', icon: ShieldPlus },
  { value: 'sprout', label: 'Sprout', icon: Sprout },
];

type PresetDraft = {
  title: string;
  category: ActionCategory;
  icon: string;
};

function toPresetErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('log_presets_user_title_unique')) {
    return 'Preset title already exists. Choose a different title.';
  }
  return message || 'Preset update failed.';
}

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
  const actionInputRef = useRef<HTMLInputElement | null>(null);
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
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [presetDrafts, setPresetDrafts] = useState<Record<string, PresetDraft>>({});
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [newPresetTitle, setNewPresetTitle] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<ActionCategory>('task');
  const [newPresetIcon, setNewPresetIcon] = useState('sprout');
  const [creatingPreset, setCreatingPreset] = useState(false);

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
  const hasPresetRows = presets.length > 0;

  useEffect(() => {
    const drafts = presets.reduce<Record<string, PresetDraft>>((acc, preset) => {
      acc[preset.id] = {
        title: preset.title,
        category: preset.category,
        icon: preset.icon,
      };
      return acc;
    }, {});
    setPresetDrafts(drafts);
  }, [presets]);

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

  const setPresetDraft = (presetId: string, updates: Partial<PresetDraft>) => {
    setPresetDrafts((prev) => {
      const existing = prev[presetId];
      if (!existing) return prev;
      return {
        ...prev,
        [presetId]: {
          ...existing,
          ...updates,
        },
      };
    });
  };

  const refreshPresets = async () => {
    await queryClient.invalidateQueries({ queryKey: ['log-presets', userId] });
  };

  const savePresetDraft = async (preset: LogPreset) => {
    const draft = presetDrafts[preset.id];
    if (!draft) return;

    const title = draft.title.trim();
    if (!title) {
      toast.error('Preset title is required.');
      return;
    }

    const hasChanges =
      title !== preset.title || draft.category !== preset.category || draft.icon !== preset.icon;
    if (!hasChanges) {
      return;
    }

    setActivePresetId(preset.id);
    try {
      await updateLogPreset(preset.id, userId, {
        title,
        category: draft.category,
        icon: draft.icon,
      });
      toast.success('Preset updated.');
      await refreshPresets();
    } catch (error) {
      toast.error(toPresetErrorMessage(error));
    } finally {
      setActivePresetId(null);
    }
  };

  const removePreset = async (preset: LogPreset) => {
    const confirmed = window.confirm(`Remove preset "${preset.title}"?`);
    if (!confirmed) return;

    setActivePresetId(preset.id);
    try {
      await deleteLogPreset(preset.id, userId);
      toast.success('Preset removed.');
      await refreshPresets();
    } catch (error) {
      toast.error(toPresetErrorMessage(error));
    } finally {
      setActivePresetId(null);
    }
  };

  const addPreset = async () => {
    const title = newPresetTitle.trim();
    if (!title) {
      toast.error('Preset title is required.');
      return;
    }

    setCreatingPreset(true);
    try {
      await createLogPreset(userId, {
        title,
        category: newPresetCategory,
        icon: newPresetIcon,
      });
      toast.success('Preset added.');
      setNewPresetTitle('');
      setNewPresetCategory('task');
      setNewPresetIcon('sprout');
      await refreshPresets();
    } catch (error) {
      toast.error(toPresetErrorMessage(error));
    } finally {
      setCreatingPreset(false);
    }
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-xs"
                onClick={() => setShowPresetManager((prev) => !prev)}
              >
                <Settings2 className="mr-1 h-3.5 w-3.5" />
                {showPresetManager ? 'Done' : 'Manage'}
              </Button>
              <span className="text-xs text-muted-foreground">Custom Log -&gt;</span>
            </div>
          </div>

          {presetsLoading ? (
            <p className="text-sm text-muted-foreground">Loading presets...</p>
          ) : !hasPresetRows ? (
            <p className="text-sm text-muted-foreground">No presets yet. Add one below.</p>
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
                      requestAnimationFrame(() => {
                        actionInputRef.current?.focus();
                      });
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="truncate">{preset.title}</span>
                  </Button>
                );
              })}
            </div>
          )}

          {showPresetManager && !presetsLoading && (
            <div className="rounded-md border p-3 space-y-3">
              <p className="text-xs text-muted-foreground">
                Edit, remove, or add presets. Quick log buttons stay unchanged.
              </p>

              <div className="space-y-2">
                {presets.map((preset) => {
                  const draft = presetDrafts[preset.id] ?? {
                    title: preset.title,
                    category: preset.category,
                    icon: preset.icon,
                  };
                  const title = draft.title.trim();
                  const hasChanges =
                    title !== preset.title || draft.category !== preset.category || draft.icon !== preset.icon;
                  const busy = activePresetId === preset.id;

                  return (
                    <div key={preset.id} className="rounded-md border p-2 space-y-2">
                      <Input
                        value={draft.title}
                        onChange={(event) => setPresetDraft(preset.id, { title: event.target.value })}
                        placeholder="Preset title"
                        className="h-10"
                        maxLength={80}
                        disabled={busy || creatingPreset}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={draft.category}
                          onValueChange={(value) =>
                            setPresetDraft(preset.id, { category: value as ActionCategory })
                          }
                          disabled={busy || creatingPreset}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((item) => (
                              <SelectItem key={item.key} value={item.key}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={draft.icon}
                          onValueChange={(value) => setPresetDraft(preset.id, { icon: value })}
                          disabled={busy || creatingPreset}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {presetIconOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <span className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {option.label}
                                  </span>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={!hasChanges || !title || busy || creatingPreset}
                          onClick={() => void savePresetDraft(preset)}
                        >
                          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={busy || creatingPreset}
                          onClick={() => void removePreset(preset)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-md border border-dashed p-2 space-y-2">
                <p className="text-xs font-medium">Add preset</p>
                <Input
                  value={newPresetTitle}
                  onChange={(event) => setNewPresetTitle(event.target.value)}
                  placeholder="Preset title"
                  className="h-10"
                  maxLength={80}
                  disabled={creatingPreset || activePresetId !== null}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    value={newPresetCategory}
                    onValueChange={(value) => setNewPresetCategory(value as ActionCategory)}
                    disabled={creatingPreset || activePresetId !== null}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((item) => (
                        <SelectItem key={item.key} value={item.key}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={newPresetIcon}
                    onValueChange={setNewPresetIcon}
                    disabled={creatingPreset || activePresetId !== null}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetIconOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {option.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  disabled={!newPresetTitle.trim() || creatingPreset || activePresetId !== null}
                  onClick={() => void addPreset()}
                >
                  {creatingPreset ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
                  Add Preset
                </Button>
              </div>
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
              ref={actionInputRef}
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
