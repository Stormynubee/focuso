import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { RealtimeChannel } from '@supabase/supabase-js';

// Event types for sync
export type SyncEventType = 
  | 'YOUTUBE_ACTIVE'
  | 'APP_DISTRACTION'
  | 'POMODORO_STARTED'
  | 'POMODORO_ENDED'
  | 'BREAK_STARTED'
  | 'STATUS_CHANGED'
  | 'STUDY_TOGETHER_INVITE'
  | 'STUDY_TOGETHER_JOIN'
  | 'STUDY_TOGETHER_LEAVE'
  | 'HEARTBEAT';

export interface SyncEvent {
  id: string;
  sender_id: string;
  receiver_id: string;
  event_type: SyncEventType;
  payload: Record<string, unknown>;
  created_at: string;
  read_at: string | null;
}

export interface PartnerConnection {
  id: string;
  user_id: string;
  partner_id: string | null;
  link_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnerStatusData {
  id: string;
  user_id: string;
  status: 'studying' | 'break' | 'distracted' | 'offline';
  pomodoro_active: boolean;
  pomodoro_time_left: number;
  last_seen: string;
  updated_at: string;
}

interface UseRealTimeSyncOptions {
  onEventReceived?: (event: SyncEvent) => void;
  onPartnerStatusChanged?: (status: PartnerStatusData) => void;
  onConnectionChanged?: (isConnected: boolean, partnerId: string | null) => void;
}

// Helper to work with sync_events table (types not yet generated)
async function insertSyncEvent(senderId: string, receiverId: string, eventType: string, payload: Record<string, unknown>) {
  // Direct insert using raw client - type workaround until types regenerate
  const client = supabase as unknown as { 
    from: (table: string) => { 
      insert: (data: Record<string, unknown>) => { select: () => Promise<{ data: unknown; error: Error | null }> } 
    } 
  };
  
  const result = await client.from('sync_events').insert({
    sender_id: senderId,
    receiver_id: receiverId,
    event_type: eventType,
    payload
  }).select();
  
  if (result.error) {
    console.error('[Sync] Failed to insert event:', result.error);
    throw result.error;
  }
  
  return result;
}

export function useRealTimeSync(options: UseRealTimeSyncOptions = {}) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const eventsChannelRef = useRef<RealtimeChannel | null>(null);
  const statusChannelRef = useRef<RealtimeChannel | null>(null);
  const connectionChannelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate a 6-character link code
  const generateLinkCode = useCallback(async (): Promise<string | null> => {
    if (!user) return null;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    try {
      // Check for existing connection first
      const { data: existing } = await supabase
        .from('couple_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing connection with new code
        const { error } = await supabase
          .from('couple_connections')
          .update({ link_code: code, partner_id: null })
          .eq('id', existing.id);
        
        if (error) throw error;
        setConnectionId(existing.id);
      } else {
        // Create new connection
        const { data, error } = await supabase
          .from('couple_connections')
          .insert({ user_id: user.id, link_code: code })
          .select()
          .single();
        
        if (error) throw error;
        setConnectionId(data.id);
      }

      setLinkCode(code);
      console.log('[Sync] Generated link code:', code);
      return code;
    } catch (error) {
      console.error('[Sync] Failed to generate link code:', error);
      toast.error('Failed to generate sync code');
      return null;
    }
  }, [user]);

  // Connect with a partner using their code
  const connectWithCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('[Sync] Attempting to connect with code:', code);
      
      // Find the connection with this code
      const { data: partnerConnection, error: findError } = await supabase
        .from('couple_connections')
        .select('*')
        .eq('link_code', code.toUpperCase())
        .is('partner_id', null)
        .maybeSingle();

      if (findError) throw findError;
      
      if (!partnerConnection) {
        console.log('[Sync] No connection found for code:', code);
        toast.error('Invalid or expired code');
        return false;
      }

      if (partnerConnection.user_id === user.id) {
        toast.error("You can't connect with yourself!");
        return false;
      }

      // Update the partner's connection to include me
      const { error: updatePartnerError } = await supabase
        .from('couple_connections')
        .update({ partner_id: user.id })
        .eq('id', partnerConnection.id);

