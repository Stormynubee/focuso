import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, RotateCcw, Users, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

const FOCUS_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

export function StudyTogetherPomodoro() {
  const { isConnected, partner, studyTogetherActive, partnerJoined, setStudyTogetherActive, setStudyTogetherState, setPartnerJoined, updatePartnerPomodoro, setMyPomodoroActive } = useCoupleStore();
  const { currentDistraction } = useAppStore();
  
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [completedSessions, setCompletedSessions] = useState(0);
  const [isPausedByDistraction, setIsPausedByDistraction] = useState(false);

  const isDistracted = currentDistraction !== null;
  const maxTime = sessionType === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((maxTime - timeLeft) / maxTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timeLeft > 0 && !isPausedByDistraction) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      if (sessionType === 'focus') {
        setSessionType('break');
        setTimeLeft(BREAK_TIME);
        setCompletedSessions(prev => prev + 1);
        toast.success('Focus session complete! Time for a break 💕');
      } else {
        setSessionType('focus');
        setTimeLeft(FOCUS_TIME);
        toast.success('Break over! Ready to focus together? 🌟');
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, isPausedByDistraction]);

  useEffect(() => {
    if (isDistracted && isRunning && studyTogetherActive) {
      setIsPausedByDistraction(true);
      setIsRunning(false);
      toast.warning('Pomodoro paused - distraction detected 💕');
    }
  }, [isDistracted, isRunning, studyTogetherActive]);

  useEffect(() => {
    setMyPomodoroActive(isRunning && studyTogetherActive);
  }, [isRunning, studyTogetherActive, setMyPomodoroActive]);

  const handleStartStudyTogether = () => {
    setStudyTogetherActive(true);
    setStudyTogetherState('invited');
    toast.success('Study invite sent to your partner! 💕');
    setTimeout(() => {
      setPartnerJoined(true);
      setStudyTogetherState('active');
      updatePartnerPomodoro(true);
      toast.success(`${partner?.name || 'Your partner'} joined the session! 🎉`);
    }, 2000);
  };

  const handleJoinSession = () => {
    setStudyTogetherActive(true);
    setStudyTogetherState('active');
    setPartnerJoined(true);
    setIsRunning(true);
    toast.success('Joined study session! Let\'s focus together 💕');
  };

  const handlePlayPause = () => {
    if (isPausedByDistraction) setIsPausedByDistraction(false);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setTimeLeft(maxTime);
    setIsRunning(false);
    setIsPausedByDistraction(false);
  };

  const handleEndSession = () => {
    setStudyTogetherActive(false);
    setStudyTogetherState('idle');
    setPartnerJoined(false);
    setIsRunning(false);
    setTimeLeft(FOCUS_TIME);
    setSessionType('focus');
    setIsPausedByDistraction(false);
    updatePartnerPomodoro(false);
    toast.info('Study session ended');
  };

  if (!isConnected) return null;

  if (partner?.pomodoroActive && !studyTogetherActive) {
    return (
      <GlassCard className="p-6 love-border">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <motion.div className="inline-flex p-4 rounded-full bg-couple/20" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <Heart className="w-8 h-8 text-couple" />
          </motion.div>
          <div>
            <h3 className="text-lg font-display font-semibold gradient-text">Study Together Invite! 💕</h3>
            <p className="text-sm text-muted-foreground mt-1">{partner.name} wants to focus together</p>
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="glow" onClick={handleJoinSession} className="gap-2"><Users className="w-4 h-4" />Join Now</Button>
            <Button variant="ghost">Later</Button>
          </div>
        </motion.div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div className="p-2 rounded-xl bg-couple/20" animate={studyTogetherActive && isRunning ? { scale: [1, 1.05, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
            <Users className="w-5 h-5 text-couple" />
          </motion.div>
          <div>
            <h3 className="text-lg font-display font-semibold">Study Together</h3>
            <p className="text-xs text-muted-foreground">Focus with your partner 💕</p>
          </div>
        </div>
        {studyTogetherActive && <Button variant="ghost" size="sm" onClick={handleEndSession} className="text-muted-foreground">End</Button>}
      </div>

      {!studyTogetherActive ? (
        <motion.div className="text-center space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-sm text-muted-foreground">Start a synchronized Pomodoro session with your partner</p>
          <Button variant="glow" onClick={handleStartStudyTogether} className="gap-2"><Sparkles className="w-4 h-4" />Start Study Together</Button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-4 p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2">
              <span className="text-xl">{partner?.avatarEmoji || '💕'}</span>
              <span className="text-sm font-medium">{partner?.name}</span>
            </div>
            <motion.div className={`w-3 h-3 rounded-full ${partnerJoined ? 'bg-success' : 'bg-muted'}`} animate={partnerJoined ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: Infinity }} />
            <span className="text-xs text-muted-foreground">{partnerJoined ? 'Focusing together' : 'Waiting to join...'}</span>
          </div>

          <AnimatePresence>
            {isPausedByDistraction && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-3 rounded-xl bg-distraction/10 border border-distraction/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-distraction" />
                <span className="text-sm text-distraction">Paused: Distraction detected. Resume when ready 💕</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
                <circle cx="90" cy="90" r="80" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/30" />
                <circle cx="90" cy="90" r="80" fill="none" strokeWidth="8" strokeLinecap="round" className={sessionType === 'focus' ? 'stroke-couple' : 'stroke-accent'} strokeDasharray={502.65} strokeDashoffset={502.65 - (progress / 100) * 502.65} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-display font-bold">{formatTime(timeLeft)}</span>
                <span className={`text-xs font-medium ${sessionType === 'focus' ? 'text-couple' : 'text-accent'}`}>{sessionType === 'focus' ? '🎯 Focus' : '☕ Break'}</span>
              </div>
            </div>
            {partnerJoined && isRunning && sessionType === 'focus' && (
              <motion.div className="mt-4 flex items-center gap-2 text-couple" animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Heart className="w-4 h-4" /><span className="text-xs">Studying together 💕</span><Heart className="w-4 h-4" />
              </motion.div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button type="button" variant="ghost" size="icon" onClick={handleReset} className="w-12 h-12 rounded-full"><RotateCcw className="w-5 h-5" /></Button>
            <Button type="button" variant="glow" size="icon" onClick={handlePlayPause} className="w-16 h-16 rounded-full">{isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}</Button>
            <div className="w-12 h-12 flex items-center justify-center"><span className="text-sm text-muted-foreground">🍅 {completedSessions}</span></div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
