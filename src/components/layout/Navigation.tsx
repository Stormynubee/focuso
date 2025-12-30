import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  CatFaceIcon, 
  CatDashboardIcon, 
  CatTimerIcon, 
  CatTaskIcon, 
  CatCoupleIcon, 
  CatCommunityIcon, 
  CatChartIcon, 
  CatProfileIcon,
  PawIcon 
} from '@/components/ui/CatIcons';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', Icon: CatDashboardIcon },
  { id: 'focus', label: 'Focus', Icon: CatTimerIcon },
  { id: 'tasks', label: 'Tasks', Icon: CatTaskIcon },
  { id: 'couple', label: 'Sync', Icon: CatCoupleIcon },
  { id: 'community', label: 'Community', Icon: CatCommunityIcon },
  { id: 'analytics', label: 'Analytics', Icon: CatChartIcon },
  { id: 'profile', label: 'Profile', Icon: CatProfileIcon },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 glass-card-simple rounded-none border-r border-border/50 z-50">
        {/* Cat Logo */}
        <motion.div
          className="mb-8"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/25">
            <CatFaceIcon size={28} className="text-primary-foreground" />
          </div>
        </motion.div>

        {/* Nav Items */}
        <div className="flex flex-col gap-3 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.Icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
                  isActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={22} />
                {isActive && (
                  <>
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                    {/* Paw print indicator */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                    >
                      <PawIcon size={10} className="text-primary opacity-60" />
                    </motion.div>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation - Cat ear border */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 safe-area-inset-bottom">
        {/* Cat ear decorations on top */}
        <div className="absolute -top-3 left-6 w-6 h-6 bg-card border border-border/50 rounded-tl-2xl transform -rotate-12 z-10" />
        <div className="absolute -top-3 right-6 w-6 h-6 bg-card border border-border/50 rounded-tr-2xl transform rotate-12 z-10" />
        
        <div className="glass-card-simple border border-border/50 rounded-3xl px-2 py-2">
          <div className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.Icon;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all',
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <PawIcon size={8} className="text-primary" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}