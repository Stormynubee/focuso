import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Target, Edit2, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAppStore } from '@/store/useAppStore';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

export function ProfileScreen() {
  const { user, updateUser, clearUser, studySessions, distractions, pomodoroSessions } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    className: user?.className || '',
    goal: user?.goal || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser({
      name: formData.name,
      age: formData.age ? parseInt(formData.age) : undefined,
      className: formData.className || undefined,
      goal: formData.goal || undefined,
    });
    setIsEditing(false);
  };

  const totalStudyTime = studySessions.reduce((acc, s) => acc + s.duration, 0);
  const totalDistractionTime = distractions.reduce((acc, d) => acc + d.duration, 0);
  const completedPomodoros = pomodoroSessions.filter((p) => p.completed).length;

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassCard className="p-8 text-center relative">
          <motion.div
            className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center text-4xl font-display font-bold text-primary-foreground"
            whileHover={{ scale: 1.05 }}
          >
            {user.name.charAt(0).toUpperCase()}
          </motion.div>
          
          <h2 className="text-2xl font-display font-bold mb-1">{user.name}</h2>
          {user.goal && (
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Target className="w-4 h-4" />
              {user.goal}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-2">
            Member since {memberSince}
          </p>
        </GlassCard>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-study">
            {formatDuration(totalStudyTime)}
          </p>
          <p className="text-xs text-muted-foreground uppercase">Total Study</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary">
            {completedPomodoros}
          </p>
          <p className="text-xs text-muted-foreground uppercase">Pomodoros</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-display font-bold text-distraction">
            {formatDuration(totalDistractionTime)}
          </p>
          <p className="text-xs text-muted-foreground uppercase">Distractions</p>
        </GlassCard>
      </motion.div>

      {/* Edit Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display font-semibold">Profile Details</h3>
            <Button
              variant={isEditing ? 'glow' : 'outline'}
              size="sm"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
            >
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Name
              </Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-secondary/50"
                />
              ) : (
                <p className="text-foreground">{user.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age</Label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="bg-secondary/50"
                  />
                ) : (
                  <p className="text-foreground">{user.age || 'Not set'}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-primary" />
                  Class
                </Label>
                {isEditing ? (
                  <Input
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="bg-secondary/50"
                  />
                ) : (
                  <p className="text-foreground">{user.className || 'Not set'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Goal
              </Label>
              {isEditing ? (
                <Input
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="bg-secondary/50"
                  placeholder="e.g., JEE Advanced, NEET..."
                />
              ) : (
                <p className="text-foreground">{user.goal || 'Not set'}</p>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <NotificationSettings />
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard className="p-6 border-destructive/30">
          <h3 className="text-lg font-display font-semibold text-destructive mb-4">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            This will delete all your data and reset the app. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure? This will delete all your data.')) {
                clearUser();
              }
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Reset All Data
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
