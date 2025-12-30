import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Check, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useAppStore } from '@/store/useAppStore';

interface Goal {
  id: string;
  title: string;
  targetMinutes: number;
  type: 'daily' | 'weekly';
  createdAt: Date;
}

export function StudyGoals() {
  const { getTodayStudyTime, studySessions } = useAppStore();
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('focusos-goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalMinutes, setNewGoalMinutes] = useState('60');
  const [newGoalType, setNewGoalType] = useState<'daily' | 'weekly'>('daily');

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('focusos-goals', JSON.stringify(updatedGoals));
  };

  const handleAddGoal = () => {
    if (!newGoalTitle.trim() || !newGoalMinutes) return;

    const newGoal: Goal = {
      id: Math.random().toString(36).substring(2, 15),
      title: newGoalTitle.trim(),
      targetMinutes: parseInt(newGoalMinutes),
      type: newGoalType,
      createdAt: new Date(),
    };

    saveGoals([...goals, newGoal]);
    setNewGoalTitle('');
    setNewGoalMinutes('60');
    setShowAddGoal(false);
  };

  const handleDeleteGoal = (id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));
  };

  const getProgressForGoal = (goal: Goal) => {
    const now = new Date();
    let totalMinutes = 0;

    if (goal.type === 'daily') {
      totalMinutes = Math.floor(getTodayStudyTime() / 60);
    } else {
      // Weekly: get study time for last 7 days
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      totalMinutes = Math.floor(
        studySessions
          .filter((s) => new Date(s.startTime) >= weekAgo)
          .reduce((acc, s) => acc + s.duration, 0) / 60
      );
    }

    return {
      current: totalMinutes,
      percentage: Math.min((totalMinutes / goal.targetMinutes) * 100, 100),
      isComplete: totalMinutes >= goal.targetMinutes,
    };
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/20">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-display font-semibold">Study Goals</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddGoal(!showAddGoal)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50"
          >
            <div className="space-y-4">
              <div>
                <Label className="text-sm">Goal Title</Label>
                <Input
                  placeholder="e.g., Complete Physics revision"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  className="bg-secondary/50 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Target (minutes)</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={newGoalMinutes}
                    onChange={(e) => setNewGoalMinutes(e.target.value)}
                    className="bg-secondary/50 mt-1"
                    min="5"
                    max="600"
                  />
                </div>
                <div>
                  <Label className="text-sm">Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={newGoalType === 'daily' ? 'glow' : 'outline'}
                      size="sm"
                      onClick={() => setNewGoalType('daily')}
                      className="flex-1"
                    >
                      Daily
                    </Button>
                    <Button
                      variant={newGoalType === 'weekly' ? 'glow' : 'outline'}
                      size="sm"
                      onClick={() => setNewGoalType('weekly')}
                      className="flex-1"
                    >
                      Weekly
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                variant="glow"
                className="w-full"
                onClick={handleAddGoal}
                disabled={!newGoalTitle.trim() || !newGoalMinutes}
              >
                Create Goal
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No goals yet</p>
          <p className="text-sm">Add a goal to track your progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, index) => {
            const progress = getProgressForGoal(goal);
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border transition-all ${
                  progress.isComplete
                    ? 'bg-success/10 border-success/30'
                    : 'bg-secondary/20 border-border/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <CircularProgress
                    value={progress.percentage}
                    size={56}
                    strokeWidth={5}
                    color={progress.isComplete ? 'success' : 'primary'}
                    showValue={false}
                    glow={progress.isComplete}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{goal.title}</h4>
                      {progress.isComplete && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full bg-success flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-success-foreground" />
                        </motion.div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={progress.isComplete ? 'text-success' : 'text-primary'}>
                        {progress.current}m
                      </span>
                      <span>/</span>
                      <span>{goal.targetMinutes}m</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-secondary text-xs capitalize">
                        {goal.type}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Quick stats */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>
              {goals.filter((g) => getProgressForGoal(g).isComplete).length}/{goals.length} completed
            </span>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
