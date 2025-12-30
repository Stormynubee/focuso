import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { TodoList } from '@/components/todos/TodoList';

export function TasksScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          className="inline-flex p-4 rounded-full bg-love/20 mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-8 h-8 text-love" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          My Tasks
        </h1>
        <p className="text-muted-foreground">
          Stay organized, stay focused ✨
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <TodoList />
      </div>
    </motion.div>
  );
}
