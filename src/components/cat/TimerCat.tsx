import { motion } from 'framer-motion';
import { useCatThemeStore } from '@/store/useCatThemeStore';

interface TimerCatProps {
  progress: number; // 0 to 100
  radius: number;
  centerX: number;
  centerY: number;
  state: 'idle' | 'focus' | 'break' | 'paused';
}

const CAT_COLORS = {
  default: { body: '#2A2A35', accent: '#F5E6D3' },
  orange: { body: '#E8956A', accent: '#FDF8F5' },
  gray: { body: '#8A8A96', accent: '#FDF8F5' },
  calico: { body: '#E8956A', accent: '#2A2A35' },
};

export function TimerCat({ progress, radius, centerX, centerY, state }: TimerCatProps) {
  const { isEnabled, timerCatEnabled, timerCatStyle, timerCatMode, animationIntensity } = useCatThemeStore();
  
  if (!isEnabled || !timerCatEnabled) return null;
  
  const colors = CAT_COLORS[timerCatStyle];
  
  // Calculate position along the circle
  const angle = ((progress / 100) * 360 - 90) * (Math.PI / 180);
  const catX = centerX + Math.cos(angle) * (radius + 8);
  const catY = centerY + Math.sin(angle) * (radius + 8);
  
  // Cat rotation to follow the path
  const rotation = (progress / 100) * 360;
  
  const animationSpeed = animationIntensity === 'low' ? 1.5 : animationIntensity === 'medium' ? 1 : 0.6;
  
  // Determine cat animation based on state
  const getCatState = () => {
    switch (state) {
      case 'break':
        return 'sleeping';
      case 'paused':
        return 'curious';
      case 'focus':
        return 'walking';
      default:
        return 'sitting';
    }
  };
  
  const catState = getCatState();
  const isWalking = timerCatMode === 'walking' && catState === 'walking';
  const isSleeping = catState === 'sleeping';
  
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ 
        transform: `translate(${catX}px, ${catY}px) rotate(${rotation + 90}deg)`,
        transformOrigin: 'center',
      }}
    >
      {/* Cat body */}
      <g transform="translate(-12, -12)">
        {/* Body */}
        <motion.ellipse
          cx="12"
          cy="14"
          rx="8"
          ry="6"
          fill={colors.body}
          animate={isWalking ? {
            ry: [6, 5, 6],
            cy: [14, 15, 14],
          } : {}}
          transition={{ duration: animationSpeed * 0.3, repeat: Infinity }}
        />
        
        {/* Head */}
        <motion.circle
          cx="12"
          cy="7"
          r="6"
          fill={colors.body}
          animate={isSleeping ? {
            y: [0, 1, 0],
          } : catState === 'curious' ? {
            rotate: [-5, 5, -5],
          } : {}}
          transition={{ duration: animationSpeed * 2, repeat: Infinity }}
        />
        
        {/* Ears */}
        <path d="M7 4 L9 1 L11 4" fill={colors.body} />
        <path d="M13 4 L15 1 L17 4" fill={colors.body} />
        <path d="M8 3.5 L9.5 1.5 L10.5 3.5" fill={colors.accent} />
        <path d="M13.5 3.5 L14.5 1.5 L16 3.5" fill={colors.accent} />
        
        {/* Eyes */}
        {isSleeping ? (
          // Closed eyes (sleeping)
          <>
            <path d="M9 6.5 Q10 7.5, 11 6.5" stroke={colors.accent} strokeWidth="1" fill="none" />
            <path d="M13 6.5 Q14 7.5, 15 6.5" stroke={colors.accent} strokeWidth="1" fill="none" />
            {/* Zzz */}
            <motion.text
              x="18"
              y="2"
              fontSize="5"
              fill={colors.accent}
              opacity={0.7}
              animate={{ y: [2, -1, 2], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              z
            </motion.text>
          </>
        ) : (
          // Open eyes
          <>
            <motion.circle
              cx="10"
              cy="6.5"
              r="1.5"
              fill={colors.accent}
              animate={catState === 'curious' ? { cx: [9.5, 10.5, 9.5] } : {}}
              transition={{ duration: animationSpeed * 1.5, repeat: Infinity }}
            />
            <motion.circle
              cx="14"
              cy="6.5"
              r="1.5"
              fill={colors.accent}
              animate={catState === 'curious' ? { cx: [13.5, 14.5, 13.5] } : {}}
              transition={{ duration: animationSpeed * 1.5, repeat: Infinity }}
            />
            {/* Pupils */}
            <circle cx="10" cy="6.5" r="0.7" fill={colors.body} />
            <circle cx="14" cy="6.5" r="0.7" fill={colors.body} />
          </>
        )}
        
        {/* Nose */}
        <ellipse cx="12" cy="8.5" rx="0.8" ry="0.5" fill="#FFCDB2" />
        
        {/* Whiskers */}
        <line x1="6" y1="8" x2="3" y2="7" stroke={colors.accent} strokeWidth="0.5" opacity={0.5} />
        <line x1="6" y1="9" x2="3" y2="9" stroke={colors.accent} strokeWidth="0.5" opacity={0.5} />
        <line x1="18" y1="8" x2="21" y2="7" stroke={colors.accent} strokeWidth="0.5" opacity={0.5} />
        <line x1="18" y1="9" x2="21" y2="9" stroke={colors.accent} strokeWidth="0.5" opacity={0.5} />
        
        {/* Tail */}
        <motion.path
          d="M4 14 Q2 12, 1 16 Q0 20, 3 18"
          stroke={colors.body}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          animate={isWalking ? {
            d: [
              "M4 14 Q2 12, 1 16 Q0 20, 3 18",
              "M4 14 Q2 14, 0 14 Q-2 14, 0 12",
              "M4 14 Q2 12, 1 16 Q0 20, 3 18",
            ]
          } : isSleeping ? {
            d: "M4 14 Q2 16, 1 18 Q0 20, 2 20"
          } : {}}
          transition={{ duration: animationSpeed * 0.5, repeat: Infinity }}
        />
        
        {/* Legs (walking animation) */}
        {isWalking && (
          <>
            <motion.line
              x1="8"
              y1="18"
              x2="7"
              y2="22"
              stroke={colors.body}
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ x2: [7, 9, 7] }}
              transition={{ duration: animationSpeed * 0.3, repeat: Infinity }}
            />
            <motion.line
              x1="12"
              y1="18"
              x2="13"
              y2="22"
              stroke={colors.body}
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ x2: [13, 11, 13] }}
              transition={{ duration: animationSpeed * 0.3, repeat: Infinity, delay: 0.15 }}
            />
            <motion.line
              x1="16"
              y1="18"
              x2="17"
              y2="22"
              stroke={colors.body}
              strokeWidth="2"
              strokeLinecap="round"
              animate={{ x2: [17, 15, 17] }}
              transition={{ duration: animationSpeed * 0.3, repeat: Infinity }}
            />
          </>
        )}
      </g>
    </motion.g>
  );
}