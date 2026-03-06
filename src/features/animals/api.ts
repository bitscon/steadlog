import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

interface AnimalRow {
  id: string;
  user_id: string;
  name: string;
  species?: string | null;
  type?: string | null;
  breed?: string | null;
  birth_date?: string | null;
  weight_lbs?: number | null;
  gender?: string | null;
  breeding_status?: string | null;
  notes?: string | null;
  property_id?: string | null;
  photo_url?: string | null;
  created_at?: string;
}

function normalizeAnimal(row: AnimalRow): Animal {
  const species = row.species ?? row.type ?? 'animal';
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    species,
    type: row.type ?? species,
    breed: row.breed ?? null,
    birth_date: row.birth_date ?? null,
    weight_lbs: row.weight_lbs ?? null,
    gender: row.gender ?? null,
    breeding_status: row.breeding_status ?? null,
    notes: row.notes ?? null,
    property_id: row.property_id ?? null,
    photo_url: row.photo_url ?? null,
    created_at: row.created_at,
  };
}

function resolveSpecies(species?: string | null, type?: string | null): string {
  const resolved = (species ?? type ?? '').trim();
  if (!resolved) {
    throw new Error('Animal species is required');
  }
  return resolved;
}

export interface Animal {
  id: string;
  user_id: string;
  name: string;
  species: string;
  type?: string | null;
  breed: string | null;
  birth_date: string | null;
  weight_lbs: number | null;
  gender: string | null;
  breeding_status: string | null;
  notes: string | null;
  property_id: string | null;
  photo_url?: string | null;
  created_at?: string;
}

export interface AnimalInsert {
  name: string;
  species?: string;
  type?: string | null;
  breed?: string | null;
  birth_date?: string | null;
  weight_lbs?: number | null;
  gender?: string | null;
  breeding_status?: string | null;
  notes?: string | null;
  property_id?: string | null;
  photo_url?: string | null;
}

export interface AnimalUpdate {
  name?: string;
  species?: string;
  type?: string | null;
  breed?: string | null;
  birth_date?: string | null;
  weight_lbs?: number | null;
  gender?: string | null;
  breeding_status?: string | null;
  notes?: string | null;
  property_id?: string | null;
  photo_url?: string | null;
}

export async function getAnimals(userId: string, propertyId?: string) {
  let query = supabase
    .from('animals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (propertyId) {
    query = query.eq('property_id', propertyId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []).map((row) => normalizeAnimal(row as AnimalRow));
}

export async function getAnimal(id: string, userId: string) {
  const { data, error } = await supabase
    .from('animals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return normalizeAnimal(data as AnimalRow);
}

export async function createAnimal(userId: string, animal: AnimalInsert) {
  const species = resolveSpecies(animal.species, animal.type);

  const { data, error } = await supabase
    .from('animals')
    .insert({
      ...animal,
      user_id: userId,
      species,
      type: animal.type ?? species,
    })
    .select()
    .single();

  if (error) throw error;
  return normalizeAnimal(data as AnimalRow);
}

export async function updateAnimal(id: string, userId: string, animal: AnimalUpdate) {
  const nextSpecies =
    animal.species !== undefined || animal.type !== undefined
      ? resolveSpecies(animal.species, animal.type)
      : undefined;

  const { data, error } = await supabase
    .from('animals')
    .update({
      ...animal,
      ...(nextSpecies ? { species: nextSpecies, type: nextSpecies } : {}),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return normalizeAnimal(data as AnimalRow);
}

export async function deleteAnimal(id: string, userId: string) {
  const { error } = await supabase
    .from('animals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
