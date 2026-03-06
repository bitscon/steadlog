import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, TrendingUp, Pencil, Trash2, ChevronRight, CheckCircle2, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { GoalForm } from '@/features/goals/GoalForm';
import { GoalUpdateModal } from '@/features/goals/GoalUpdateModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalUpdates,
  createGoalUpdate,
  type HomesteadGoal,
  type GoalUpdateEntry,
} from '@/features/goals/api';
import { awardXP } from '@/game/gameEngine';

const HomesteadGoals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedGoal, setSelectedGoal] = useState<HomesteadGoal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateGoalId, setUpdateGoalId] = useState<string | null>(null);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['homestead-goals', user?.id],
    queryFn: () => getGoals(user!.id),
    enabled: !!user,
  });

  // Fetch all goal updates for all goals
  const { data: allUpdates = [] } = useQuery({
    queryKey: ['all-goal-updates', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('goal_updates')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  // Get updates for selected goal
  const selectedGoalUpdates = selectedGoal 
    ? allUpdates.filter(u => u.goal_id === selectedGoal.id)
    : [];

  // Helper function to get latest update for a goal
  const getLatestUpdate = (goalId: string) => {
    const goalUpdates = allUpdates.filter(u => u.goal_id === goalId);
    return goalUpdates.length > 0 ? goalUpdates[0] : null;
  };

  const createMutation = useMutation({
    mutationFn: (data: Omit<Database['public']['Tables']['homestead_goals']['Insert'], 'user_id'>) =>
      createGoal(user!.id, data),
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      
      // Award XP for goal creation
      awardXP('goal_created', 25, { goalId: newGoal.id }).catch((err) => {
        console.error('[HomesteadGoals] Failed to award XP:', err);
      });
      
      toast({
        title: 'Success',
        description: 'Goal created successfully',
      });
      setShowForm(false);
      setSelectedGoal(null);
    },
    onError: (error: Error) => {
      console.error('[HomesteadGoals] Error creating goal:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Database['public']['Tables']['homestead_goals']['Update'] }) =>
      updateGoal(id, user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      toast({
        title: 'Success',
        description: 'Goal updated successfully',
      });
      setShowForm(false);
    },
    onError: (error: Error) => {
      console.error('[HomesteadGoals] Error updating goal:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      toast({
        title: 'Success',
        description: 'Goal deleted successfully',
      });
      setSelectedGoal(null);
    },
    onError: (error: Error) => {
      console.error('[HomesteadGoals] Error deleting goal:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const createUpdateMutation = useMutation({
    mutationFn: (data: Omit<Database['public']['Tables']['goal_updates']['Insert'], 'goal_id' | 'user_id'>) =>
      createGoalUpdate(user!.id, {
        ...data,
        goal_id: updateGoalId || selectedGoal!.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-goal-updates'] });
      queryClient.invalidateQueries({ queryKey: ['homestead-goals'] });
      toast({
        title: 'Success',
        description: 'Progress update added successfully',
      });
      setShowUpdateModal(false);
      setUpdateGoalId(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: Omit<Database['public']['Tables']['homestead_goals']['Insert'], 'user_id'>) => {
    if (selectedGoal && showForm) {
      updateMutation.mutate({ id: selectedGoal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewGoal = () => {
    setSelectedGoal(null);
    setShowForm(true);
  };

  const handleEditGoal = () => {
    if (selectedGoal) {
      setShowForm(true);
    }
  };

  const handleSelectGoal = (goal: HomesteadGoal) => {
    setSelectedGoal(goal);
    setShowForm(false);
  };

  const calculateProgress = (goal: HomesteadGoal) => {
    if (goal.start_value === null || !goal.target_value) return 0;
    const latestUpdate = getLatestUpdate(goal.id);
    const currentValue = latestUpdate?.current_value ?? goal.start_value;
    const range = goal.target_value - goal.start_value;
    if (range === 0) return 100;
    const progress = ((currentValue - goal.start_value) / range) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getCurrentValue = (goal: HomesteadGoal) => {
    const latestUpdate = getLatestUpdate(goal.id);
    return latestUpdate?.current_value ?? goal.start_value ?? 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  const activeGoals = goals.filter(goal => goal.status === 'active');
  const achievedGoals = goals.filter(goal => goal.status === 'achieved');
  const archivedGoals = goals.filter(goal => goal.status === 'archived');

  const renderGoalCard = (goal: HomesteadGoal, showUpdateButton: boolean = false) => {
    const currentValue = getCurrentValue(goal);
    const progress = calculateProgress(goal);
    
    return (
      <Card 
        key={goal.id}
        className="p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-foreground">{goal.title}</h3>
          <div className="flex gap-1">
            {showUpdateButton && (
              <Button 
                size="sm"
                variant="default"
                className="h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setUpdateGoalId(goal.id);
                  setShowUpdateModal(true);
                }}
              >
                <TrendingUp className="h-3 w-3 mr-1" />
                Update
              </Button>
            )}
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedGoal(goal);
                setShowForm(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this goal?')) {
                  deleteMutation.mutate(goal.id);
                }
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
        {goal.description && (
          <p className="text-sm text-muted-foreground mb-3">{goal.description}</p>
        )}
        {goal.target_value !== null && (
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">
                Current: {currentValue} / Target: {goal.target_value} {goal.target_metric}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progress)}% complete
            </p>
          </div>
        )}
        {goal.target_date && (
          <p className="text-xs text-muted-foreground">
            Target: {format(new Date(goal.target_date), 'PPP')}
          </p>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Homestead Goals
          </h1>
          <p className="text-muted-foreground">
            Define your vision and track your progress.
          </p>
        </div>
        <Button onClick={handleNewGoal}>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {selectedGoal ? 'Edit Goal' : 'New Goal'}
          </h2>
          <GoalForm
            goal={selectedGoal}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      <div className="space-y-4">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="w-full">
            <Card className="p-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Active Goals</span>
                  <span className="text-sm text-muted-foreground">({activeGoals.length})</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </div>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {activeGoals.length > 0 ? (
              activeGoals.map(goal => renderGoalCard(goal, true))
            ) : (
              <EmptyState
                title="No Active Goals"
                description="Create your first goal to start tracking progress"
                icon={Target}
                action={
                  <Button onClick={handleNewGoal}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Goal
                  </Button>
                }
              />
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <Card className="p-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Achieved Goals</span>
                  <span className="text-sm text-muted-foreground">({achievedGoals.length})</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </div>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {achievedGoals.length > 0 ? (
              achievedGoals.map(goal => renderGoalCard(goal, false))
            ) : (
              <EmptyState
                title="No Achieved Goals Yet"
                description="Keep working towards your goals!"
                icon={CheckCircle2}
              />
            )}
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <Card className="p-4 bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Archive className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-foreground">Archived Goals</span>
                  <span className="text-sm text-muted-foreground">({archivedGoals.length})</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
              </div>
            </Card>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-3 space-y-3">
            {archivedGoals.length > 0 ? (
              archivedGoals.map(goal => renderGoalCard(goal, false))
            ) : (
              <EmptyState
                title="No Archived Goals"
                description="Archived goals will appear here"
                icon={Archive}
              />
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      <GoalUpdateModal
        open={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setUpdateGoalId(null);
        }}
        onSubmit={(data) => createUpdateMutation.mutate(data)}
        goalTitle={
          updateGoalId 
            ? goals.find(g => g.id === updateGoalId)?.title || ''
            : selectedGoal?.title || ''
        }
      />
    </div>
  );
};

export default HomesteadGoals;
