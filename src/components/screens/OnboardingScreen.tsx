import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Target, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/useAppStore';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

export function OnboardingScreen() {
  const setUser = useAppStore((state) => state.setUser);
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    className: '',
    goal: '',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    setUser({
      id: Math.random().toString(36).substring(2, 15),
      name: formData.name.trim(),
      age: formData.age ? parseInt(formData.age) : undefined,
      className: formData.className || undefined,
      goal: formData.goal || undefined,
      createdAt: new Date(),
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        className="glass-card w-full max-w-md p-8 relative z-10"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo/Header */}
        <motion.div
          className="text-center mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 relative"
            variants={itemVariants}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Sparkles className="w-10 h-10 text-primary-foreground" />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 20px hsl(200 100% 55% / 0.3)',
                  '0 0 40px hsl(200 100% 55% / 0.5)',
                  '0 0 20px hsl(200 100% 55% / 0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1
            className="text-4xl font-display font-bold gradient-text mb-2"
            variants={itemVariants}
          >
            FocusOS
          </motion.h1>

          <motion.p
            className="text-muted-foreground"
            variants={itemVariants}
          >
            Your personal operating system for focus
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Step indicators */}
          <motion.div className="flex justify-center gap-2 mb-6" variants={itemVariants}>
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step >= i ? 'w-8 bg-primary' : 'w-4 bg-muted'
                }`}
                animate={step >= i ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              />
            ))}
          </motion.div>

          {step === 0 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  What should we call you?
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class" className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    Class
                  </Label>
                  <Input
                    id="class"
                    placeholder="e.g., 12th"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <Button
                className="w-full mt-6"
                variant="glow"
                onClick={() => setStep(1)}
                disabled={!formData.name.trim()}
              >
                Continue
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-2">
                <Label htmlFor="goal" className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  What's your goal? (optional)
                </Label>
                <Input
                  id="goal"
                  placeholder="e.g., JEE Advanced, NEET, Board exams..."
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground">
                  This helps us personalize your experience
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  variant="glow"
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 w-4 h-4" />
                  Let's Focus
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Your data stays on your device
        </motion.p>
      </motion.div>
    </div>
  );
}
