import { motion } from 'framer-motion';
import { BookOpen, Coffee, Zap, Moon, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Partner } from '@/hooks/useSyncMode';

interface RealPartnerStatusProps {
  partner: Partner;
}

const statusConfig = {
  studying: {
    icon: BookOpen,
    label: 'Studying',
    color: 'text-success',
    bgColor: 'bg-success/20',
    emoji: '📚',
  },
  break: {
    icon: Coffee,
    label: 'On Break',
    color: 'text-warning',
    bgColor: 'bg-warning/20',
    emoji: '☕',
  },
  distracted: {
    icon: Zap,
    label: 'Distracted',
    color: 'text-couple',
    bgColor: 'bg-couple/20',
    emoji: '😅',
  },
  offline: {
    icon: Moon,
    label: 'Offline',
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/20',
    emoji: '💤',
  },
};

export function RealPartnerStatus({ partner }: RealPartnerStatusProps) {
  const config = statusConfig[partner.status];
  const Icon = config.icon;
  
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <motion.div 
          className={`relative w-14 h-14 rounded-full ${config.bgColor} flex items-center justify-center`}
          animate={partner.status === 'studying' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {partner.avatarUrl ? (
            <img 
              src={partner.avatarUrl} 
              alt={partner.name} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl">{config.emoji}</span>
          )}
          
          {/* Status indicator dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background ${
            partner.status === 'studying' ? 'bg-success' :
            partner.status === 'break' ? 'bg-warning' :
            partner.status === 'distracted' ? 'bg-couple' :
            'bg-muted-foreground'
          }`}>
            {partner.status === 'studying' && (
              <motion.div 
                className="absolute inset-0 rounded-full bg-success"
                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="font-display font-semibold text-lg">{partner.name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className={`text-sm ${config.color}`}>{config.label}</span>
          </div>
        </div>

        {/* Pomodoro indicator */}
        {partner.pomodoroActive && (
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">
              {formatTimeLeft(partner.pomodoroTimeLeft)}
            </span>
          </motion.div>
        )}
      </div>

      {/* Last seen */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          Last seen: {formatTimeAgo(partner.lastSeen)}
        </p>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          ID: {partner.id.slice(0, 8)}...
        </p>
      </div>
    </GlassCard>
  );
}
