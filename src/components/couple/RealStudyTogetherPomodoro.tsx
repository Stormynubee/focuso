import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { useSyncMode } from '@/hooks/useSyncMode';
import { useCatSounds } from '@/hooks/useCatSounds';

const FOCUS_TIME = 25 * 60; // 25 minutes
const BREAK_TIME = 5 * 60; // 5 minutes

export function RealStudyTogetherPomodoro() {
  const { 
    isConnected, 
    partner,
    sendPomodoroStarted,
    sendPomodoroEnded,
    sendBreakStarted,
    updateMyStatus,
  } = useSyncMode();
  
  const { play } = useCatSounds();
  
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [completedSessions, setCompletedSessions] = useState(0);

  const totalTime = sessionType === 'focus' ? FOCUS_TIME : BREAK_TIME;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Session complete
          if (sessionType === 'focus') {
            setCompletedSessions(c => c + 1);
            setSessionType('break');
            setTimeLeft(BREAK_TIME);
            play('success');
            sendPomodoroEnded();
            sendBreakStarted(BREAK_TIME);
            updateMyStatus('break', false, BREAK_TIME);
            return BREAK_TIME;
          } else {
            setSessionType('focus');
            setTimeLeft(FOCUS_TIME);
            play('meow');
            updateMyStatus('studying', false, 0);
            return FOCUS_TIME;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, sessionType, play, sendPomodoroEnded, sendBreakStarted, updateMyStatus]);

  // Update status periodically while running
  useEffect(() => {
    if (!isRunning) return;

    const statusInterval = setInterval(() => {
      updateMyStatus(
        sessionType === 'focus' ? 'studying' : 'break',
        true,
        timeLeft
      );
    }, 10000); // Every 10 seconds

    return () => clearInterval(statusInterval);
  }, [isRunning, sessionType, timeLeft, updateMyStatus]);

  const handleStart = useCallback(async () => {
    setIsRunning(true);
    play('purr');
    
    if (sessionType === 'focus') {
      await sendPomodoroStarted(FOCUS_TIME);
      await updateMyStatus('studying', true, timeLeft);
    } else {
      await sendBreakStarted(BREAK_TIME);
      await updateMyStatus('break', true, timeLeft);
    }
    
    console.log('[Pomodoro] Started', sessionType, 'session');
  }, [sessionType, timeLeft, play, sendPomodoroStarted, sendBreakStarted, updateMyStatus]);

  const handlePause = useCallback(async () => {
    setIsRunning(false);
    await updateMyStatus('studying', false, timeLeft);
    console.log('[Pomodoro] Paused');
  }, [timeLeft, updateMyStatus]);

  const handleReset = useCallback(async () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'focus' ? FOCUS_TIME : BREAK_TIME);
    await updateMyStatus('studying', false, 0);
    console.log('[Pomodoro] Reset');
  }, [sessionType, updateMyStatus]);

  if (!isConnected) {
    return null;
  }

  return (
    <GlassCard className="p-6">
      <div className="text-center space-y-4">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 text-couple">
          <Users className="w-5 h-5" />
          <h3 className="font-display font-semibold">Study Together</h3>
        </div>

        {/* Partner status indicator */}
        {partner && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${
              partner.pomodoroActive ? 'bg-success animate-pulse' : 'bg-muted-foreground'
            }`} />
            <span>
              {partner.name}: {partner.pomodoroActive ? 'Focusing' : partner.status}
            </span>
            {partner.pomodoroActive && partner.pomodoroTimeLeft > 0 && (
              <span className="font-mono text-xs">
                ({formatTime(partner.pomodoroTimeLeft)})
              </span>
            )}
          </div>
        )}

        {/* Timer Circle */}
        <div className="relative inline-block">
          <CircularProgress 
            value={progress} 
            size={180} 
            strokeWidth={8}
            className={sessionType === 'focus' ? 'text-primary' : 'text-success'}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <Clock className={`w-6 h-6 mb-1 ${sessionType === 'focus' ? 'text-primary' : 'text-success'}`} />
            <span className="text-3xl font-mono font-bold">
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {sessionType}
            </span>
          </div>
        </div>

        {/* Session counter */}
        <div className="flex items-center justify-center gap-1">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-3 rounded-full ${
                i < completedSessions ? 'bg-primary' : 'bg-muted'
              }`}
              animate={i < completedSessions ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5 }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            disabled={timeLeft === (sessionType === 'focus' ? FOCUS_TIME : BREAK_TIME) && !isRunning}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="glow"
            size="lg"
            onClick={isRunning ? handlePause : handleStart}
            className="w-20 h-20 rounded-full"
          >
            {isRunning ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>
          
          <div className="w-10" /> {/* Spacer for balance */}
        </div>

        {/* Debug info */}
        <div className="text-xs text-muted-foreground p-2 bg-secondary/30 rounded-lg font-mono">
          <div>Session: {sessionType} | Running: {isRunning ? 'Yes' : 'No'}</div>
          <div>Completed: {completedSessions} | Connected: {isConnected ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </GlassCard>
  );
}
