import { motion } from 'framer-motion';
import { useCatThemeStore } from '@/store/useCatThemeStore';

type PageType = 'dashboard' | 'focus' | 'analytics' | 'leaderboard' | 'profile' | 'couple' | 'chat';

interface PageCatProps {
  page: PageType;
  className?: string;
}

const CAT_BEHAVIORS: Record<PageType, {
  description: string;
  animation: any;
  pose: 'sitting' | 'observing' | 'listening' | 'grooming' | 'proud' | 'loving' | 'studying';
}> = {
  dashboard: {
    description: 'Sitting attentively',
    animation: { y: [0, -3, 0] },
    pose: 'sitting',
  },
  focus: {
    description: 'Studying alongside',
    animation: { rotate: [0, 0, 0] },
    pose: 'studying',
  },
  analytics: {
    description: 'Observing data',
    animation: { x: [0, 2, -2, 0] },
    pose: 'observing',
  },
  leaderboard: {
    description: 'Proud sitting',
    animation: { scale: [1, 1.02, 1] },
    pose: 'proud',
  },
  profile: {
    description: 'Grooming',
    animation: { rotate: [-2, 2, -2] },
    pose: 'grooming',
  },
  couple: {
    description: 'Loving interaction',
    animation: { y: [0, -2, 0] },
    pose: 'loving',
  },
  chat: {
    description: 'Listening',
    animation: { rotate: [0, 5, 0, -5, 0] },
    pose: 'listening',
  },
};

