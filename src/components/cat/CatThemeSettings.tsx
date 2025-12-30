import { motion } from 'framer-motion';
import { Cat, Sparkles, Volume2, VolumeX, Zap, Moon, Heart, Timer, Music, Eye, EyeOff, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCatThemeStore, CatPersonality, CatStyle } from '@/store/useCatThemeStore';
import { CatCompanion } from './CatCompanion';
import { toast } from 'sonner';

const COLOR_PRESETS = [
  { hue: 270, label: 'Lavender', emoji: '💜' },
  { hue: 340, label: 'Rose', emoji: '🌸' },
  { hue: 20, label: 'Peach', emoji: '🍑' },
  { hue: 45, label: 'Honey', emoji: '🍯' },
  { hue: 160, label: 'Mint', emoji: '🌿' },
  { hue: 200, label: 'Sky', emoji: '☁️' },
];

const PERSONALITIES: { value: CatPersonality; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'calm', label: 'Calm', icon: <Moon className="w-4 h-4" />, description: 'Gentle & peaceful' },
  { value: 'playful', label: 'Playful', icon: <Sparkles className="w-4 h-4" />, description: 'Bouncy & fun' },
  { value: 'sleepy', label: 'Sleepy', icon: <Heart className="w-4 h-4" />, description: 'Cozy & relaxed' },
];

const CAT_STYLES: { value: CatStyle; label: string; color: string }[] = [
  { value: 'default', label: 'Charcoal', color: '#2A2A35' },
  { value: 'orange', label: 'Orange', color: '#E8956A' },
  { value: 'gray', label: 'Gray', color: '#8A8A96' },
  { value: 'calico', label: 'Calico', color: '#E8956A' },
];

const PAGE_CATS: { key: keyof ReturnType<typeof useCatThemeStore.getState>['pageCats']; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'focus', label: 'Focus' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'leaderboard', label: 'Leaderboard' },
  { key: 'profile', label: 'Profile' },
  { key: 'couple', label: 'Sync Mode' },
  { key: 'chat', label: 'Chat' },
];

export function CatThemeSettings() {
  const { 
    isEnabled, 
    personality, 
    animationIntensity, 
    soundEnabled,
    uiHue,
    timerCatEnabled,
    timerCatStyle,
    timerCatMode,
    spotifyCatEnabled,
    spotifyCatStyle,
    pageCats,
    setEnabled,
    setPersonality,
    setAnimationIntensity,
    setSoundEnabled,
    setUiHue,
    setTimerCatEnabled,
    setTimerCatStyle,
    setTimerCatMode,
    setSpotifyCatEnabled,
    setSpotifyCatStyle,
    setPageCat,
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

          {/* UI Color Theme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">UI Color</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.hue}
                  onClick={() => setUiHue(preset.hue)}
                  className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center text-sm ${
                    uiHue === preset.hue ? 'border-foreground scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: `hsl(${preset.hue}, 60%, 55%)` }}
                  title={preset.label}
                >
                  {uiHue === preset.hue && '✓'}
                </button>
              ))}
            </div>
            <Slider
              value={[uiHue]}
              onValueChange={(v) => setUiHue(v[0])}
              max={360}
              step={1}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground text-center">
              Drag to pick any color • Hue: {uiHue}°
            </p>
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

          {/* Timer Cat Settings */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-cat" />
                <div>
                  <p className="text-sm font-medium">Timer Cat</p>
                  <p className="text-[10px] text-muted-foreground">Walks along Pomodoro timer</p>
                </div>
              </div>
              <Switch 
                checked={timerCatEnabled}
                onCheckedChange={setTimerCatEnabled}
              />
            </div>
            
            {timerCatEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pt-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Style:</span>
                  <div className="flex gap-1">
                    {CAT_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setTimerCatStyle(style.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          timerCatStyle === style.value ? 'border-cat scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: style.color }}
                        title={style.label}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Mode:</span>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={timerCatMode === 'walking' ? 'default' : 'outline'}
                      onClick={() => setTimerCatMode('walking')}
                      className="h-7 text-xs"
                    >
                      Walking
                    </Button>
                    <Button
                      size="sm"
                      variant={timerCatMode === 'sitting' ? 'default' : 'outline'}
                      onClick={() => setTimerCatMode('sitting')}
                      className="h-7 text-xs"
                    >
                      Sitting
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Spotify Cat Settings */}
          <div className="p-4 rounded-xl bg-secondary/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-[#1DB954]" />
                <div>
                  <p className="text-sm font-medium">Spotify Cat</p>
                  <p className="text-[10px] text-muted-foreground">Draggable music companion</p>
                </div>
              </div>
              <Switch 
                checked={spotifyCatEnabled}
                onCheckedChange={setSpotifyCatEnabled}
              />
            </div>
            
            {spotifyCatEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="pt-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Style:</span>
                  <div className="flex gap-1">
                    {CAT_STYLES.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setSpotifyCatStyle(style.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          spotifyCatStyle === style.value ? 'border-[#1DB954] scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: style.color }}
                        title={style.label}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Per-page cats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Page Cats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PAGE_CATS.map((page) => (
                <button
                  key={page.key}
                  onClick={() => setPageCat(page.key, !pageCats[page.key])}
                  className={`p-2 rounded-lg text-xs flex items-center gap-2 transition-all ${
                    pageCats[page.key]
                      ? 'bg-cat/20 text-foreground'
                      : 'bg-secondary/30 text-muted-foreground'
                  }`}
                >
                  {pageCats[page.key] ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  {page.label}
                </button>
              ))}
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