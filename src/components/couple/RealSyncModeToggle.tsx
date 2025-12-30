import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Link2, Copy, Check, X, Sparkles, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { useSyncMode } from '@/hooks/useSyncMode';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function RealSyncModeToggle() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { 
    isSyncModeEnabled,
    isConnected, 
    partner,
    linkCode,
    syncStatus,
    enableSyncMode,
    disableSyncMode,
    generateCode,
    connectWithCode,
    disconnect,
  } = useSyncMode();
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Require authentication for Sync Mode
  if (!loading && !user) {
    return (
      <GlassCard className="p-6">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="inline-flex p-4 rounded-full bg-couple/20 mx-auto"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-8 h-8 text-couple" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-display font-bold gradient-text mb-2">
              Sync Mode
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to connect with your partner and focus together!
            </p>
          </div>
          
          <Button 
            variant="glow" 
            onClick={() => navigate('/auth')}
            className="gap-2"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Enable
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const code = await generateCode();
      if (code) {
        setGeneratedCode(code);
        console.log('[UI] Generated code:', code);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCode = async () => {
    const codeToCopy = generatedCode || linkCode;
    if (codeToCopy) {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      toast.success('Code copied! Share it with your partner 💕');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = async () => {
    if (inputCode.length !== 6) return;
    
    setIsConnecting(true);
    try {
      console.log('[UI] Connecting with code:', inputCode);
      const success = await connectWithCode(inputCode.toUpperCase());
      if (success) {
        setShowLinkInput(false);
        setInputCode('');
        setGeneratedCode(null);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setGeneratedCode(null);
    toast.info('Disconnected from Sync Mode');
  };

  // Show enable button if sync mode not enabled
  if (!isSyncModeEnabled && !isConnected) {
    return (
      <GlassCard className="p-6">
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div 
            className="inline-flex p-4 rounded-full bg-couple/20 mx-auto"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Heart className="w-8 h-8 text-couple" />
          </motion.div>
          
          <div>
            <h3 className="text-xl font-display font-bold gradient-text mb-2">
              Sync Mode
            </h3>
            <p className="text-sm text-muted-foreground">
              Focus together with your partner. Real-time sync, mutual accountability, and shared celebrations! 💕
            </p>
          </div>
          
          <Button 
            variant="glow" 
            onClick={enableSyncMode}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Enable Sync Mode
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

  // Connected state
  if (isConnected && partner) {
    return (
      <GlassCard className="p-6 love-border">
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-12 h-12 rounded-full bg-couple/20 flex items-center justify-center text-2xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {partner.avatarUrl ? (
                  <img src={partner.avatarUrl} alt={partner.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  '💕'
                )}
              </motion.div>
              <div>
                <h4 className="font-display font-semibold">{partner.name}</h4>
                <p className="text-xs text-couple">Partner ID: {partner.id.slice(0, 8)}...</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDisconnect}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <SyncStatusIndicator status={syncStatus} partnerName={partner.name} />
          
          {/* Debug info */}
          <div className="text-xs text-muted-foreground p-2 bg-secondary/30 rounded-lg font-mono">
            <div>Partner ID: {partner.id}</div>
            <div>Status: {partner.status}</div>
            <div>Pomodoro: {partner.pomodoroActive ? 'Active' : 'Inactive'}</div>
          </div>
        </motion.div>
      </GlassCard>
    );
  }

  // Enabled but not connected - show pairing options
  return (
    <GlassCard className="p-6">
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="p-2 rounded-xl bg-couple/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-couple" />
            </motion.div>
            <div>
              <h3 className="text-lg font-display font-semibold">Sync Mode</h3>
              <SyncStatusIndicator status={syncStatus} className="mt-1" />
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={disableSyncMode}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Generate Code */}
          <motion.button
            className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-center disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateCode}
            disabled={isGenerating}
          >
            <Link2 className={`w-5 h-5 mx-auto mb-2 text-couple ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">
              {isGenerating ? 'Generating...' : 'Generate Code'}
            </span>
            <p className="text-xs text-muted-foreground mt-1">Share with partner</p>
          </motion.button>

          {/* Enter Code */}
          <motion.button
            className={`p-4 rounded-xl transition-all text-center ${
              showLinkInput 
                ? 'bg-couple/10 border border-couple/30' 
                : 'bg-secondary/50 hover:bg-secondary'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowLinkInput(!showLinkInput)}
          >
            <Heart className="w-5 h-5 mx-auto mb-2 text-couple" />
            <span className="text-sm font-medium">Enter Code</span>
            <p className="text-xs text-muted-foreground mt-1">Connect to partner</p>
          </motion.button>
        </div>

        {/* Generated Code Display */}
        <AnimatePresence>
          {(generatedCode || linkCode) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-couple/10 border border-couple/20"
            >
              <p className="text-xs text-muted-foreground mb-2">
                Share this code with your partner:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 rounded-lg bg-background font-mono text-xl tracking-widest text-center font-bold text-couple">
                  {generatedCode || linkCode}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                ⏳ Waiting for partner to connect...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enter Code Input */}
        <AnimatePresence>
          {showLinkInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-xl bg-secondary/30 border border-border/50"
            >
              <p className="text-xs text-muted-foreground mb-2">
                Enter your partner's 6-character code:
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="ABC123"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
                  className="bg-secondary/50 font-mono text-center tracking-widest uppercase"
                  maxLength={6}
                />
                <Button 
                  onClick={handleConnect}
                  variant="glow"
                  disabled={inputCode.length !== 6 || isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </GlassCard>
  );
}