export function PageCat({ page, className = '' }: PageCatProps) {
  const { isEnabled, pageCats, animationIntensity, personality } = useCatThemeStore();
  
  if (!isEnabled || !pageCats[page]) return null;
  
  const behavior = CAT_BEHAVIORS[page];
  const animSpeed = animationIntensity === 'low' ? 4 : animationIntensity === 'medium' ? 2.5 : 1.5;
  
  const getCatColor = () => {
    switch (personality) {
      case 'calm': return { body: '#2A2A35', accent: '#F5E6D3' };
      case 'playful': return { body: '#E8956A', accent: '#FDF8F5' };
      case 'sleepy': return { body: '#8A8A96', accent: '#FDF8F5' };
      default: return { body: '#2A2A35', accent: '#F5E6D3' };
    }
  };
  
  const colors = getCatColor();
  
  const renderPose = () => {
    switch (behavior.pose) {
      case 'sitting':
        return (
          <g>
            {/* Body */}
            <ellipse cx="30" cy="45" rx="20" ry="15" fill={colors.body} />
            {/* Head */}
            <circle cx="30" cy="25" r="15" fill={colors.body} />
            {/* Ears */}
            <path d="M18 15 L22 2 L28 12" fill={colors.body} />
            <path d="M32 12 L38 2 L42 15" fill={colors.body} />
            <path d="M20 14 L23 5 L26 12" fill={colors.accent} />
            <path d="M34 12 L37 5 L40 14" fill={colors.accent} />
            {/* Eyes */}
            <motion.circle
              cx="24" cy="23" r="3"
              fill={colors.accent}
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            />
            <motion.circle
              cx="36" cy="23" r="3"
              fill={colors.accent}
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            />
            <circle cx="24" cy="23" r="1.5" fill={colors.body} />
            <circle cx="36" cy="23" r="1.5" fill={colors.body} />
            {/* Nose & mouth */}
            <ellipse cx="30" cy="30" rx="2" ry="1.5" fill="#FFCDB2" />
            <path d="M26 33 Q30 37, 34 33" stroke={colors.accent} strokeWidth="1.5" fill="none" />
            {/* Tail */}
            <motion.path
              d="M10 45 Q5 40, 8 35 Q12 30, 15 35"
              stroke={colors.body}
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              animate={{ d: ["M10 45 Q5 40, 8 35 Q12 30, 15 35", "M10 45 Q3 42, 5 38 Q8 32, 12 36", "M10 45 Q5 40, 8 35 Q12 30, 15 35"] }}
              transition={{ duration: animSpeed * 1.5, repeat: Infinity }}
            />
          </g>
        );
        
      case 'observing':
        return (
          <g>
            {/* Body leaning forward */}
            <ellipse cx="30" cy="48" rx="18" ry="12" fill={colors.body} />
            {/* Head tilted */}
            <motion.g
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: animSpeed, repeat: Infinity }}
              style={{ transformOrigin: '30px 25px' }}
            >
              <circle cx="30" cy="25" r="14" fill={colors.body} />
              {/* Ears */}
              <path d="M18 16 L22 4 L27 13" fill={colors.body} />
              <path d="M33 13 L38 4 L42 16" fill={colors.body} />
              {/* Wide curious eyes */}
              <circle cx="24" cy="23" r="4" fill={colors.accent} />
              <circle cx="36" cy="23" r="4" fill={colors.accent} />
              <motion.circle
                cx="24" cy="23" r="2"
                fill={colors.body}
                animate={{ cx: [23, 25, 23] }}
                transition={{ duration: animSpeed * 0.8, repeat: Infinity }}
              />
              <motion.circle
                cx="36" cy="23" r="2"
                fill={colors.body}
                animate={{ cx: [35, 37, 35] }}
                transition={{ duration: animSpeed * 0.8, repeat: Infinity }}
              />
              <ellipse cx="30" cy="30" rx="2" ry="1.5" fill="#FFCDB2" />
            </motion.g>
          </g>
        );
        
      case 'proud':
        return (
          <g>
            {/* Upright proud body */}
            <ellipse cx="30" cy="50" rx="16" ry="10" fill={colors.body} />
            {/* Head held high */}
            <circle cx="30" cy="22" r="14" fill={colors.body} />
            {/* Ears perked */}
            <path d="M18 13 L24 0 L28 11" fill={colors.body} />
            <path d="M32 11 L36 0 L42 13" fill={colors.body} />
            <path d="M20 12 L24 3 L26 11" fill={colors.accent} />
            <path d="M34 11 L36 3 L40 12" fill={colors.accent} />
            {/* Confident eyes */}
            <path d="M21 21 Q24 18, 27 21" stroke={colors.accent} strokeWidth="2" fill="none" />
            <path d="M33 21 Q36 18, 39 21" stroke={colors.accent} strokeWidth="2" fill="none" />
            <ellipse cx="30" cy="27" rx="2" ry="1.5" fill="#FFCDB2" />
            <path d="M26 30 Q30 34, 34 30" stroke={colors.accent} strokeWidth="1.5" fill="none" />
            {/* Crown effect */}
            <motion.path
              d="M22 5 L25 -2 L30 3 L35 -2 L38 5"
              stroke="#FFD700"
              strokeWidth="2"
              fill="none"
              opacity={0.6}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: animSpeed, repeat: Infinity }}
            />
          </g>
        );
        
      case 'grooming':
        return (
          <g>
            {/* Body curled */}
            <ellipse cx="32" cy="48" rx="20" ry="12" fill={colors.body} />
            {/* Head turned */}
            <circle cx="26" cy="28" r="14" fill={colors.body} />
            {/* Ears */}
            <path d="M14 20 L18 8 L24 17" fill={colors.body} />
            <path d="M28 17 L34 8 L38 20" fill={colors.body} />
            {/* Closed relaxed eyes */}
            <path d="M20 26 Q23 24, 26 26" stroke={colors.accent} strokeWidth="2" fill="none" />
            <path d="M28 26 Q31 24, 34 26" stroke={colors.accent} strokeWidth="2" fill="none" />
            <ellipse cx="26" cy="32" rx="2" ry="1.5" fill="#FFCDB2" />
            {/* Paw grooming */}
            <motion.ellipse
              cx="40" cy="35"
              rx="6" ry="4"
              fill={colors.body}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: animSpeed * 0.5, repeat: Infinity }}
            />
          </g>
        );
        
      case 'loving':
        return (
          <g>
            {/* Two cats */}
            {/* Cat 1 */}
            <ellipse cx="22" cy="48" rx="14" ry="10" fill={colors.body} />
            <circle cx="22" cy="30" r="11" fill={colors.body} />
            <path d="M13 23 L16 13 L21 21" fill={colors.body} />
            <path d="M23 21 L28 13 L31 23" fill={colors.body} />
            <circle cx="18" cy="28" r="2" fill={colors.accent} />
            <circle cx="26" cy="28" r="2" fill={colors.accent} />
            <ellipse cx="22" cy="33" rx="1.5" ry="1" fill="#FFCDB2" />
            
            {/* Cat 2 */}
            <ellipse cx="42" cy="48" rx="14" ry="10" fill="#E8956A" />
            <circle cx="42" cy="30" r="11" fill="#E8956A" />
            <path d="M33 23 L36 13 L41 21" fill="#E8956A" />
            <path d="M43 21 L48 13 L51 23" fill="#E8956A" />
            <circle cx="38" cy="28" r="2" fill="#FDF8F5" />
            <circle cx="46" cy="28" r="2" fill="#FDF8F5" />
            <ellipse cx="42" cy="33" rx="1.5" ry="1" fill="#FFCDB2" />
            
            {/* Heart between */}
            <motion.path
              d="M30 20 C30 15, 35 15, 35 20 C35 15, 40 15, 40 20 C40 28, 35 32, 35 32 C35 32, 30 28, 30 20"
              fill="#E8B4B8"
              opacity={0.8}
              animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: animSpeed * 0.8, repeat: Infinity }}
              style={{ transformOrigin: '35px 24px' }}
            />
          </g>
        );
        
      case 'listening':
        return (
          <g>
            {/* Body */}
            <ellipse cx="30" cy="48" rx="18" ry="12" fill={colors.body} />
            {/* Head with one ear perked */}
            <circle cx="30" cy="26" r="14" fill={colors.body} />
            {/* Ears - one up, one tilted */}
            <motion.path
              d="M18 18 L22 4 L28 15"
              fill={colors.body}
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: animSpeed * 0.6, repeat: Infinity }}
              style={{ transformOrigin: '23px 11px' }}
            />
            <path d="M32 15 L38 4 L42 18" fill={colors.body} />
            {/* Alert eyes */}
            <circle cx="24" cy="24" r="3" fill={colors.accent} />
            <circle cx="36" cy="24" r="3" fill={colors.accent} />
            <circle cx="24" cy="24" r="1.5" fill={colors.body} />
            <circle cx="36" cy="24" r="1.5" fill={colors.body} />
            <ellipse cx="30" cy="30" rx="2" ry="1.5" fill="#FFCDB2" />
            {/* Sound waves */}
            <motion.path
              d="M50 24 Q55 20, 50 16"
              stroke={colors.accent}
              strokeWidth="1.5"
              fill="none"
              opacity={0.5}
              animate={{ opacity: [0.3, 0.7, 0.3], x: [0, 3, 0] }}
              transition={{ duration: animSpeed * 0.5, repeat: Infinity }}
            />
          </g>
        );
        
      case 'studying':
        return (
          <g>
            {/* Body hunched over */}
            <ellipse cx="30" cy="50" rx="18" ry="10" fill={colors.body} />
            {/* Head looking down */}
            <circle cx="30" cy="30" r="14" fill={colors.body} />
            {/* Ears */}
            <path d="M18 24 L22 12 L27 22" fill={colors.body} />
            <path d="M33 22 L38 12 L42 24" fill={colors.body} />
            {/* Focused eyes */}
            <motion.circle
              cx="24" cy="28" r="2.5"
              fill={colors.accent}
              animate={{ scaleY: [1, 0.8, 1] }}
              transition={{ duration: animSpeed * 2, repeat: Infinity }}
            />
            <motion.circle
              cx="36" cy="28" r="2.5"
              fill={colors.accent}
              animate={{ scaleY: [1, 0.8, 1] }}
              transition={{ duration: animSpeed * 2, repeat: Infinity }}
            />
            <circle cx="24" cy="28" r="1.2" fill={colors.body} />
            <circle cx="36" cy="28" r="1.2" fill={colors.body} />
            <ellipse cx="30" cy="34" rx="2" ry="1.5" fill="#FFCDB2" />
            {/* Book/tablet in front */}
            <rect x="18" y="55" width="24" height="8" rx="1" fill={colors.accent} opacity={0.3} />
            <line x1="22" y1="57" x2="38" y2="57" stroke={colors.body} strokeWidth="0.5" opacity={0.3} />
            <line x1="22" y1="59" x2="36" y2="59" stroke={colors.body} strokeWidth="0.5" opacity={0.3} />
            <line x1="22" y1="61" x2="32" y2="61" stroke={colors.body} strokeWidth="0.5" opacity={0.3} />
          </g>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      animate={behavior.animation}
      transition={{ duration: animSpeed, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg width="60" height="65" viewBox="0 0 60 65">
        {renderPose()}
      </svg>
    </motion.div>
  );
}