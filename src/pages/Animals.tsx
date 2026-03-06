import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PawPrint, Plus, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { createAnimal, getAnimals } from '@/features/animals/api';

interface AnimalFormState {
  name: string;
  species: string;
  breed: string;
  birth_date: string;
  notes: string;
}

const initialFormState: AnimalFormState = {
  name: '',
  species: '',
  breed: '',
  birth_date: '',
  notes: '',
};

export default function Animals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formState, setFormState] = useState<AnimalFormState>(initialFormState);

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ['animals', user?.id],
    queryFn: () => getAnimals(user!.id),
    enabled: !!user?.id,
  });

  const createAnimalMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('You must be signed in to create an animal profile.');
      return createAnimal(user.id, {
        name: formState.name.trim(),
        species: formState.species.trim(),
        breed: formState.breed.trim() || null,
        birth_date: formState.birth_date || null,
        notes: formState.notes.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['animals', user?.id] });
      toast.success('Animal profile created.');
      setFormState(initialFormState);
      setShowCreateForm(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create animal profile.');
    },
  });

  const canCreateAnimal = formState.name.trim().length > 0 && formState.species.trim().length > 0;

  if (!user?.id) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Animals</h1>
          <p className="text-muted-foreground mt-1">Create simple animal profiles and connect actions to specific animals.</p>
        </div>
        <Button onClick={() => setShowCreateForm((current) => !current)}>
          <Plus className="mr-2 h-4 w-4" />
          {showCreateForm ? 'Close' : 'New Animal'}
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Create Animal Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="animal-name">Name</Label>
                <Input
                  id="animal-name"
                  value={formState.name}
                  onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Daisy"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="animal-species">Species</Label>
                <Input
                  id="animal-species"
                  value={formState.species}
                  onChange={(event) => setFormState((prev) => ({ ...prev, species: event.target.value }))}
                  placeholder="Goat"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="animal-breed">Breed (optional)</Label>
                <Input
                  id="animal-breed"
                  value={formState.breed}
                  onChange={(event) => setFormState((prev) => ({ ...prev, breed: event.target.value }))}
                  placeholder="Nubian"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="animal-birth-date">Birth Date (optional)</Label>
                <Input
                  id="animal-birth-date"
                  type="date"
                  value={formState.birth_date}
                  onChange={(event) => setFormState((prev) => ({ ...prev, birth_date: event.target.value }))}
                  className="h-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animal-notes">Notes (optional)</Label>
              <Textarea
                id="animal-notes"
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Temperament, health notes, identifiers..."
                className="min-h-24"
              />
            </div>

            <Button
              onClick={() => createAnimalMutation.mutate()}
              disabled={!canCreateAnimal || createAnimalMutation.isPending}
              className="h-12"
            >
              {createAnimalMutation.isPending ? 'Creating...' : 'Create Animal'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Your Animal Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading animals...</p>
          ) : animals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <PawPrint className="h-8 w-8 mx-auto mb-2" />
              <p>No animals yet. Create your first profile to link animal actions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {animals.map((animal) => (
                <Link
                  key={animal.id}
                  to={`/animals/${animal.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent/40 transition-colors"
                >
                  <div>
                    <p className="font-medium leading-none">{animal.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {animal.species}
                      {animal.breed ? ` · ${animal.breed}` : ''}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
