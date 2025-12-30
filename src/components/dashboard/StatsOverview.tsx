import { motion } from 'framer-motion';
import { 
  Clock, 
  AlertTriangle, 
  Target, 
  Flame,
  TrendingUp,
  Sparkles 
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { useAppStore } from '@/store/useAppStore';

export function StatsOverview() {
  const { 
    user,
    getTodayStudyTime, 
    getTodayDistractionTime, 
    getTodayFocusRatio,
    getPomodoroStreak 
  } = useAppStore();

  const studyTime = getTodayStudyTime();
  const distractionTime = getTodayDistractionTime();
  const focusRatio = getTodayFocusRatio();
  const streak = getPomodoroStreak();

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hrs > 0) {
      return { value: hrs, suffix: 'h', subValue: mins, subSuffix: 'm' };
    }
    return { value: mins, suffix: 'm', subValue: seconds % 60, subSuffix: 's' };
  };

  const studyFormatted = formatTime(studyTime);
  const distractionFormatted = formatTime(distractionTime);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-3xl font-display font-bold mb-1">
          {getGreeting()}, <span className="gradient-text">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          {user?.goal ? `Focus on: ${user.goal}` : 'Ready to focus today?'}
        </p>
      </motion.div>

      {/* Main stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Study Time */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-study/20">
                <Clock className="w-4 h-4 text-study" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Study Time
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter
                value={studyFormatted.value}
                className="text-3xl font-display font-bold text-study"
              />
              <span className="text-lg text-study/70">{studyFormatted.suffix}</span>
              {studyFormatted.subValue > 0 && (
                <>
                  <AnimatedCounter
                    value={studyFormatted.subValue}
                    className="text-xl font-display font-bold text-study/70 ml-1"
                  />
                  <span className="text-sm text-study/50">{studyFormatted.subSuffix}</span>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Distraction Time */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-distraction/20">
                <AlertTriangle className="w-4 h-4 text-distraction" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Distractions
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter
                value={distractionFormatted.value}
                className="text-3xl font-display font-bold text-distraction"
              />
              <span className="text-lg text-distraction/70">{distractionFormatted.suffix}</span>
              {distractionFormatted.subValue > 0 && (
                <>
                  <AnimatedCounter
                    value={distractionFormatted.subValue}
                    className="text-xl font-display font-bold text-distraction/70 ml-1"
                  />
                  <span className="text-sm text-distraction/50">{distractionFormatted.subSuffix}</span>
                </>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Focus Ratio */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Focus Ratio
              </span>
            </div>
            <div className="flex items-center gap-4">
              <CircularProgress
                value={focusRatio}
                size={60}
                strokeWidth={6}
                color={focusRatio >= 70 ? 'success' : focusRatio >= 40 ? 'warning' : 'destructive'}
                showValue={false}
              />
              <div>
                <AnimatedCounter
                  value={focusRatio}
                  suffix="%"
                  className="text-3xl font-display font-bold"
                />
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Streak */}
        <motion.div variants={itemVariants}>
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-warning/20">
                <Flame className="w-4 h-4 text-warning" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Streak
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <AnimatedCounter
                value={streak}
                className="text-3xl font-display font-bold text-warning"
              />
              <span className="text-lg text-warning/70">days</span>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
