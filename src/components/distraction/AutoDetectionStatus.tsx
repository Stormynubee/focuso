import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Eye, Heart, Clock } from 'lucide-react';
import { useRealDistractionMonitor } from '@/hooks/useRealDistractionMonitor';
import { useSyncMode } from '@/hooks/useSyncMode';
import { GlassCard } from '@/components/ui/GlassCard';

export function AutoDetectionStatus() {
  const { isMonitoring, lastDetection, canSendAlert } = useRealDistractionMonitor();
  const { isConnected, partner } = useSyncMode();

  if (!isConnected) return null;

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <motion.div 
          className={`p-2 rounded-xl ${isMonitoring ? 'bg-success/20' : 'bg-muted/20'}`}
          animate={isMonitoring ? { 
            boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 8px rgba(34, 197, 94, 0)', '0 0 0 0 rgba(34, 197, 94, 0)'] 
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {isMonitoring ? (
            <Wifi className="w-4 h-4 text-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-medium flex items-center gap-2">
            Real-Time Detection
            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs">
              REAL
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            {isMonitoring ? 'Connected & monitoring' : 'Not monitoring'}
          </p>
        </div>
      </div>

      {/* Detection info */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-3 h-3" />
            Connection
          </span>
          <span className={`font-medium ${isConnected ? 'text-success' : 'text-muted-foreground'}`}>
            {isConnected ? 'Synced' : 'Disconnected'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-3 h-3" />
            Partner
          </span>
          <span className="font-medium text-couple">
            {partner?.name || 'Not connected'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3" />
            Alert Status
          </span>
          <span className={`font-medium ${canSendAlert ? 'text-success' : 'text-warning'}`}>
            {canSendAlert ? 'Ready' : 'Cooldown'}
          </span>
        </div>
      </div>

      {/* Last detection */}
      <AnimatePresence>
        {lastDetection && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 p-3 rounded-xl bg-couple/10 border border-couple/20"
          >
            <p className="text-xs text-muted-foreground mb-1">Last REAL notification sent</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                {lastDetection.isYouTube ? '📺' : '📱'} {lastDetection.app}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/20 text-success">
                  sent
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(lastDetection.timestamp)}
              </span>
            </div>
            <p className="text-xs text-couple mt-1">
              {partner?.name} received the notification 💕
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info note */}
      <motion.div
        className="mt-3 p-2 rounded-lg bg-primary/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          💡 This is REAL sync! When you trigger a detection, your partner receives 
          an actual notification via the database in real-time.
        </p>
      </motion.div>
    </GlassCard>
  );
}
