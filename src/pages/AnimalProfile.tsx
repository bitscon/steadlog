import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, PawPrint, Save } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { getAnimal, updateAnimal } from '@/features/animals/api';
import { getTimelineEntries } from '@/features/steadlog/api';

export default function AnimalProfile() {
  const { animalId } = useParams<{ animalId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');

  const { data: animal, isLoading: isAnimalLoading } = useQuery({
    queryKey: ['animal', user?.id, animalId],
    queryFn: () => getAnimal(animalId!, user!.id),
    enabled: !!user?.id && !!animalId,
  });

  const { data: timelineEntries = [], isLoading: isTimelineLoading } = useQuery({
    queryKey: ['steadlog-timeline', user?.id, 'animal-profile', animalId],
    queryFn: () => getTimelineEntries(user!.id, 150),
    enabled: !!user?.id && !!animalId,
  });

  useEffect(() => {
    setNotes(animal?.notes ?? '');
  }, [animal?.id, animal?.notes]);

  const animalTimeline = useMemo(
    () =>
      timelineEntries
        .filter((entry) => entry.entryType === 'action' && entry.action?.animal_id === animalId)
        .slice(0, 30),
    [animalId, timelineEntries]
  );

  const saveNotesMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !animal) throw new Error('Animal profile is not available.');
      return updateAnimal(animal.id, user.id, { notes: notes.trim() || null });
    },
    onSuccess: () => {
      toast.success('Animal notes updated.');
      queryClient.invalidateQueries({ queryKey: ['animal', user?.id, animalId] });
      queryClient.invalidateQueries({ queryKey: ['animals', user?.id] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update notes.');
    },
  });

  if (!user?.id) return null;

  if (isAnimalLoading) {
    return <p className="text-sm text-muted-foreground">Loading animal profile...</p>;
  }

  if (!animal) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Animal profile not found.</p>
        <Button asChild variant="outline">
          <Link to="/animals">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Animals
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button asChild variant="ghost" className="px-0 text-muted-foreground">
            <Link to="/animals">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Animals
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <PawPrint className="h-7 w-7 text-primary" />
            {animal.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            {animal.species}
            {animal.breed ? ` · ${animal.breed}` : ''}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Animal Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="animal-profile-notes">Notes</Label>
            <Textarea
              id="animal-profile-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Health history, behavior observations, identifiers..."
              className="min-h-28"
              maxLength={1000}
            />
          </div>
          <Button onClick={() => saveNotesMutation.mutate()} disabled={saveNotesMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Recent Actions for {animal.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {isTimelineLoading ? (
            <p className="text-sm text-muted-foreground">Loading actions...</p>
          ) : animalTimeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No logged actions for this animal yet.</p>
          ) : (
            <div className="space-y-2">
              {animalTimeline.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3">
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                  {entry.subtitle && <p className="text-sm text-muted-foreground mt-2">{entry.subtitle}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
