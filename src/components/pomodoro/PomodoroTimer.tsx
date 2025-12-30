import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Settings, X, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import { useNotifications } from '@/hooks/useNotifications';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

type TimerState = 'idle' | 'focus' | 'break' | 'paused';

const PRESET_TIMES = [
  { label: '25/5', focus: 25, break: 5 },
  { label: '50/10', focus: 50, break: 10 },
  { label: '90/20', focus: 90, break: 20 },
];

export function PomodoroTimer() {
  const { pomodoroSettings, setPomodoroSettings, addPomodoroSession, currentDistraction } = useAppStore();
  const { notifyPomodoroComplete } = useNotifications();
  const [state, setState] = useState<TimerState>('idle');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.focusTime * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Local settings state for editing
  const [localFocusTime, setLocalFocusTime] = useState(pomodoroSettings.focusTime);
  const [localBreakTime, setLocalBreakTime] = useState(pomodoroSettings.breakTime);

  const totalTime = state === 'break' 
    ? pomodoroSettings.breakTime * 60 
    : pomodoroSettings.focusTime * 60;
  
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const radius = isFullscreen ? 180 : 140;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const svgSize = isFullscreen ? 400 : 320;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
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
              notifyPomodoroComplete(false);
              setState('break');
              return pomodoroSettings.breakTime * 60;
            } else {
              notifyPomodoroComplete(true);
              setState('idle');
              setIsFullscreen(false); // Exit fullscreen after break
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

  // Keyboard shortcut to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleStart = () => {
    if (state === 'idle' || state === 'paused') {
      setState('focus');
      setIsFullscreen(true); // Enter fullscreen on start
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
    setIsFullscreen(false);
  };

  const handleSaveSettings = () => {
    setPomodoroSettings({ focusTime: localFocusTime, breakTime: localBreakTime });
    setTimeLeft(localFocusTime * 60);
    setShowSettings(false);
  };

  const handlePresetSelect = (preset: typeof PRESET_TIMES[0]) => {
    setLocalFocusTime(preset.focus);
    setLocalBreakTime(preset.break);
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
        return '0 0 80px hsl(var(--primary) / 0.5)';
      case 'break':
        return '0 0 80px hsl(var(--success) / 0.5)';
      case 'paused':
        return '0 0 80px hsl(var(--warning) / 0.5)';
      default:
        return 'none';
    }
  };

  // Fullscreen Timer View
  if (isFullscreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
      >
        {/* Animated background for fullscreen */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full"
            style={{
              background: state === 'focus' 
                ? 'radial-gradient(circle, hsl(200 100% 55% / 0.1) 0%, transparent 50%)'
                : 'radial-gradient(circle, hsl(160 84% 39% / 0.1) 0%, transparent 50%)',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Exit button */}
        <motion.button
          className="absolute top-6 right-6 p-3 rounded-full bg-secondary/50 hover:bg-secondary transition-colors"
          onClick={() => setIsFullscreen(false)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Minimize2 className="w-6 h-6 text-muted-foreground" />
        </motion.button>

        {/* Main timer */}
        <div className="relative">
          <motion.svg
            width={svgSize}
            height={svgSize}
            className="transform -rotate-90"
            style={{ filter: `drop-shadow(${getStateGlow()})` }}
          >
            <circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={14}
              className="text-muted/20"
            />
            <motion.circle
              cx={svgSize / 2}
              cy={svgSize / 2}
              r={radius}
              fill="none"
              stroke={getStateColor()}
              strokeWidth={14}
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {state === 'focus' && (
              <motion.circle
                cx={svgSize / 2}
                cy={svgSize / 2}
                r={radius}
                fill="none"
                stroke={getStateColor()}
                strokeWidth={6}
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
                style={{ filter: 'blur(6px)' }}
              />
            )}
          </motion.svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className="text-8xl font-display font-bold tracking-tight"
              style={{ color: getStateColor() }}
              animate={state === 'focus' ? { 
                textShadow: [
                  '0 0 30px hsl(var(--primary) / 0.3)',
                  '0 0 60px hsl(var(--primary) / 0.5)',
                  '0 0 30px hsl(var(--primary) / 0.3)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {formatTime(timeLeft)}
            </motion.span>
            <p className="text-muted-foreground text-lg mt-3 uppercase tracking-[0.3em]">
              {state === 'idle' && 'Ready'}
              {state === 'focus' && 'Deep Focus'}
              {state === 'break' && 'Break Time'}
              {state === 'paused' && 'Paused'}
            </p>
          </div>

          {/* Breathing ring */}
          {state === 'focus' && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.2, 0.5, 0.2],
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
        <div className="flex items-center gap-6 mt-12">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="w-14 h-14 rounded-full"
          >
            <RotateCcw className="w-6 h-6" />
          </Button>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="glow"
              onClick={state === 'focus' || state === 'break' ? handlePause : handleStart}
              className="w-24 h-24 rounded-full"
            >
              {state === 'focus' || state === 'break' ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 ml-1" />
              )}
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-14 h-14 rounded-full"
          >
            {soundEnabled ? (
              <Volume2 className="w-6 h-6" />
            ) : (
              <VolumeX className="w-6 h-6" />
            )}
          </Button>
        </div>

        {/* Session count */}
        <div className="flex items-center gap-2 mt-8">
          <span className="text-muted-foreground">Sessions:</span>
          <div className="flex gap-1.5">
            {[...Array(Math.min(completedPomodoros, 8))].map((_, i) => (
              <motion.div
                key={i}
                className="w-4 h-4 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
              />
            ))}
            {completedPomodoros > 8 && (
              <span className="text-primary ml-1">+{completedPomodoros - 8}</span>
            )}
          </div>
        </div>

        {/* Distraction warning */}
        <AnimatePresence>
          {currentDistraction && state === 'paused' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute bottom-12 px-6 py-3 rounded-full bg-warning/20 border border-warning/30 text-warning"
            >
              ⚠️ Paused due to distraction
            </motion.div>
          )}
        </AnimatePresence>

        <p className="absolute bottom-6 text-sm text-muted-foreground">
          Press ESC or click minimize to exit fullscreen
        </p>
      </motion.div>
    );
  }

  // Regular Timer View
  return (
    <GlassCard className="p-8 flex flex-col items-center relative" hover={false}>
      {/* Settings button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 rounded-full"
        disabled={state !== 'idle'}
      >
        <Settings className="w-5 h-5" />
      </Button>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full mb-6 overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-display font-semibold">Timer Settings</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Presets */}
              <p className="text-xs text-muted-foreground mb-2">Quick presets</p>
              <div className="flex gap-2 mb-4">
                {PRESET_TIMES.map((preset) => (
                  <motion.button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      localFocusTime === preset.focus && localBreakTime === preset.break
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </div>

              {/* Custom time input */}
              <p className="text-xs text-muted-foreground mb-2">Or set custom times</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-sm flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    Focus (min)
                  </Label>
                  <Input
                    type="number"
                    value={localFocusTime}
                    onChange={(e) => setLocalFocusTime(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={300}
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label className="text-sm flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    Break (min)
                  </Label>
                  <Input
                    type="number"
                    value={localBreakTime}
                    onChange={(e) => setLocalBreakTime(Math.max(1, Math.min(60, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={60}
                    className="bg-secondary/50"
                  />
                </div>
              </div>

              {/* Slider for quick adjustment */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Focus</Label>
                  <span className="text-xs text-primary">{localFocusTime}m</span>
                </div>
                <Slider
                  value={[localFocusTime]}
                  onValueChange={([value]) => setLocalFocusTime(value)}
                  min={1}
                  max={180}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Break</Label>
                  <span className="text-xs text-success">{localBreakTime}m</span>
                </div>
                <Slider
                  value={[localBreakTime]}
                  onValueChange={([value]) => setLocalBreakTime(value)}
                  min={1}
                  max={60}
                  step={1}
                  className="w-full"
                />
              </div>

              <Button
                variant="glow"
                className="w-full"
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Ring */}
      <div className="relative mb-8">
        <motion.svg
          width={svgSize}
          height={svgSize}
          className="transform -rotate-90"
          style={{ filter: `drop-shadow(${getStateGlow()})` }}
        >
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={12}
            className="text-muted/20"
          />
          <motion.circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={getStateColor()}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {state === 'focus' && (
            <motion.circle
              cx={svgSize / 2}
              cy={svgSize / 2}
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

      {/* Current settings display */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {pomodoroSettings.focusTime}m focus
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success" />
          {pomodoroSettings.breakTime}m break
        </span>
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
