import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Youtube, Instagram, Facebook, Twitter, MessageSquare } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useRealDistractionMonitor } from '@/hooks/useRealDistractionMonitor';
import { useSyncMode } from '@/hooks/useSyncMode';

const TEST_APPS = [
  { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
];

export function DistractionTestPanel() {
  const { triggerDetection, canSendAlert, isMonitoring } = useRealDistractionMonitor();
  const { isConnected, partner } = useSyncMode();
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  if (!isConnected) return null;

  const handleTest = async (appName: string) => {
    if (!canSendAlert) return;
    await triggerDetection(appName);
    setLastTriggered(appName);
    setTimeout(() => setLastTriggered(null), 2000);
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-3 mb-4">
        <motion.div 
          className="p-2 rounded-xl bg-warning/20"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Zap className="w-4 h-4 text-warning" />
        </motion.div>
        <div>
          <h4 className="text-sm font-medium">Test REAL Detection</h4>
          <p className="text-xs text-muted-foreground">Send real alerts to your partner</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {TEST_APPS.map(({ name, icon: Icon, color }) => {
          const isTriggered = lastTriggered === name;
          
          return (
            <motion.button
              key={name}
              onClick={() => handleTest(name)}
              disabled={!canSendAlert}
              className={`
                p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                bg-secondary/50 hover:bg-secondary
                ${!canSendAlert ? 'opacity-50 cursor-not-allowed' : ''}
                ${isTriggered ? 'ring-2 ring-couple' : ''}
              `}
              whileHover={canSendAlert ? { scale: 1.05 } : {}}
              whileTap={canSendAlert ? { scale: 0.95 } : {}}
              animate={isTriggered ? { 
                boxShadow: ['0 0 0 0 rgba(244, 114, 182, 0.6)', '0 0 20px 10px rgba(244, 114, 182, 0)', '0 0 0 0 rgba(244, 114, 182, 0)']
              } : {}}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {name}
              </span>
            </motion.button>
          );
        })}
      </div>

      {!canSendAlert && (
        <p className="text-xs text-center text-warning">
          ⏳ Cooldown active — wait before next alert
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground mt-2">
        Tap an app to send a REAL notification to {partner?.name || 'your partner'} 💕
      </p>

      {/* Debug info */}
      <div className="mt-3 text-xs text-muted-foreground p-2 bg-secondary/30 rounded-lg font-mono">
        <div>Monitoring: {isMonitoring ? 'Active' : 'Inactive'}</div>
        <div>Can Alert: {canSendAlert ? 'Yes' : 'No (cooldown)'}</div>
        <div>Partner: {partner?.id?.slice(0, 8) || 'None'}...</div>
      </div>
    </GlassCard>
  );
}
