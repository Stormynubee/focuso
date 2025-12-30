import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationSettings() {
  const { requestPermission, isSupported, isEnabled, permission } = useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    await requestPermission();
    setIsRequesting(false);
  };

  if (!isSupported) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-muted">
            <BellOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Notifications unavailable</p>
            <p className="text-sm text-muted-foreground">
              Your browser doesn't support notifications
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div 
            className={`p-2 rounded-xl ${isEnabled ? 'bg-success/20' : 'bg-warning/20'}`}
            animate={isEnabled ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {isEnabled ? (
              <Bell className="w-5 h-5 text-success" />
            ) : (
              <BellOff className="w-5 h-5 text-warning" />
            )}
          </motion.div>
          <div>
            <p className="font-medium">Push Notifications</p>
            <p className="text-sm text-muted-foreground">
              {isEnabled 
                ? 'Notifications are enabled' 
                : permission === 'denied'
                  ? 'Notifications are blocked'
                  : 'Get reminders and alerts'
              }
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isEnabled ? (
            <motion.div
              key="enabled"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/20 text-success text-sm"
            >
              <Check className="w-4 h-4" />
              Enabled
            </motion.div>
          ) : permission === 'denied' ? (
            <motion.div
              key="denied"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/20 text-destructive text-sm"
            >
              <X className="w-4 h-4" />
              Blocked
            </motion.div>
          ) : (
            <motion.div
              key="enable"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Button
                variant="glow"
                size="sm"
                onClick={handleEnableNotifications}
                disabled={isRequesting}
              >
                {isRequesting ? 'Requesting...' : 'Enable'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notification types info */}
      <motion.div
        className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">⏰</span>
          <span className="text-muted-foreground">Pomodoro alerts</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">📖</span>
          <span className="text-muted-foreground">Daily reminders</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">⚠️</span>
          <span className="text-muted-foreground">Distraction warnings</span>
        </div>
      </motion.div>
    </GlassCard>
  );
}
