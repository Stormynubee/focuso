import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Zap, Youtube, Instagram, Facebook, Twitter, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useDistractionMonitor } from '@/hooks/useDistractionMonitor';
import { useCoupleStore } from '@/store/useCoupleStore';

const TEST_APPS = [
  { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
  { name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  { name: 'Facebook', icon: Facebook, color: 'text-blue-500' },
  { name: 'Twitter', icon: Twitter, color: 'text-sky-500' },
  { name: 'WhatsApp', icon: MessageSquare, color: 'text-green-500' },
];

export function DistractionTestPanel() {
  const { triggerDetection, canSendAlert, isMonitoring } = useDistractionMonitor();
  const { isConnected, partner, alertSettings } = useCoupleStore();
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);

  if (!isConnected) return null;

  const handleTest = (appName: string) => {
    if (!canSendAlert) return;
    triggerDetection(appName);
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
          <h4 className="text-sm font-medium">Test Detection</h4>
          <p className="text-xs text-muted-foreground">Simulate app detection alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 mb-3">
        {TEST_APPS.map(({ name, icon: Icon, color }) => {
          const isEnabled = alertSettings.enabledApps.includes(name);
          const isTriggered = lastTriggered === name;
          
          return (
            <motion.button
              key={name}
              onClick={() => handleTest(name)}
              disabled={!canSendAlert || !isEnabled}
              className={`
                p-3 rounded-xl flex flex-col items-center gap-1 transition-all
                ${isEnabled 
                  ? 'bg-secondary/50 hover:bg-secondary' 
                  : 'bg-muted/20 opacity-50 cursor-not-allowed'
                }
                ${isTriggered ? 'ring-2 ring-couple' : ''}
              `}
              whileHover={isEnabled ? { scale: 1.05 } : {}}
              whileTap={isEnabled ? { scale: 0.95 } : {}}
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
        Tap an app to send a test notification to {partner?.name} 💕
      </p>
    </GlassCard>
  );
}
