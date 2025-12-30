import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, Settings } from 'lucide-react';
import { CoupleModeToggle } from '@/components/couple/CoupleModeToggle';
import { PartnerStatusWidget } from '@/components/couple/PartnerStatus';
import { CoupleChat } from '@/components/couple/CoupleChat';
import { CoupleSettings } from '@/components/couple/CoupleSettings';
import { StudyTogetherPomodoro } from '@/components/couple/StudyTogetherPomodoro';
import { AutoDetectionStatus } from '@/components/distraction/AutoDetectionStatus';
import { DistractionTestPanel } from '@/components/distraction/DistractionTestPanel';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useDistractionMonitor } from '@/hooks/useDistractionMonitor';
import { Button } from '@/components/ui/button';

export function CoupleScreen() {
  // Initialize the distraction monitor when CoupleScreen mounts
  useDistractionMonitor();
  const { isCoupleMode, isConnected } = useCoupleStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <motion.div
          className="inline-flex p-4 rounded-full bg-couple/20 mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart className="w-8 h-8 text-couple" />
        </motion.div>
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Couple Mode
        </h1>
        <p className="text-muted-foreground">
          Focus together, grow together 💕
        </p>
        {isConnected && (
          <Button variant="ghost" size="sm" onClick={() => setShowSettings(!showSettings)} className="mt-2 gap-2">
            <Settings className="w-4 h-4" />
            {showSettings ? 'Hide Settings' : 'Settings'}
          </Button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && isConnected && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
          <CoupleSettings />
        </motion.div>
      )}

      {/* Connection Status */}
      <CoupleModeToggle />

      {/* Partner Status (when connected) */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PartnerStatusWidget />
        </motion.div>
      )}

      {/* Study Together Pomodoro */}
      {isConnected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StudyTogetherPomodoro />
        </motion.div>
      )}

      {/* Auto-Detection Status */}
      {isConnected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <AutoDetectionStatus />
        </motion.div>
      )}

      {/* Detection Test Panel */}
      {isConnected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <DistractionTestPanel />
        </motion.div>
      )}

      {/* Couple Chat (when connected) */}
      {isConnected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <CoupleChat />
        </motion.div>
      )}

      {/* Tips when not connected */}
      {isCoupleMode && !isConnected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-couple/10 border border-couple/20"
        >
          <h4 className="font-display font-semibold mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" />
            How it works
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>💕 One partner generates a link code</li>
            <li>📱 Share the code with your partner</li>
            <li>🔗 They enter it to connect</li>
            <li>🫂 Get gentle reminders when distracted</li>
            <li>📊 See each other's focus status</li>
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}