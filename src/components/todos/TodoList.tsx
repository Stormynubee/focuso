import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Sparkles, Star, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  emoji: string | null;
  priority: string;
  created_at: string;
}

type FilterType = 'all' | 'active' | 'completed';
type PriorityType = 'low' | 'medium' | 'high';

const CUTE_EMOJIS = ['📝', '✨', '🌸', '💫', '🎀', '🌟', '💝', '🦋', '🌈', '🍀'];

const PRIORITY_CONFIG: Record<PriorityType, { label: string; color: string; icon: string }> = {
  low: { label: 'Low', color: 'text-emerald-500 bg-emerald-500/20', icon: '🌿' },
  medium: { label: 'Medium', color: 'text-amber-500 bg-amber-500/20', icon: '⭐' },
  high: { label: 'High', color: 'text-rose-500 bg-rose-500/20', icon: '🔥' },
};

const ENCOURAGING_MESSAGES = [
  'Great job! 🎉',
  'You did it! ✨',
  'Amazing work! 💕',
  'Keep going! 🌟',
  'Proud of you! 💪',
  'One step closer! 🚀',
];

export function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedPriority, setSelectedPriority] = useState<PriorityType>('medium');

  // Fetch todos
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching todos:', error);
      } else {
        setTodos(data || []);
      }
      setIsLoading(false);
    };

    fetchTodos();
  }, [user]);

  // Add todo
  const addTodo = async () => {
    if (!newTodo.trim() || !user) return;

    const randomEmoji = CUTE_EMOJIS[Math.floor(Math.random() * CUTE_EMOJIS.length)];
    
    const { data, error } = await supabase
      .from('todos')
      .insert({
        user_id: user.id,
        title: newTodo.trim(),
        emoji: randomEmoji,
        priority: selectedPriority
      })
      .select()
      .single();

    if (error) {
      toast.error('Failed to add todo 😢');
      return;
    }

    setTodos([data, ...todos]);
    setNewTodo('');
    toast.success('Task added! ✨');
  };

  // Toggle todo completion
  const toggleTodo = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id);

    if (error) {
      toast.error('Failed to update todo');
      return;
    }

    setTodos(todos.map(t => t.id === id ? { ...t, completed: !completed } : t));
    
    if (!completed) {
      const randomMessage = ENCOURAGING_MESSAGES[Math.floor(Math.random() * ENCOURAGING_MESSAGES.length)];
      toast.success(randomMessage);
    }
  };

  // Delete todo
  const deleteTodo = async (id: string) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete todo');
      return;
    }

    setTodos(todos.filter(t => t.id !== id));
  };

  // Clear completed
  const clearCompleted = async () => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id);
    if (completedIds.length === 0) return;

    const { error } = await supabase
      .from('todos')
      .delete()
      .in('id', completedIds);

    if (error) {
      toast.error('Failed to clear completed');
      return;
    }

    setTodos(todos.filter(t => !t.completed));
    toast.success('Completed tasks cleared! ✨');
  };

  // Filter todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Sort by priority (high first) then by completion
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority as PriorityType] || 1) - (priorityOrder[b.priority as PriorityType] || 1);
  });

  const completedCount = todos.filter(t => t.completed).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  if (!user) {
    return (
      <GlassCard className="p-6 text-center">
        <Sparkles className="w-8 h-8 text-love mx-auto mb-2" />
        <p className="text-muted-foreground">Sign in to use your todo list 💕</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="p-2 rounded-full bg-love/20"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-5 h-5 text-love" />
          </motion.div>
          <h3 className="font-display font-semibold text-lg">My Tasks</h3>
        </div>
        {todos.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {completedCount}/{todos.length} done
          </span>
        )}
      </div>

      {/* Progress bar */}
      {todos.length > 0 && (
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-love to-couple rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          {progress === 100 && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center text-love font-medium"
            >
              All done! You're amazing! 🎉
            </motion.p>
          )}
        </div>
      )}

      {/* Add todo input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task... ✨"
            className="flex-1 bg-background/50 border-border/50"
          />
          <Button 
            onClick={addTodo} 
            size="icon"
            className="bg-love hover:bg-love/80 text-love-foreground shrink-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Priority selector */}
        <div className="flex gap-2">
          {(Object.keys(PRIORITY_CONFIG) as PriorityType[]).map((priority) => (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                selectedPriority === priority
                  ? PRIORITY_CONFIG[priority].color
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              )}
            >
              <span>{PRIORITY_CONFIG[priority].icon}</span>
              {PRIORITY_CONFIG[priority].label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      {todos.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
            {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all capitalize',
                  filter === f
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f}
              </button>
            ))}
          </div>
          
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Clear completed
            </button>
          )}
        </div>
      )}

      {/* Todo list */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block"
            >
              ✨
            </motion.div>
            <p className="mt-2">Loading your tasks...</p>
          </div>
        ) : sortedTodos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              {filter === 'completed' ? '📭' : filter === 'active' ? '🎯' : '🌸'}
            </motion.div>
            <p className="mt-2">
              {filter === 'completed' 
                ? 'No completed tasks yet!' 
                : filter === 'active' 
                  ? 'All tasks completed! 🎉' 
                  : 'No tasks yet! Add one above 💕'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedTodos.map((todo, index) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all group',
                  todo.completed 
                    ? 'bg-muted/30' 
                    : 'bg-background/50 hover:bg-background/80'
                )}
              >
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0',
                    todo.completed 
                      ? 'bg-love border-love text-love-foreground' 
                      : 'border-love/50 hover:border-love hover:scale-110'
                  )}
                >
                  {todo.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500 }}
                    >
                      <Check className="w-3 h-3" />
                    </motion.div>
                  )}
                </button>
                
                <span className="text-lg shrink-0">{todo.emoji || '📝'}</span>
                
                <div className="flex-1 min-w-0">
                  <span className={cn(
                    'block truncate transition-all',
                    todo.completed && 'line-through text-muted-foreground'
                  )}>
                    {todo.title}
                  </span>
                </div>

                {/* Priority badge */}
                {!todo.completed && todo.priority && (
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full shrink-0 hidden sm:block',
                    PRIORITY_CONFIG[todo.priority as PriorityType]?.color || 'bg-muted'
                  )}>
                    {PRIORITY_CONFIG[todo.priority as PriorityType]?.icon}
                  </span>
                )}

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Stats footer */}
      {todos.length > 0 && (
        <div className="flex items-center justify-center gap-4 pt-2 border-t border-border/30 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {todos.length - completedCount} remaining
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {Math.round(progress)}% complete
          </span>
        </div>
      )}
    </GlassCard>
  );
}