      if (updatePartnerError) throw updatePartnerError;

      // Create or update my own connection
      const { data: myConnection } = await supabase
        .from('couple_connections')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (myConnection) {
        await supabase
          .from('couple_connections')
          .update({ partner_id: partnerConnection.user_id, link_code: null })
          .eq('id', myConnection.id);
        setConnectionId(myConnection.id);
      } else {
        const { data: newConn } = await supabase
          .from('couple_connections')
          .insert({ user_id: user.id, partner_id: partnerConnection.user_id })
          .select()
          .single();
        if (newConn) setConnectionId(newConn.id);
      }

      // Fetch partner profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', partnerConnection.user_id)
        .maybeSingle();

      setPartnerId(partnerConnection.user_id);
      setPartnerProfile(profile);
      setIsConnected(true);
      setLinkCode(null);
      setSyncStatus('connected');

      console.log('[Sync] Connected to partner:', partnerConnection.user_id);
      toast.success(`Connected with ${profile?.display_name || 'your partner'}! 💕`);
      
      options.onConnectionChanged?.(true, partnerConnection.user_id);
      return true;
    } catch (error) {
      console.error('[Sync] Failed to connect:', error);
      toast.error('Failed to connect with partner');
      return false;
    }
  }, [user, options]);

  // Disconnect from partner
  const disconnect = useCallback(async () => {
    if (!user || !connectionId) return;

    try {
      // Remove partner_id from my connection
      await supabase
        .from('couple_connections')
        .update({ partner_id: null, link_code: null })
        .eq('id', connectionId);

      // Also remove partner_id from partner's connection if they have one pointing to me
      if (partnerId) {
        await supabase
          .from('couple_connections')
          .update({ partner_id: null })
          .eq('user_id', partnerId)
          .eq('partner_id', user.id);
      }

      setPartnerId(null);
      setPartnerProfile(null);
      setIsConnected(false);
      setLinkCode(null);
      setSyncStatus('disconnected');

      console.log('[Sync] Disconnected from partner');
      options.onConnectionChanged?.(false, null);
    } catch (error) {
      console.error('[Sync] Failed to disconnect:', error);
    }
  }, [user, connectionId, partnerId, options]);

  // Send an event to partner
  const sendEvent = useCallback(async (
    eventType: SyncEventType, 
    payload: Record<string, unknown> = {}
  ): Promise<boolean> => {
    if (!user || !partnerId || !isConnected) {
      console.log('[Sync] Cannot send event - not connected', { user: !!user, partnerId, isConnected });
      return false;
    }

    try {
      await insertSyncEvent(user.id, partnerId, eventType, payload);
      console.log('[Sync] Event sent:', eventType, payload);
      return true;
    } catch (error) {
      console.error('[Sync] Failed to send event:', error);
      return false;
    }
  }, [user, partnerId, isConnected]);

  // Update my status
  const updateMyStatus = useCallback(async (
    status: 'studying' | 'break' | 'distracted' | 'offline',
    pomodoroActive: boolean = false,
    pomodoroTimeLeft: number = 0
  ) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('partner_status')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('partner_status')
          .update({
            status,
            pomodoro_active: pomodoroActive,
            pomodoro_time_left: pomodoroTimeLeft,
            last_seen: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('partner_status')
          .insert({
            user_id: user.id,
            status,
            pomodoro_active: pomodoroActive,
            pomodoro_time_left: pomodoroTimeLeft
          });
      }

      console.log('[Sync] Status updated:', status);
    } catch (error) {
      console.error('[Sync] Failed to update status:', error);
    }
  }, [user]);

  // Check for existing connection on mount
  useEffect(() => {
    if (!user) return;

    const checkExistingConnection = async () => {
      setSyncStatus('connecting');
      
      try {
        // Check for my connection
        const { data: myConnection } = await supabase
          .from('couple_connections')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (myConnection) {
          setConnectionId(myConnection.id);
          setLinkCode(myConnection.link_code);

          if (myConnection.partner_id) {
            // I have a partner
            setPartnerId(myConnection.partner_id);
            setIsConnected(true);
            setSyncStatus('connected');

            // Fetch partner profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', myConnection.partner_id)
              .maybeSingle();

            setPartnerProfile(profile);
            options.onConnectionChanged?.(true, myConnection.partner_id);
            console.log('[Sync] Restored connection with partner:', myConnection.partner_id);
          } else {
            setSyncStatus('disconnected');
          }
        } else {
          // Check if someone else has connected TO me
          const { data: incomingConnection } = await supabase
            .from('couple_connections')
            .select('*')
            .eq('partner_id', user.id)
            .maybeSingle();

          if (incomingConnection) {
            setPartnerId(incomingConnection.user_id);
            setIsConnected(true);
            setSyncStatus('connected');

            // Create my connection back to them
            const { data: newConn } = await supabase
              .from('couple_connections')
              .insert({ user_id: user.id, partner_id: incomingConnection.user_id })
              .select()
              .single();
            
            if (newConn) setConnectionId(newConn.id);

            // Fetch partner profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', incomingConnection.user_id)
              .maybeSingle();

            setPartnerProfile(profile);
            options.onConnectionChanged?.(true, incomingConnection.user_id);
            console.log('[Sync] Accepted incoming connection from:', incomingConnection.user_id);
          } else {
            setSyncStatus('disconnected');
          }
        }
      } catch (error) {
        console.error('[Sync] Error checking existing connection:', error);
        setSyncStatus('disconnected');
      }
    };

    checkExistingConnection();
  }, [user, options]);

  // Subscribe to real-time events
  useEffect(() => {
    if (!user || !isConnected || !partnerId) return;

    console.log('[Sync] Setting up realtime subscriptions for partner:', partnerId);

    // Subscribe to sync_events for events FROM partner TO me
    eventsChannelRef.current = supabase
      .channel(`sync-events-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sync_events',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const event = payload.new as unknown as SyncEvent;
          console.log('[Sync] Received event:', event.event_type, event.payload);
          options.onEventReceived?.(event);
        }
      )
      .subscribe((status) => {
        console.log('[Sync] Events channel status:', status);
      });

    // Subscribe to partner's status changes
    statusChannelRef.current = supabase
      .channel(`partner-status-${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partner_status',
          filter: `user_id=eq.${partnerId}`
        },
        (payload) => {
          const status = payload.new as unknown as PartnerStatusData;
          console.log('[Sync] Partner status changed:', status);
          options.onPartnerStatusChanged?.(status);
        }
      )
      .subscribe((status) => {
        console.log('[Sync] Status channel status:', status);
      });

    // Subscribe to connection changes (for disconnect detection)
    connectionChannelRef.current = supabase
      .channel(`connection-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'couple_connections',
          filter: `user_id=eq.${partnerId}`
        },
        (payload) => {
          const connection = payload.new as unknown as PartnerConnection;
          // If partner removed me, disconnect
          if (connection.partner_id !== user.id) {
            console.log('[Sync] Partner disconnected');
            setIsConnected(false);
            setPartnerId(null);
            setPartnerProfile(null);
            setSyncStatus('disconnected');
            options.onConnectionChanged?.(false, null);
            toast.info('Your partner disconnected from Sync Mode');
          }
        }
      )
      .subscribe();

    // Heartbeat to keep connection alive and update last_seen
    heartbeatIntervalRef.current = setInterval(() => {
      updateMyStatus('studying', false, 0);
    }, 30000); // Every 30 seconds

    return () => {
      if (eventsChannelRef.current) {
        supabase.removeChannel(eventsChannelRef.current);
      }
      if (statusChannelRef.current) {
        supabase.removeChannel(statusChannelRef.current);
      }
      if (connectionChannelRef.current) {
        supabase.removeChannel(connectionChannelRef.current);
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [user, isConnected, partnerId, options, updateMyStatus]);

  // Set offline status on unmount
  useEffect(() => {
    return () => {
      if (user) {
        updateMyStatus('offline', false, 0);
      }
    };
  }, [user, updateMyStatus]);

  return {
    // Connection state
    isConnected,
    partnerId,
    partnerProfile,
    linkCode,
    syncStatus,
    
    // Actions
    generateLinkCode,
    connectWithCode,
    disconnect,
    sendEvent,
    updateMyStatus,
  };
}
