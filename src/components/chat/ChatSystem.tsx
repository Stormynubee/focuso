import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Users, Send, User, X, ChevronLeft } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  content: string;
  is_public: boolean;
  created_at: string;
  sender?: {
    display_name: string;
  };
}

interface UserProfile {
  user_id: string;
  display_name: string;
}

type ChatMode = 'list' | 'public' | 'private';

export function ChatSystem() {
  const [mode, setMode] = useState<ChatMode>('list');
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (mode === 'public') {
      fetchPublicMessages();
      subscribeToPublicMessages();
    } else if (mode === 'private' && selectedUser) {
      fetchPrivateMessages(selectedUser.user_id);
      subscribeToPrivateMessages(selectedUser.user_id);
    }
  }, [mode, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .neq('user_id', user?.id);

    if (!error && data) {
      setUsers(data);
    }
  };

  const fetchPublicMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
      .eq('is_public', true)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  };

  const fetchPrivateMessages = async (otherUserId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
      .eq('is_public', false)
      .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user?.id})`)
      .order('created_at', { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data as Message[]);
    }
    setLoading(false);
  };

  const subscribeToPublicMessages = () => {
    const channel = supabase
      .channel('public-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: 'is_public=eq.true'
        },
        async (payload) => {
          // Fetch the sender info
          const { data: senderData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', payload.new.sender_id)
            .single();

          const newMsg = {
            ...payload.new,
            sender: senderData
          } as Message;

          setMessages(prev => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPrivateMessages = (otherUserId: string) => {
    const channel = supabase
      .channel('private-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          const msg = payload.new as Message;
          // Only include if it's part of this conversation
          if (
            !msg.is_public &&
            ((msg.sender_id === user?.id && msg.receiver_id === otherUserId) ||
              (msg.sender_id === otherUserId && msg.receiver_id === user?.id))
          ) {
            const { data: senderData } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('user_id', msg.sender_id)
              .single();

            const newMsg = {
              ...msg,
              sender: senderData
            } as Message;

            setMessages(prev => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      sender_id: user.id,
      receiver_id: mode === 'public' ? null : selectedUser?.user_id,
      content: newMessage.trim(),
      is_public: mode === 'public'
    };

    const { error } = await supabase.from('messages').insert(messageData);

    if (error) {
      toast({
        title: "Failed to send message",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setNewMessage('');
    }
  };

  const openPrivateChat = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setMode('private');
    setMessages([]);
  };

  const goBack = () => {
    setMode('list');
    setSelectedUser(null);
    setMessages([]);
  };

  if (!user) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Sign in to use chat</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/50">
          {mode !== 'list' && (
            <Button variant="ghost" size="icon" onClick={goBack} className="mr-1">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold flex-1">
            {mode === 'list' && 'Messages'}
            {mode === 'public' && 'Everyone Chat'}
            {mode === 'private' && selectedUser?.display_name}
          </h2>
        </div>

        {/* Content */}
        {mode === 'list' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Public chat option */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setMode('public')}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium">Everyone Chat</p>
                <p className="text-sm text-muted-foreground">Public chat with all users</p>
              </div>
            </motion.button>

            {/* User list */}
            <p className="text-sm text-muted-foreground pt-4 pb-2">Direct Messages</p>
            {users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No other users yet
              </p>
            ) : (
              users.map((userProfile) => (
                <motion.button
                  key={userProfile.user_id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => openPrivateChat(userProfile)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/50 to-accent/50 flex items-center justify-center text-sm font-bold">
                    {userProfile.display_name.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-medium">{userProfile.display_name}</p>
                </motion.button>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
                  />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.sender_id === user.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary rounded-bl-md'
                      }`}
                    >
                      {msg.sender_id !== user.id && (
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {msg.sender?.display_name}
                        </p>
                      )}
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-border/50">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  maxLength={500}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </GlassCard>
  );
}
