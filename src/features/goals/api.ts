import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type HomesteadGoal = Database['public']['Tables']['homestead_goals']['Row'];
export type GoalInsert = Database['public']['Tables']['homestead_goals']['Insert'];
export type GoalUpdate = Database['public']['Tables']['homestead_goals']['Update'];

export type GoalUpdateEntry = Database['public']['Tables']['goal_updates']['Row'];
export type GoalUpdateInsert = Database['public']['Tables']['goal_updates']['Insert'];

export const getGoals = async (userId: string): Promise<HomesteadGoal[]> => {
  const { data, error } = await supabase
    .from('homestead_goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createGoal = async (
  userId: string,
  data: Omit<GoalInsert, 'user_id'>
): Promise<HomesteadGoal> => {
  const { data: goal, error } = await supabase
    .from('homestead_goals')
    .insert({
      ...data,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return goal;
};

export const updateGoal = async (
  id: string,
  userId: string,
  data: GoalUpdate
): Promise<HomesteadGoal> => {
  const { data: goal, error } = await supabase
    .from('homestead_goals')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return goal;
};

export const deleteGoal = async (id: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('homestead_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
};

export const getGoalUpdates = async (
  goalId: string,
  userId: string
): Promise<GoalUpdateEntry[]> => {
  const { data, error } = await supabase
    .from('goal_updates')
    .select('*')
    .eq('goal_id', goalId)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createGoalUpdate = async (
  userId: string,
  data: Omit<GoalUpdateInsert, 'user_id'>
): Promise<GoalUpdateEntry> => {
  const { data: update, error } = await supabase
    .from('goal_updates')
    .insert({
      ...data,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return update;
};
