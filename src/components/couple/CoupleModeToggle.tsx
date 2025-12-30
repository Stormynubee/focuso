import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Link2, Copy, Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCoupleStore } from '@/store/useCoupleStore';
import { toast } from 'sonner';

export function CoupleModeToggle() {
  const { 
    isCoupleMode, 
    isConnected, 
    partner,
    linkCode,
    enableCoupleMode,
    disableCoupleMode,
    generateLinkCode,
    connectWithCode,
    disconnect,
  } = useCoupleStore();
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerateCode = () => {
    const code = generateLinkCode();
    setGeneratedCode(code);
  };

  const handleCopyCode = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success('Code copied! Share it with your partner 💕');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConnect = () => {
    if (inputCode.length === 6) {
      const success = connectWithCode(inputCode.toUpperCase());
      if (success) {
        toast.success('Connected with your partner! 💕');
        setShowLinkInput(false);
        setInputCode('');
      } else {
        toast.error('Invalid code. Please try again.');
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setGeneratedCode(null);
    toast.info('Disconnected from Sync Mode');
  };

  if (!isCoupleMode) {
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
              Focus together with your partner. Support each other, stay accountable, and celebrate wins together! 💕
            </p>
          </div>
          
          <Button 
            variant="glow" 
            onClick={enableCoupleMode}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Enable Sync Mode
          </Button>
        </motion.div>
      </GlassCard>
    );
  }

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
                className="text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {partner.avatarEmoji}
              </motion.div>
              <div>
                <h4 className="font-display font-semibold">{partner.name}</h4>
                <p className="text-xs text-couple">Connected 💕</p>
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
          
          <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-sm text-success">Sync Mode active</span>
          </div>
        </motion.div>
      </GlassCard>
    );
  }

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
            <h3 className="text-lg font-display font-semibold">Sync Mode</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={disableCoupleMode}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Generate Code */}
          <motion.button
            className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateCode}
          >
            <Link2 className="w-5 h-5 mx-auto mb-2 text-couple" />
            <span className="text-sm font-medium">Generate Code</span>
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
          {generatedCode && (
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
                  {generatedCode}
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
                Enter your partner's code:
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
                  disabled={inputCode.length !== 6}
                >
                  Connect
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </GlassCard>
  );
}