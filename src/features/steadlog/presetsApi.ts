import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { ActionCategory } from '@/features/steadlog/types';

export type LogPreset = Database['public']['Tables']['log_presets']['Row'];
export type LogPresetInsert = Database['public']['Tables']['log_presets']['Insert'];
export type LogPresetUpdate = Database['public']['Tables']['log_presets']['Update'];

export const DEFAULT_LOG_PRESETS: Array<{
  title: string;
  category: ActionCategory;
  icon: string;
}> = [
  { title: 'Collect Eggs', category: 'animal', icon: 'egg' },
  { title: 'Feed Animals', category: 'animal', icon: 'paw-print' },
  { title: 'Water Garden', category: 'garden', icon: 'leaf' },
  { title: 'Harvest', category: 'garden', icon: 'leaf' },
  { title: 'Vaccinate Animal', category: 'animal', icon: 'paw-print' },
  { title: 'Plant Seeds', category: 'garden', icon: 'leaf' },
];

export async function getLogPresets(userId: string): Promise<LogPreset[]> {
  const { data, error } = await supabase
    .from('log_presets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function ensureDefaultLogPresets(userId: string): Promise<LogPreset[]> {
  const existing = await getLogPresets(userId);
  if (existing.length > 0) {
    return existing;
  }

  const seedRows: LogPresetInsert[] = DEFAULT_LOG_PRESETS.map((preset) => ({
    user_id: userId,
    title: preset.title,
    category: preset.category,
    icon: preset.icon,
  }));

  const { error } = await supabase
    .from('log_presets')
    .upsert(seedRows, {
      onConflict: 'user_id,title',
      ignoreDuplicates: true,
    });

  if (error) throw error;
  return getLogPresets(userId);
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
