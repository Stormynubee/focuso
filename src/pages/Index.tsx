import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { Navigation } from '@/components/layout/Navigation';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { DashboardScreen, FocusScreen, AnalyticsScreen } from '@/components/screens/MainScreens';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { CommunityScreen } from '@/components/screens/CommunityScreen';
import { CoupleScreen } from '@/components/screens/CoupleScreen';
import { TasksScreen } from '@/components/screens/TasksScreen';
import { SpotifyCat } from '@/components/cat/SpotifyCat';
import { CatCompanion } from '@/components/cat/CatCompanion';
import { PeekingCat } from '@/components/cat/CatElements';
import { PageCat } from '@/components/cat/PageCat';
import { useStudyReminders } from '@/hooks/useStudyReminders';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

const Index = () => {
  const { isOnboarded } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Initialize study reminders
  useStudyReminders();

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  // Map tab to page cat type
  const getPageCatType = () => {
    switch (activeTab) {
      case 'dashboard': return 'dashboard';
      case 'focus': return 'focus';
      case 'analytics': return 'analytics';
      case 'community': return 'leaderboard';
      case 'profile': return 'profile';
      case 'couple': return 'couple';
      default: return 'dashboard';
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Auth prompt for non-logged in users */}
      {!loading && !user && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 md:right-8 z-40"
        >
          <Button
            variant="glow"
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign in for full features
          </Button>
        </motion.div>
      )}
      
      <main className="md:ml-20 pb-24 md:pb-8 p-4 md:p-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <DashboardScreen />}
            {activeTab === 'focus' && <FocusScreen />}
            {activeTab === 'tasks' && <TasksScreen />}
            {activeTab === 'couple' && <CoupleScreen />}
            {activeTab === 'community' && <CommunityScreen />}
            {activeTab === 'analytics' && <AnalyticsScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
        
        {/* Page-specific cat */}
        <div className="fixed bottom-28 left-4 md:left-24 z-30">
          <PageCat page={getPageCatType() as any} />
        </div>
      </main>
      
      {/* Draggable Spotify Cat (replaces SpotifyMiniPlayer) */}
      <SpotifyCat />
      
      {/* Cat Theme Companion */}
      <CatCompanion position="corner" />
      <PeekingCat position="bottom-left" />
    </div>
  );
};

export default Index;
