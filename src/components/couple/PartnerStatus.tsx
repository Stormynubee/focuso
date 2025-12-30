import { motion } from 'framer-motion';
import { Heart, BookOpen, Coffee, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCoupleStore, PartnerStatus as PartnerStatusType } from '@/store/useCoupleStore';

const statusConfig: Record<PartnerStatusType, {
  icon: typeof Heart;
  label: string;
  color: string;
  bgColor: string;
  glowColor: string;
  emoji: string;
}> = {
  studying: {
    icon: BookOpen,
    label: 'Studying',
    color: 'text-study',
    bgColor: 'bg-study/20',
    glowColor: 'shadow-[0_0_20px_hsl(var(--study)/0.4)]',
    emoji: '📚',
  },
  break: {
    icon: Coffee,
    label: 'On Break',
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    glowColor: 'shadow-[0_0_20px_hsl(var(--accent)/0.4)]',
    emoji: '☕',
  },
  distracted: {
    icon: AlertTriangle,
    label: 'Distracted',
    color: 'text-distraction',
    bgColor: 'bg-distraction/20',
    glowColor: 'shadow-[0_0_20px_hsl(var(--distraction)/0.4)]',
    emoji: '😵',
  },
  offline: {
    icon: WifiOff,
    label: 'Offline',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    glowColor: '',
    emoji: '💤',
  },
};

export function PartnerStatusWidget() {
  const { isConnected, partner } = useCoupleStore();

  if (!isConnected || !partner) {
    return null;
  }

  const status = statusConfig[partner.status];
  const StatusIcon = status.icon;

  return (
    <GlassCard className="p-4">
      <motion.div 
        className="flex items-center gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Avatar with status glow */}
        <div className="relative">
          <motion.div
            className={`text-4xl p-3 rounded-2xl ${status.bgColor} ${status.glowColor}`}
            animate={partner.status === 'studying' ? {
              scale: [1, 1.05, 1],
            } : partner.status === 'distracted' ? {
              x: [-2, 2, -2, 2, 0],
            } : {}}
            transition={{ 
              duration: partner.status === 'studying' ? 2 : 0.5, 
              repeat: Infinity,
              repeatDelay: partner.status === 'studying' ? 0 : 3,
            }}
          >
            {partner.avatarEmoji}
          </motion.div>
          
          {/* Status indicator dot */}
          <motion.div 
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
              partner.status === 'studying' ? 'bg-study' :
              partner.status === 'break' ? 'bg-accent' :
              partner.status === 'distracted' ? 'bg-distraction' :
              'bg-muted-foreground'
            }`}
            animate={partner.status !== 'offline' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Status info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-display font-semibold">{partner.name}</h4>
            {partner.pomodoroActive && (
              <motion.span 
                className="px-2 py-0.5 rounded-full text-xs bg-couple/20 text-couple"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🍅 Pomodoro
              </motion.span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-4 h-4 ${status.color}`} />
            <span className={`text-sm ${status.color}`}>{status.label}</span>
            <span className="text-lg">{status.emoji}</span>
          </div>

          {partner.focusStreak > 0 && (
            <motion.p 
              className="text-xs text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              🔥 {partner.focusStreak} day streak
            </motion.p>
          )}
        </div>

        {/* Heart indicator */}
        <motion.div
          className="text-2xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          💕
        </motion.div>
      </motion.div>
    </GlassCard>
  );
}