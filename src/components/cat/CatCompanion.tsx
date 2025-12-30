import { motion, AnimatePresence } from 'framer-motion';
import { useCatThemeStore, CatMood } from '@/store/useCatThemeStore';

// Cat SVG components for different moods
const CatFace = ({ mood }: { mood: CatMood }) => {
  const getEyeExpression = () => {
    switch (mood) {
      case 'sleepy':
        return (
          <>
            <path d="M12 14 Q14 13 16 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M24 14 Q26 13 28 14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'curious':
        return (
          <>
            <ellipse cx="14" cy="14" rx="3" ry="4" fill="currentColor" />
            <ellipse cx="26" cy="14" rx="3" ry="4" fill="currentColor" />
            <circle cx="15" cy="13" r="1" fill="white" />
            <circle cx="27" cy="13" r="1" fill="white" />
          </>
        );
      case 'celebrating':
        return (
          <>
            <path d="M11 12 Q14 16 17 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M23 12 Q26 16 29 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </>
        );
      case 'focused':
        return (
          <>
            <ellipse cx="14" cy="14" rx="2.5" ry="3.5" fill="currentColor" />
            <ellipse cx="26" cy="14" rx="2.5" ry="3.5" fill="currentColor" />
            <circle cx="14.5" cy="13" r="0.8" fill="white" />
            <circle cx="26.5" cy="13" r="0.8" fill="white" />
          </>
        );
      default: // happy
        return (
          <>
            <ellipse cx="14" cy="14" rx="3" ry="3.5" fill="currentColor" />
            <ellipse cx="26" cy="14" rx="3" ry="3.5" fill="currentColor" />
            <circle cx="15" cy="13" r="1.2" fill="white" />
            <circle cx="27" cy="13" r="1.2" fill="white" />
          </>
        );
    }
  };

  const getMouth = () => {
    switch (mood) {
      case 'celebrating':
        return <path d="M17 22 Q20 26 23 22" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
      case 'curious':
        return <ellipse cx="20" cy="23" rx="2" ry="1.5" fill="currentColor" opacity="0.3" />;
      default:
        return (
          <>
            <circle cx="20" cy="21" r="1.5" fill="#FFB6C1" />
            <path d="M18 24 Q20 26 22 24" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />
          </>
        );
    }
  };

  return (
    <svg viewBox="0 0 40 40" className="w-full h-full text-foreground">
      {/* Ears */}
      <path d="M6 8 L10 18 L2 16 Z" fill="currentColor" opacity="0.9" />
      <path d="M34 8 L30 18 L38 16 Z" fill="currentColor" opacity="0.9" />
      <path d="M7 10 L10 17 L4 15 Z" fill="#FFB6C1" opacity="0.5" />
      <path d="M33 10 L30 17 L36 15 Z" fill="#FFB6C1" opacity="0.5" />
      
      {/* Face */}
      <ellipse cx="20" cy="22" rx="16" ry="14" fill="currentColor" opacity="0.15" />
      
      {/* Whiskers */}
      <g opacity="0.3" stroke="currentColor" strokeWidth="0.5">
        <line x1="4" y1="20" x2="12" y2="21" />
        <line x1="4" y1="23" x2="12" y2="23" />
        <line x1="4" y1="26" x2="12" y2="25" />
        <line x1="36" y1="20" x2="28" y2="21" />
        <line x1="36" y1="23" x2="28" y2="23" />
        <line x1="36" y1="26" x2="28" y2="25" />
      </g>
      
      {/* Eyes */}
      {getEyeExpression()}
      
      {/* Nose & Mouth */}
      {getMouth()}
    </svg>
  );
};

interface CatCompanionProps {
  size?: 'sm' | 'md' | 'lg';
  position?: 'corner' | 'inline' | 'float';
  showOnlyWhenEnabled?: boolean;
}

export function CatCompanion({ 
  size = 'md', 
  position = 'corner',
  showOnlyWhenEnabled = true 
}: CatCompanionProps) {
  const { isEnabled, currentMood, isInteracting, personality, animationIntensity, triggerInteraction } = useCatThemeStore();

  if (showOnlyWhenEnabled && !isEnabled) return null;

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  const positionClasses = {
    corner: 'fixed bottom-20 right-4 z-40',
    inline: 'relative',
    float: 'absolute bottom-2 right-2',
  };

  const getIdleAnimation = () => {
    if (animationIntensity === 'low') return {};
    
    const baseAnimation = {
      y: [0, -3, 0],
      transition: {
        duration: personality === 'playful' ? 2 : 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    };

    if (currentMood === 'sleepy') {
      return {
        rotate: [0, 2, 0, -2, 0],
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      };
    }

    return baseAnimation;
  };

  const getInteractionAnimation = () => {
    if (currentMood === 'celebrating') {
      return {
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.5, repeat: 2 },
      };
    }
    if (currentMood === 'curious') {
      return {
        rotate: [0, 15, 0],
        transition: { duration: 0.3 },
      };
    }
    return {
      scale: [1, 1.05, 1],
      transition: { duration: 0.3 },
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`${positionClasses[position]} ${sizeClasses[size]} cursor-pointer select-none`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          ...(isInteracting ? getInteractionAnimation() : getIdleAnimation()),
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={triggerInteraction}
      >
        {/* Glow effect */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-cat-glow/30 blur-xl"
          animate={{ 
            opacity: currentMood === 'celebrating' ? [0.3, 0.6, 0.3] : 0.2,
            scale: currentMood === 'celebrating' ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Cat face */}
        <div className="relative z-10">
          <CatFace mood={currentMood} />
        </div>

        {/* Sparkles for celebrating */}
        {currentMood === 'celebrating' && animationIntensity !== 'low' && (
          <>
            <motion.span
              className="absolute -top-2 -right-1 text-xs"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: -10 }}
              transition={{ duration: 1, repeat: 2 }}
            >
              ✨
            </motion.span>
            <motion.span
              className="absolute -top-1 -left-2 text-xs"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: [0, 1, 0], y: -8 }}
              transition={{ duration: 1, delay: 0.3, repeat: 2 }}
            >
              🌟
            </motion.span>
          </>
        )}

        {/* Tail for inline/float */}
        {position !== 'corner' && (
          <motion.div
            className="absolute -bottom-1 -right-3 w-6 h-2 bg-foreground/20 rounded-full origin-left"
            animate={{ 
              rotate: personality === 'playful' ? [0, 20, 0, -10, 0] : [0, 5, 0],
            }}
            transition={{ 
              duration: personality === 'playful' ? 1 : 3, 
              repeat: Infinity 
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// Dual cats for Sync Mode
export function SyncModeCats() {
  const { isEnabled, currentMood, animationIntensity } = useCatThemeStore();

  if (!isEnabled) return null;

  return (
    <div className="flex items-center justify-center gap-1">
      <motion.div 
        className="w-8 h-8"
        animate={{ 
          x: animationIntensity !== 'low' ? [0, 2, 0] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
      >
        <CatFace mood={currentMood} />
      </motion.div>
      
      {/* Heart between cats */}
      <motion.span 
        className="text-couple text-xs mx-1"
        animate={{ 
          scale: animationIntensity !== 'low' ? [1, 1.2, 1] : 1,
          opacity: [0.7, 1, 0.7],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        💕
      </motion.span>
      
      <motion.div 
        className="w-8 h-8 -scale-x-100"
        animate={{ 
          x: animationIntensity !== 'low' ? [0, -2, 0] : 0,
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <CatFace mood={currentMood} />
      </motion.div>
    </div>
  );
}
