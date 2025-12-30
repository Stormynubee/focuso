import { motion } from 'framer-motion';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { StudyTracker } from '@/components/study/StudyTracker';
import { DistractionTracker } from '@/components/distraction/DistractionTracker';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';

export function DashboardScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <StatsOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StudyTracker />
        <DistractionTracker />
      </div>
    </motion.div>
  );
}

export function FocusScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Focus Mode
        </h1>
        <p className="text-muted-foreground">
          Deep work starts here
        </p>
      </div>
      <PomodoroTimer />
    </motion.div>
  );
}

export function AnalyticsScreen() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold gradient-text mb-2">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Track your progress over time
        </p>
      </div>
      <StatsOverview />
      <WeeklyChart />
    </motion.div>
  );
}
