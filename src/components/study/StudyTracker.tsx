import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Programming',
  'Other',
];

export function StudyTracker() {
  const { currentStudySession, startStudySession, endStudySession } = useAppStore();
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (currentStudySession) {
      interval = setInterval(() => {
        const elapsed = Math.floor(
          (Date.now() - new Date(currentStudySession.startTime).getTime()) / 1000
        );
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => clearInterval(interval);
  }, [currentStudySession]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleStart = () => {
    const finalSubject = subject === 'Other' ? customSubject : subject;
    if (finalSubject.trim()) {
      startStudySession(finalSubject.trim());
    }
  };

  const handleStop = () => {
    endStudySession();
    setSubject('');
    setCustomSubject('');
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-study/20">
          <BookOpen className="w-5 h-5 text-study" />
        </div>
        <h3 className="text-lg font-display font-semibold">Study Session</h3>
      </div>

      <AnimatePresence mode="wait">
        {!currentStudySession ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-2">
              {SUBJECTS.map((s) => (
                <motion.button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    subject === s
                      ? 'bg-study text-study-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {s}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {subject === 'Other' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input
                    placeholder="Enter subject name"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="bg-secondary/50 border-border/50"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              variant="study"
              className="w-full"
              onClick={handleStart}
              disabled={!subject || (subject === 'Other' && !customSubject.trim())}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Studying
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="text-center">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-study/20 text-study mb-4"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="w-2 h-2 rounded-full bg-study animate-pulse" />
                Studying: {currentStudySession.subject}
              </motion.div>

              <motion.div
                className="text-5xl font-display font-bold text-study glow-text"
                key={elapsedTime}
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
              >
                {formatTime(elapsedTime)}
              </motion.div>

              <p className="text-sm text-muted-foreground mt-2">
                Keep going! You're doing great.
              </p>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={handleStop}
            >
              <Square className="w-4 h-4 mr-2" />
              End Session
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
