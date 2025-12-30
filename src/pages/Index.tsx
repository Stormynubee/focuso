import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { OnboardingScreen } from '@/components/screens/OnboardingScreen';
import { Navigation } from '@/components/layout/Navigation';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { DashboardScreen, FocusScreen, AnalyticsScreen } from '@/components/screens/MainScreens';
import { ProfileScreen } from '@/components/screens/ProfileScreen';
import { useStudyReminders } from '@/hooks/useStudyReminders';

const Index = () => {
  const { isOnboarded } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Initialize study reminders
  useStudyReminders();

  if (!isOnboarded) {
    return <OnboardingScreen />;
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
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
            {activeTab === 'analytics' && <AnalyticsScreen />}
            {activeTab === 'profile' && <ProfileScreen />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
