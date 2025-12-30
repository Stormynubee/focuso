import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';

type TimerState = 'idle' | 'focus' | 'break' | 'paused';

export function PomodoroTimer() {
  const { pomodoroSettings, addPomodoroSession, currentDistraction } = useAppStore();
  const { notifyPomodoroComplete } = useNotifications();
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.focusTime * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const prevStateRef = useRef<TimerState>('idle');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const totalTime = state === 'break' 
    ? pomodoroSettings.breakTime * 60 
    : pomodoroSettings.focusTime * 60;
  
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = 140;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    // Create a simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [soundEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if ((state === 'focus' || state === 'break') && !currentDistraction) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playSound();
            if (state === 'focus') {
              addPomodoroSession({
                focusTime: pomodoroSettings.focusTime,
                breakTime: pomodoroSettings.breakTime,
                completed: true,
                timestamp: new Date(),
              });
              setCompletedPomodoros((c) => c + 1);
              notifyPomodoroComplete(false); // Focus session complete
              setState('break');
              return pomodoroSettings.breakTime * 60;
            } else {
              notifyPomodoroComplete(true); // Break complete
              setState('idle');
              return pomodoroSettings.focusTime * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [state, currentDistraction, playSound, addPomodoroSession, pomodoroSettings, notifyPomodoroComplete]);

  // Auto-pause on distraction
  useEffect(() => {
    if (currentDistraction && state === 'focus') {
      setState('paused');
    }
  }, [currentDistraction, state]);

  const handleStart = () => {
    if (state === 'idle' || state === 'paused') {
      setState('focus');
    }
  };

  const handlePause = () => {
    if (state === 'focus' || state === 'break') {
      setState('paused');
    }
  };

  const handleReset = () => {
    setState('idle');
    setTimeLeft(pomodoroSettings.focusTime * 60);
  };

  const getStateColor = () => {
    switch (state) {
      case 'focus':
        return 'hsl(var(--primary))';
      case 'break':
        return 'hsl(var(--success))';
      case 'paused':
        return 'hsl(var(--warning))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getStateGlow = () => {
    switch (state) {
      case 'focus':
        return '0 0 60px hsl(var(--primary) / 0.4)';
      case 'break':
        return '0 0 60px hsl(var(--success) / 0.4)';
      case 'paused':
        return '0 0 60px hsl(var(--warning) / 0.4)';
      default:
        return 'none';
    }
  };

  return (
    <GlassCard className="p-8 flex flex-col items-center" hover={false}>
      {/* Timer Ring */}
      <div className="relative mb-8">
        <motion.svg
          width={320}
          height={320}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(${getStateGlow()})` }}
        >
          {/* Background circle */}
          <circle
            cx={160}
            cy={160}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={12}
            className="text-muted/20"
          />
          
          {/* Progress circle */}
          <motion.circle
            cx={160}
            cy={160}
            r={radius}
            fill="none"
            stroke={getStateColor()}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />

          {/* Glow effect circle */}
          {state === 'focus' && (
            <motion.circle
              cx={160}
              cy={160}
              r={radius}
              fill="none"
              stroke={getStateColor()}
              strokeWidth={4}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ 
                strokeDashoffset,
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ 
                strokeDashoffset: { duration: 0.5, ease: 'easeOut' },
                opacity: { duration: 2, repeat: Infinity },
              }}
              style={{ filter: 'blur(4px)' }}
            />
          )}
        </motion.svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center"
            >
              <motion.span
                className="text-6xl font-display font-bold tracking-tight"
                style={{ color: getStateColor() }}
                animate={state === 'focus' ? { 
                  textShadow: [
                    '0 0 20px hsl(var(--primary) / 0.3)',
                    '0 0 40px hsl(var(--primary) / 0.5)',
                    '0 0 20px hsl(var(--primary) / 0.3)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatTime(timeLeft)}
              </motion.span>
              <p className="text-muted-foreground text-sm mt-2 uppercase tracking-widest">
                {state === 'idle' && 'Ready to focus'}
                {state === 'focus' && 'Deep Focus'}
                {state === 'break' && 'Take a break'}
                {state === 'paused' && 'Paused'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Breathing animation ring */}
        {state === 'focus' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="w-12 h-12 rounded-full"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            variant="glow"
            size="lg"
            onClick={state === 'focus' || state === 'break' ? handlePause : handleStart}
            className="w-20 h-20 rounded-full"
          >
            {state === 'focus' || state === 'break' ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
        </motion.div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-12 h-12 rounded-full"
        >
          {soundEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Completed pomodoros */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Today:</span>
        <div className="flex gap-1">
          {[...Array(Math.min(completedPomodoros, 8))].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            />
          ))}
          {completedPomodoros > 8 && (
            <span className="text-sm text-primary ml-1">+{completedPomodoros - 8}</span>
          )}
          {completedPomodoros === 0 && (
            <span className="text-sm text-muted-foreground">No sessions yet</span>
          )}
        </div>
      </div>

      {/* Distraction warning */}
      <AnimatePresence>
        {currentDistraction && state === 'paused' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 px-4 py-2 rounded-full bg-warning/20 border border-warning/30 text-warning text-sm"
          >
            Paused due to distraction
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
