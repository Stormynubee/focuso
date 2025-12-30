import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Eye, Heart, Clock } from 'lucide-react';
import { useDistractionMonitor } from '@/hooks/useDistractionMonitor';
import { useCoupleStore } from '@/store/useCoupleStore';
import { GlassCard } from '@/components/ui/GlassCard';

export function AutoDetectionStatus() {
  const { isMonitoring, lastDetection, canSendAlert } = useDistractionMonitor();
  const { isConnected, partner, alertSettings, studyTogetherActive } = useCoupleStore();

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
            Auto-Detection
            {studyTogetherActive && (
              <span className="px-2 py-0.5 rounded-full bg-couple/20 text-couple text-xs">
                Enhanced
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {isMonitoring ? 'Monitoring active' : 'Not monitoring'}
          </p>
        </div>
      </div>

      {/* Detection info */}
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Eye className="w-3 h-3" />
            Tracked Apps
          </span>
          <span className="font-medium">{alertSettings.enabledApps.length}</span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Heart className="w-3 h-3" />
            Partner Alerts
          </span>
          <span className={`font-medium ${alertSettings.enabled ? 'text-success' : 'text-muted-foreground'}`}>
            {alertSettings.enabled ? 'On' : 'Off'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-3 h-3" />
            Cooldown
          </span>
          <span className={`font-medium ${canSendAlert ? 'text-success' : 'text-warning'}`}>
            {canSendAlert ? 'Ready' : `${alertSettings.cooldownMinutes}m cooldown`}
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
            <p className="text-xs text-muted-foreground mb-1">Last notification</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                {lastDetection.isYouTube ? '📺' : '📱'} {lastDetection.app}
                {lastDetection.isYouTube && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                    neutral
                  </span>
                )}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(lastDetection.timestamp)}
              </span>
            </div>
            <p className="text-xs text-couple mt-1">
              {partner?.name} was notified 💕
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
          💡 Detection works best when you browse within this app. 
          For full app-level monitoring, install as a native app via Capacitor.
        </p>
      </motion.div>
    </GlassCard>
  );
}
