import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Smile, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/GlassCard';
import { useCoupleStore } from '@/store/useCoupleStore';

const QUICK_EMOJIS = ['💕', '🫂', '✨', '💪', '📚', '☕', '🎉', '😊'];

export function CoupleChat() {
  const { isConnected, partner, coupleMessages, sendMessage, receiveMessage } = useCoupleStore();
  const [newMessage, setNewMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [coupleMessages]);

  // Simulate partner response (for demo purposes)
  useEffect(() => {
    if (coupleMessages.length > 0) {
      const lastMessage = coupleMessages[coupleMessages.length - 1];
      if (lastMessage.senderId === 'me') {
        const timeout = setTimeout(() => {
          const responses = [
            "I'm focusing too! 💕",
            "You've got this! 📚",
            "Let's stay strong together! 💪",
            "Love you! Keep going! ✨",
            "Almost break time! ☕",
          ];
          const randomResponse = responses[Math.floor(Math.random() * responses.length)];
          receiveMessage(randomResponse);
        }, 2000 + Math.random() * 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [coupleMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojis(false);
  };

  if (!isConnected || !partner) {
    return (
      <GlassCard className="p-6">
        <div className="text-center space-y-3">
          <motion.div 
            className="text-4xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            💬
          </motion.div>
          <h3 className="font-display font-semibold">Couple Chat</h3>
          <p className="text-sm text-muted-foreground">
            Connect with your partner to start chatting!
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="flex flex-col h-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <motion.span 
            className="text-2xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {partner.avatarEmoji}
          </motion.span>
          <div>
            <h4 className="font-display font-semibold flex items-center gap-2">
              {partner.name}
              <Heart className="w-4 h-4 text-couple fill-couple" />
            </h4>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {coupleMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <motion.div 
              className="text-center text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-sm">Send a message to your partner! 💕</p>
              <p className="text-xs mt-1">Stay connected while focusing</p>
            </motion.div>
          </div>
        ) : (
          coupleMessages.map((msg, index) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl ${
                  msg.senderId === 'me'
                    ? 'bg-couple/20 text-foreground rounded-br-sm'
                    : 'bg-secondary/50 rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick emojis */}
      <AnimatePresence>
        {showEmojis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div className="flex gap-2 p-2 rounded-xl bg-secondary/30 overflow-x-auto">
              {QUICK_EMOJIS.map((emoji) => (
                <motion.button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-xl p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojis(!showEmojis)}
            className={showEmojis ? 'text-couple' : ''}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            placeholder="Message your partner..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="bg-secondary/50"
          />
          <Button
            variant="glow"
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}