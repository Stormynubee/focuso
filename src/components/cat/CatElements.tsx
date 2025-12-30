import { motion } from 'framer-motion';
import { useCatThemeStore } from '@/store/useCatThemeStore';

interface PawProgressProps {
  value: number; // 0-100
  total?: number; // Number of paw prints
  size?: 'sm' | 'md';
}

export function PawProgress({ value, total = 5, size = 'md' }: PawProgressProps) {
  const { isEnabled, animationIntensity } = useCatThemeStore();

  if (!isEnabled) return null;

  const filledPaws = Math.floor((value / 100) * total);
  const sizeClasses = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          className={`${sizeClasses} ${i < filledPaws ? 'text-cat' : 'text-muted-foreground/30'}`}
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            opacity: i < filledPaws ? 1 : 0.4,
          }}
          transition={{ 
            delay: animationIntensity !== 'low' ? i * 0.1 : 0,
            type: 'spring',
            stiffness: 300,
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            {/* Main pad */}
            <ellipse cx="12" cy="16" rx="5" ry="4" />
            {/* Toe beans */}
            <circle cx="7" cy="10" r="2.5" />
            <circle cx="17" cy="10" r="2.5" />
            <circle cx="10" cy="7" r="2" />
            <circle cx="14" cy="7" r="2" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

// Cat-ear shaped tab indicator
export function CatEarTab({ active = false }: { active?: boolean }) {
  const { isEnabled } = useCatThemeStore();

  if (!isEnabled) return null;

  return (
    <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex gap-0.5">
      <motion.div
        className={`w-2 h-2 rounded-tl-full ${active ? 'bg-cat' : 'bg-muted-foreground/20'}`}
        style={{ transform: 'rotate(-15deg)' }}
        animate={active ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <motion.div
        className={`w-2 h-2 rounded-tr-full ${active ? 'bg-cat' : 'bg-muted-foreground/20'}`}
        style={{ transform: 'rotate(15deg)' }}
        animate={active ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, delay: 0.1 }}
      />
    </div>
  );
}

// Whisker divider line
export function WhiskerDivider() {
  const { isEnabled } = useCatThemeStore();

  if (!isEnabled) {
    return <div className="h-px bg-border/50 my-4" />;
  }

  return (
    <div className="flex items-center justify-center gap-2 my-4">
      <div className="flex-1 h-px bg-border/30" />
      <div className="flex gap-1 opacity-40">
        <div className="w-4 h-px bg-cat rounded-full transform -rotate-6" />
        <div className="w-5 h-px bg-cat rounded-full" />
        <div className="w-4 h-px bg-cat rounded-full transform rotate-6" />
      </div>
      <svg className="w-4 h-4 text-cat/60" viewBox="0 0 24 24" fill="currentColor">
        <ellipse cx="12" cy="14" rx="4" ry="3" />
        <circle cx="8" cy="9" r="2" />
        <circle cx="16" cy="9" r="2" />
        <circle cx="10.5" cy="6.5" r="1.5" />
        <circle cx="13.5" cy="6.5" r="1.5" />
      </svg>
      <div className="flex gap-1 opacity-40">
        <div className="w-4 h-px bg-cat rounded-full transform rotate-6" />
        <div className="w-5 h-px bg-cat rounded-full" />
        <div className="w-4 h-px bg-cat rounded-full transform -rotate-6" />
      </div>
      <div className="flex-1 h-px bg-border/30" />
    </div>
  );
}

// Tail loading indicator
export function TailLoader({ className = '' }: { className?: string }) {
  const { isEnabled, animationIntensity } = useCatThemeStore();

  if (!isEnabled) {
    return (
      <div className={`w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin ${className}`} />
    );
  }

  return (
    <motion.div 
      className={`relative ${className}`}
      style={{ width: 32, height: 16 }}
    >
      <motion.div
        className="absolute bottom-0 left-0 w-8 h-2 bg-cat rounded-full origin-left"
        animate={{ 
          rotate: animationIntensity === 'low' ? [0, 30, 0] : [0, 45, 0, -20, 0],
          scaleX: [1, 1.1, 1],
        }}
        transition={{ 
          duration: animationIntensity === 'high' ? 0.5 : 1, 
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0.5 left-6 w-4 h-1.5 bg-cat rounded-full origin-left"
        animate={{ 
          rotate: animationIntensity === 'low' ? [0, 20, 0] : [0, 30, 0, -15, 0],
        }}
        transition={{ 
          duration: animationIntensity === 'high' ? 0.5 : 1, 
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.1,
        }}
      />
    </motion.div>
  );
}

// Corner peeking cat
export function PeekingCat({ position = 'bottom-right' }: { position?: 'bottom-right' | 'bottom-left' }) {
  const { isEnabled, currentMood, animationIntensity } = useCatThemeStore();

  if (!isEnabled) return null;

  const positionClasses = {
    'bottom-right': 'fixed bottom-0 right-4 z-30',
    'bottom-left': 'fixed bottom-0 left-4 z-30',
  };

  return (
    <motion.div
      className={positionClasses[position]}
      initial={{ y: 40 }}
      animate={{ 
        y: animationIntensity === 'low' ? 20 : [20, 15, 20],
      }}
      transition={{ 
        duration: 4, 
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <div className="w-12 h-12 relative">
        {/* Ears peeking */}
        <svg viewBox="0 0 48 24" className="w-full h-6 text-foreground/80">
          <path d="M8 24 L14 8 L20 20" fill="currentColor" />
          <path d="M28 20 L34 8 L40 24" fill="currentColor" />
          {/* Inner ear */}
          <path d="M10 22 L14 10 L18 20" fill="hsl(var(--cat))" opacity="0.3" />
          <path d="M30 20 L34 10 L38 22" fill="hsl(var(--cat))" opacity="0.3" />
        </svg>
        
        {/* Eyes peeking */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-4">
          <motion.div 
            className="w-2 h-2 rounded-full bg-foreground"
            animate={currentMood === 'sleepy' ? { scaleY: 0.3 } : { scaleY: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div 
            className="w-2 h-2 rounded-full bg-foreground"
            animate={currentMood === 'sleepy' ? { scaleY: 0.3 } : { scaleY: [1, 0.2, 1] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, delay: 0.1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
