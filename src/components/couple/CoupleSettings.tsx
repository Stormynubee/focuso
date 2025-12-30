import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Clock, MessageSquare, AppWindow, Plus, X, Save, Sparkles, Youtube, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCoupleStore } from '@/store/useCoupleStore';
import { toast } from 'sonner';

const AVAILABLE_APPS = [
  { name: 'YouTube', icon: '📺', special: true },
  { name: 'Instagram', icon: '📷', special: false },
  { name: 'TikTok', icon: '🎵', special: false },
  { name: 'Facebook', icon: '👤', special: false },
  { name: 'Twitter', icon: '🐦', special: false },
  { name: 'WhatsApp', icon: '💬', special: false },
  { name: 'Games', icon: '🎮', special: false },
  { name: 'Netflix', icon: '🎬', special: false },
  { name: 'Reddit', icon: '🔥', special: false },
  { name: 'Discord', icon: '🎙️', special: false },
  { name: 'Snapchat', icon: '👻', special: false },
];

export function CoupleSettings() {
  const { alertSettings, updateAlertSettings } = useCoupleStore();
  const [newMessage, setNewMessage] = useState('');
  const [localSettings, setLocalSettings] = useState({
    ...alertSettings,
    treatYouTubeAsEducational: alertSettings.treatYouTubeAsEducational ?? false,
  });

  const handleToggleApp = (app: string) => {
    const newApps = localSettings.enabledApps.includes(app)
      ? localSettings.enabledApps.filter(a => a !== app)
      : [...localSettings.enabledApps, app];
    setLocalSettings({ ...localSettings, enabledApps: newApps });
  };

  const handleAddMessage = () => {
    if (newMessage.trim() && !localSettings.customMessages.includes(newMessage.trim())) {
      setLocalSettings({
        ...localSettings,
        customMessages: [...localSettings.customMessages, newMessage.trim()],
      });
      setNewMessage('');
    }
  };

  const handleRemoveMessage = (message: string) => {
    if (localSettings.customMessages.length > 1) {
      setLocalSettings({
        ...localSettings,
        customMessages: localSettings.customMessages.filter(m => m !== message),
      });
    } else {
      toast.error('Keep at least one message 💕');
    }
  };

  const handleSave = () => {
    updateAlertSettings(localSettings);
    toast.success('Settings saved! 💕');
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <motion.div 
          className="p-2 rounded-xl bg-couple/20"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Settings className="w-5 h-5 text-couple" />
        </motion.div>
        <div>
          <h3 className="text-lg font-display font-semibold">Alert Settings</h3>
          <p className="text-xs text-muted-foreground">Customize your couple alerts</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-couple" />
            <div>
              <p className="font-medium text-sm">Enable Alerts</p>
              <p className="text-xs text-muted-foreground">Auto-detect and notify partner</p>
            </div>
          </div>
          <Switch 
            checked={localSettings.enabled}
            onCheckedChange={(enabled) => setLocalSettings({ ...localSettings, enabled })}
          />
        </div>

        {/* YouTube Special Setting */}
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <Youtube className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">YouTube Detection</span>
          </div>
          <p className="text-xs text-muted-foreground">
            YouTube is treated as <strong>neutral/informational</strong> by default. 
            Partner is notified, but it's not marked as a distraction since it might be educational.
          </p>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs">Treat as always educational</span>
            </div>
            <Switch 
              checked={localSettings.treatYouTubeAsEducational}
              onCheckedChange={(value) => setLocalSettings({ ...localSettings, treatYouTubeAsEducational: value })}
            />
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            When enabled, YouTube won't be logged in distraction analytics.
          </p>
        </div>

        {/* Cooldown Timer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Cooldown Time</span>
            <span className="ml-auto text-couple font-semibold">{localSettings.cooldownMinutes} min</span>
          </div>
          <Slider
            value={[localSettings.cooldownMinutes]}
            onValueChange={([value]) => setLocalSettings({ ...localSettings, cooldownMinutes: value })}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Time between consecutive alerts to avoid spam
          </p>
        </div>

        {/* Tracked Apps */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AppWindow className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Tracked Apps</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_APPS.map(app => (
              <motion.button
                key={app.name}
                onClick={() => handleToggleApp(app.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                  localSettings.enabledApps.includes(app.name)
                    ? app.special 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-couple/20 text-couple border border-couple/30'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{app.icon}</span>
                {app.name}
                {app.special && localSettings.enabledApps.includes(app.name) && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-background/50">neutral</span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Custom Messages */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Alert Messages</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Use <code className="px-1 py-0.5 rounded bg-secondary/50">{'{app}'}</code> for the app name
          </p>
          
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            <AnimatePresence>
              {localSettings.customMessages.map((message, index) => (
                <motion.div
                  key={message}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 group"
                >
                  <span className="flex-1 text-xs">{message}</span>
                  <button
                    onClick={() => handleRemoveMessage(message)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                  >
                    <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add a supportive message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
              className="bg-secondary/30 text-sm"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleAddMessage}
              disabled={!newMessage.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Important Note */}
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 <strong>How it works:</strong> Detection is automatic — no manual input needed. 
            Your partner is notified instantly when you open a tracked app. 
            YouTube is always treated as <em>neutral</em> (might be educational).
          </p>
        </div>

        {/* Save Button */}
        <Button 
          variant="glow" 
          className="w-full gap-2"
          onClick={handleSave}
        >
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </GlassCard>
  );
}
