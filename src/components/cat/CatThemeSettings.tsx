import { useState } from 'react';
import { motion } from 'framer-motion';
import { Cat, Sparkles, Volume2, VolumeX, Zap, Moon, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCatThemeStore, CatPersonality } from '@/store/useCatThemeStore';
import { CatCompanion } from './CatCompanion';
import { toast } from 'sonner';

const PERSONALITIES: { value: CatPersonality; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'calm', label: 'Calm', icon: <Moon className="w-4 h-4" />, description: 'Gentle & peaceful' },
  { value: 'playful', label: 'Playful', icon: <Sparkles className="w-4 h-4" />, description: 'Bouncy & fun' },
  { value: 'sleepy', label: 'Sleepy', icon: <Heart className="w-4 h-4" />, description: 'Cozy & relaxed' },
];

export function CatThemeSettings() {
  const { 
    isEnabled, 
    personality, 
    animationIntensity, 
    soundEnabled,
    setEnabled,
    setPersonality,
    setAnimationIntensity,
    setSoundEnabled,
  } = useCatThemeStore();

  const intensityValue = animationIntensity === 'low' ? 0 : animationIntensity === 'medium' ? 50 : 100;

  const handleIntensityChange = (value: number[]) => {
    if (value[0] < 33) setAnimationIntensity('low');
    else if (value[0] < 66) setAnimationIntensity('medium');
    else setAnimationIntensity('high');
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          className="p-2 rounded-xl bg-cat/20"
          animate={{ rotate: isEnabled ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 2, repeat: isEnabled ? Infinity : 0, repeatDelay: 3 }}
        >
          <Cat className="w-5 h-5 text-cat" />
        </motion.div>
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold">Cat Theme</h3>
          <p className="text-xs text-muted-foreground">Your quiet study buddy 🐱</p>
        </div>
        <Switch 
          checked={isEnabled}
          onCheckedChange={(enabled) => {
            setEnabled(enabled);
            toast.success(enabled ? 'Meow~ Cat Theme activated! 🐱' : 'Cat Theme disabled');
          }}
        />
      </div>

      {isEnabled && (
        <motion.div 
          className="space-y-5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          {/* Preview */}
          <div className="flex justify-center py-4">
            <CatCompanion size="lg" position="inline" showOnlyWhenEnabled={false} />
          </div>

          {/* Personality */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Cat Personality</p>
            <div className="grid grid-cols-3 gap-2">
              {PERSONALITIES.map((p) => (
                <motion.button
                  key={p.value}
                  onClick={() => setPersonality(p.value)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    personality === p.value
                      ? 'bg-cat/20 border border-cat/30'
                      : 'bg-secondary/50 hover:bg-secondary'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`mx-auto mb-1 ${personality === p.value ? 'text-cat' : 'text-muted-foreground'}`}>
                    {p.icon}
                  </div>
                  <p className="text-xs font-medium">{p.label}</p>
                  <p className="text-[10px] text-muted-foreground">{p.description}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Animation Intensity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Animation</span>
              </div>
              <span className="text-xs text-cat capitalize">{animationIntensity}</span>
            </div>
            <Slider
              value={[intensityValue]}
              onValueChange={handleIntensityChange}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Minimal</span>
              <span>Balanced</span>
              <span>Lively</span>
            </div>
          </div>

          {/* Sound */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-cat" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">Sounds</p>
                <p className="text-[10px] text-muted-foreground">Gentle purrs & meows</p>
              </div>
            </div>
            <Switch 
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {/* Info */}
          <div className="p-3 rounded-xl bg-cat/10 border border-cat/20">
            <p className="text-xs text-muted-foreground leading-relaxed">
              🐱 Your cat companion responds to your focus session. 
              It celebrates wins, stays calm during study, and gives gentle looks (no judgment!) when distractions happen.
            </p>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
}
