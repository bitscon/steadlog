import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type LogPreset = Database['public']['Tables']['log_presets']['Row'];
export type LogPresetInsert = Database['public']['Tables']['log_presets']['Insert'];
export type LogPresetUpdate = Database['public']['Tables']['log_presets']['Update'];

export async function getLogPresets(userId: string): Promise<LogPreset[]> {
  const { data, error } = await supabase
    .from('log_presets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createLogPreset(userId: string, input: Omit<LogPresetInsert, 'user_id'>): Promise<LogPreset> {
  const { data, error } = await supabase
    .from('log_presets')
    .insert({
      ...input,
      user_id: userId,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateLogPreset(
  id: string,
  userId: string,
  input: Omit<LogPresetUpdate, 'id' | 'user_id' | 'created_at'>
): Promise<LogPreset> {
  const { data, error } = await supabase
    .from('log_presets')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLogPreset(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('log_presets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
