import { motion } from 'framer-motion';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';

interface SyncStatusIndicatorProps {
  status: 'disconnected' | 'connecting' | 'connected';
  partnerName?: string;
  className?: string;
}

export function SyncStatusIndicator({ status, partnerName, className = '' }: SyncStatusIndicatorProps) {
  const statusConfig = {
    disconnected: {
      icon: WifiOff,
      label: 'Not Connected',
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      dotColor: 'bg-muted-foreground',
    },
    connecting: {
      icon: Loader2,
      label: 'Connecting...',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      dotColor: 'bg-warning',
    },
    connected: {
      icon: Wifi,
      label: partnerName ? `Synced with ${partnerName}` : 'Connected',
      color: 'text-success',
      bgColor: 'bg-success/10',
      dotColor: 'bg-success',
    },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <motion.div 
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Pulsing dot for connected state */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
        {status === 'connected' && (
          <motion.div 
            className={`absolute inset-0 w-2 h-2 rounded-full ${config.dotColor}`}
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>
      
      <Icon 
        className={`w-3.5 h-3.5 ${config.color} ${status === 'connecting' ? 'animate-spin' : ''}`} 
      />
      
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    </motion.div>
  );
}
