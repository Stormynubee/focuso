import { memo } from 'react';
import { motion } from 'framer-motion';
import { useCatThemeStore } from '@/store/useCatThemeStore';

type PageType = 'dashboard' | 'focus' | 'analytics' | 'leaderboard' | 'profile' | 'couple' | 'chat';

interface PageCatProps {
  page: PageType;
  className?: string;
}

const CAT_BEHAVIORS: Record<PageType, {
  animation: Record<string, number[]>;
  eyeState: 'open' | 'half' | 'closed';
}> = {
  dashboard: { animation: { y: [0, -2, 0] }, eyeState: 'open' },
  focus: { animation: { scale: [1, 1.01, 1] }, eyeState: 'half' },
  analytics: { animation: { rotate: [-2, 2, -2] }, eyeState: 'open' },
  leaderboard: { animation: { y: [0, -3, 0] }, eyeState: 'open' },
  profile: { animation: { rotate: [-1, 1, -1] }, eyeState: 'closed' },
  couple: { animation: { scale: [1, 1.02, 1] }, eyeState: 'open' },
  chat: { animation: { x: [-1, 1, -1] }, eyeState: 'open' },
};

// Memoized simple cat SVG to prevent unnecessary re-renders
const SimpleCat = memo(({ eyeState, colors }: { eyeState: 'open' | 'half' | 'closed'; colors: { body: string; accent: string } }) => (
  <svg width="50" height="55" viewBox="0 0 50 55">
    {/* Body */}
    <ellipse cx="25" cy="42" rx="16" ry="12" fill={colors.body} />
    {/* Head */}
    <circle cx="25" cy="22" r="14" fill={colors.body} />
    {/* Ears */}
    <path d="M13 14 L17 2 L23 12" fill={colors.body} />
    <path d="M27 12 L33 2 L37 14" fill={colors.body} />
    <path d="M15 13 L18 5 L21 12" fill={colors.accent} />
    <path d="M29 12 L32 5 L35 13" fill={colors.accent} />
    {/* Eyes */}
    {eyeState === 'open' && (
      <>
        <circle cx="19" cy="20" r="3" fill={colors.accent} />
        <circle cx="31" cy="20" r="3" fill={colors.accent} />
        <circle cx="19" cy="20" r="1.5" fill={colors.body} />
        <circle cx="31" cy="20" r="1.5" fill={colors.body} />
      </>
    )}
    {eyeState === 'half' && (
      <>
        <ellipse cx="19" cy="20" rx="3" ry="1.5" fill={colors.accent} />
        <ellipse cx="31" cy="20" rx="3" ry="1.5" fill={colors.accent} />
      </>
    )}
    {eyeState === 'closed' && (
      <>
        <path d="M16 20 Q19 18, 22 20" stroke={colors.accent} strokeWidth="2" fill="none" />
        <path d="M28 20 Q31 18, 34 20" stroke={colors.accent} strokeWidth="2" fill="none" />
      </>
    )}
    {/* Nose */}
    <ellipse cx="25" cy="26" rx="2" ry="1.5" fill="#FFCDB2" />
    {/* Mouth */}
    <path d="M22 29 Q25 32, 28 29" stroke={colors.accent} strokeWidth="1" fill="none" />
    {/* Tail */}
    <path d="M9 42 Q4 38, 6 32 Q8 28, 12 30" stroke={colors.body} strokeWidth="4" fill="none" strokeLinecap="round" />
  </svg>
));

SimpleCat.displayName = 'SimpleCat';

export const PageCat = memo(function PageCat({ page, className = '' }: PageCatProps) {
  const { isEnabled, pageCats, animationIntensity, personality } = useCatThemeStore();
  
  if (!isEnabled || !pageCats[page]) return null;
  
  const behavior = CAT_BEHAVIORS[page];
  const animSpeed = animationIntensity === 'low' ? 5 : animationIntensity === 'medium' ? 3 : 2;
  
  const colors = {
    calm: { body: '#2A2A35', accent: '#F5E6D3' },
    playful: { body: '#E8956A', accent: '#FDF8F5' },
    sleepy: { body: '#8A8A96', accent: '#FDF8F5' },
  }[personality] || { body: '#2A2A35', accent: '#F5E6D3' };
  
  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      animate={behavior.animation}
      transition={{ duration: animSpeed, repeat: Infinity, ease: 'easeInOut' }}
    >
      <SimpleCat eyeState={behavior.eyeState} colors={colors} />
    </motion.div>
  );
});