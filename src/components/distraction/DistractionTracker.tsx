import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore, Distraction } from '@/store/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';

const COMMON_DISTRACTIONS = [
  { name: 'YouTube', category: 'video' as const, icon: '📺' },
  { name: 'Instagram', category: 'social' as const, icon: '📷' },
  { name: 'WhatsApp', category: 'messaging' as const, icon: '💬' },
  { name: 'Games', category: 'games' as const, icon: '🎮' },
  { name: 'Facebook', category: 'social' as const, icon: '👤' },
  { name: 'Browser', category: 'browser' as const, icon: '🌐' },
];

export function DistractionTracker() {
  const { 
    currentDistraction, 
    startDistraction, 
    endDistraction, 
    addManualDistraction,
    distractions 
  } = useAppStore();
  const { notifyDistraction } = useNotifications();
  
  const [showAddManual, setShowAddManual] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [selectedDistraction, setSelectedDistraction] = useState<typeof COMMON_DISTRACTIONS[0] | null>(null);

  const todayDistractions = distractions.filter((d) => {
    const today = new Date();
    const dDate = new Date(d.startTime);
    return dDate.toDateString() === today.toDateString();
  });

  const handleQuickLog = (distraction: typeof COMMON_DISTRACTIONS[0]) => {
    if (currentDistraction) return;
    
    setSelectedDistraction(distraction);
    setShowAddManual(true);
  };

  const handleAddManual = () => {
    if (!selectedDistraction || !manualMinutes) return;

    const duration = parseInt(manualMinutes) * 60;
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - duration * 1000);

    addManualDistraction({
      appName: selectedDistraction.name,
      category: selectedDistraction.category,
      startTime,
      endTime,
      duration,
    });

    // Send notification warning
    notifyDistraction(selectedDistraction.name);

    setShowAddManual(false);
    setManualMinutes('');
    setSelectedDistraction(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-distraction/20">
            <AlertTriangle className="w-5 h-5 text-distraction" />
          </div>
          <h3 className="text-lg font-display font-semibold">Distractions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddManual(!showAddManual)}
          className="text-muted-foreground"
        >
          <Plus className="w-4 h-4 mr-1" />
          Log
        </Button>
      </div>

      {/* Quick log buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {COMMON_DISTRACTIONS.map((d) => (
          <motion.button
            key={d.name}
            onClick={() => handleQuickLog(d)}
            className={`p-3 rounded-xl text-center transition-all ${
              selectedDistraction?.name === d.name
                ? 'bg-distraction/20 border border-distraction/30'
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="text-xl mb-1 block">{d.icon}</span>
            <span className="text-xs text-muted-foreground">{d.name}</span>
          </motion.button>
        ))}
      </div>

      {/* Manual entry form */}
      <AnimatePresence>
        {showAddManual && selectedDistraction && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 rounded-xl bg-secondary/30 border border-border/50"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium flex items-center gap-2">
                {selectedDistraction.icon} {selectedDistraction.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddManual(false);
                  setSelectedDistraction(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Minutes"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(e.target.value)}
                className="bg-secondary/50 border-border/50"
              />
              <Button onClick={handleAddManual} variant="destructive">
                Log
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's distractions */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
          Today's Distractions
        </p>
        {todayDistractions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No distractions logged today! 🎉
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todayDistractions.slice(-5).reverse().map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30"
              >
                <span className="text-sm">{d.appName}</span>
                <span className="text-xs text-distraction font-medium">
                  {formatDuration(d.duration)}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Note about native detection */}
      <motion.div
        className="mt-4 p-3 rounded-xl bg-primary/10 border border-primary/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-muted-foreground">
          💡 <strong>Pro tip:</strong> For automatic app detection, install FocusOS as a native app via Capacitor.
        </p>
      </motion.div>
    </GlassCard>
  );
}
