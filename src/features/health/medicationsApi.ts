import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface Medication {
  id: string;
  user_id: string | null;
  name: string;
  target_animals: string[];
  dosage_per_lb: number | null;
  dosage_unit: string | null;
  administration_method: string | null;
  withdrawal_period_meat_days: number | null;
  withdrawal_period_milk_days: number | null;
  notes: string | null;
  created_at?: string;
}

export interface MedicationInsert {
  name: string;
  target_animals: string[];
  dosage_per_lb?: number | null;
  dosage_unit?: string | null;
  administration_method?: string | null;
  withdrawal_period_meat_days?: number | null;
  withdrawal_period_milk_days?: number | null;
  notes?: string | null;
}

export async function getMedications(userId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Medication[];
}

export async function getMedication(id: string, userId: string) {
  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .or(`user_id.eq.${userId},user_id.is.null`)
    .single();

  if (error) throw error;
  return data as Medication;
}

export async function createMedication(userId: string, medication: MedicationInsert) {
  const { data, error } = await supabase
    .from('medications')
    .insert({
      ...medication,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Medication;
}

export async function updateMedication(id: string, userId: string, medication: Partial<MedicationInsert>) {
  const { data, error } = await supabase
    .from('medications')
    .update(medication)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Medication;
}

export async function deleteMedication(id: string) {
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated to delete a medication');
  }

  const { error } = await supabase
    .from('medications')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
