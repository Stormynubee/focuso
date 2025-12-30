import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { toast } from 'sonner';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  emoji: string | null;
  priority: string;
  created_at: string;
}

const CUTE_EMOJIS = ['📝', '✨', '🌸', '💫', '🎀', '🌟', '💝', '🦋', '🌈', '🍀'];

export function TodoList() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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
        priority: 'medium'
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
      toast.success('Great job! 🎉');
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
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-love to-couple rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Add todo input */}
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

      {/* Todo list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading... ✨
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌸
            </motion.div>
            <p className="mt-2">No tasks yet! Add one above 💕</p>
          </div>
        ) : (
          <AnimatePresence>
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  todo.completed 
                    ? 'bg-muted/50 opacity-60' 
                    : 'bg-background/50 hover:bg-background/80'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    todo.completed 
                      ? 'bg-love border-love text-love-foreground' 
                      : 'border-love/50 hover:border-love'
                  }`}
                >
                  {todo.completed && <Check className="w-3 h-3" />}
                </button>
                
                <span className="text-lg">{todo.emoji}</span>
                
                <span className={`flex-1 ${todo.completed ? 'line-through' : ''}`}>
                  {todo.title}
                </span>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </GlassCard>
  );
}
