import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Timer, 
  BarChart3, 
  User,
  Menu,
  X,
  Sparkles,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'focus', label: 'Focus', icon: Timer },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'profile', label: 'Profile', icon: User },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-20 flex-col items-center py-8 glass-card rounded-none border-r border-border/50 z-50">
        {/* Logo */}
        <motion.div
          className="mb-8"
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Nav Items */}
        <div className="flex flex-col gap-4 flex-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'relative w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                  isActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-card rounded-none border-t border-border/50 z-50 px-4 py-2 safe-area-inset-bottom">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveIndicator"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
