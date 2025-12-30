import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function usePartnerSync() {
  const { user } = useAuth();
  const { 
    isConnected, 
    setPartnerStatus, 
    partner,
    setIsConnected,
    setPartnerName,
    setLinkCode 
  } = useCoupleStore();
  
  const partnerName = partner?.name || '';

  // Update own status in the database
  const updateMyStatus = useCallback(async (
    status: 'studying' | 'break' | 'distracted' | 'offline',
    pomodoroActive: boolean = false,
    pomodoroTimeLeft: number = 0
  ) => {
    if (!user) return;

    const { error } = await supabase
      .from('partner_status')
      .upsert({
        user_id: user.id,
        status,
        pomodoro_active: pomodoroActive,
        pomodoro_time_left: pomodoroTimeLeft,
        last_seen: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error updating status:', error);
    }
  }, [user]);

  // Generate a unique link code
  const generateLinkCode = useCallback(async () => {
    if (!user) return null;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const { error } = await supabase
      .from('couple_connections')
      .upsert({
        user_id: user.id,
        link_code: code,
        partner_id: null
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error generating link code:', error);
      toast.error('Failed to generate link code');
      return null;
    }

    setLinkCode(code);
    return code;
  }, [user, setLinkCode]);

  // Connect with a partner using their link code
  const connectWithCode = useCallback(async (code: string) => {
    if (!user) return false;

    // Find the partner's connection
    const { data: partnerConnection, error: findError } = await supabase
      .from('couple_connections')
      .select('user_id')
      .eq('link_code', code.toUpperCase())
      .maybeSingle();

    if (findError || !partnerConnection) {
      toast.error('Invalid link code 💔');
      return false;
    }

    if (partnerConnection.user_id === user.id) {
      toast.error("You can't connect with yourself! 😅");
      return false;
    }

    // Update partner's connection
    const { error: updatePartnerError } = await supabase
      .from('couple_connections')
      .update({ partner_id: user.id })
      .eq('user_id', partnerConnection.user_id);

    if (updatePartnerError) {
      console.error('Error updating partner connection:', updatePartnerError);
      toast.error('Failed to connect');
      return false;
    }

    // Create or update my connection
    const { error: myError } = await supabase
      .from('couple_connections')
      .upsert({
        user_id: user.id,
        partner_id: partnerConnection.user_id,
        link_code: null
      }, { onConflict: 'user_id' });

    if (myError) {
      console.error('Error creating my connection:', myError);
      toast.error('Failed to connect');
      return false;
    }

    // Get partner's profile
    const { data: partnerProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', partnerConnection.user_id)
      .maybeSingle();

    setIsConnected(true);
    setPartnerName(partnerProfile?.display_name || 'Partner');
    toast.success(`Connected with ${partnerProfile?.display_name || 'your partner'}! 💕`);

    return true;
  }, [user, setIsConnected, setPartnerName]);

  // Disconnect from partner
  const disconnect = useCallback(async () => {
    if (!user) return;

    // Get my current connection to find partner
    const { data: myConnection } = await supabase
      .from('couple_connections')
      .select('partner_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Clear my connection
    await supabase
      .from('couple_connections')
      .delete()
      .eq('user_id', user.id);

    // Clear partner's reference to me
    if (myConnection?.partner_id) {
      await supabase
        .from('couple_connections')
        .update({ partner_id: null })
        .eq('user_id', myConnection.partner_id);
    }

    // Set status to offline
    await updateMyStatus('offline');

    setIsConnected(false);
    setPartnerName('');
    toast.success('Disconnected 💔');
  }, [user, setIsConnected, setPartnerName, updateMyStatus]);

  // Check for existing connection on mount
  useEffect(() => {
    if (!user) return;

    const checkConnection = async () => {
      const { data: connection } = await supabase
        .from('couple_connections')
        .select('partner_id, link_code')
        .eq('user_id', user.id)
        .maybeSingle();

      if (connection?.partner_id) {
        const { data: partnerProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', connection.partner_id)
          .maybeSingle();

        setIsConnected(true);
        setPartnerName(partnerProfile?.display_name || 'Partner');
      } else if (connection?.link_code) {
        setLinkCode(connection.link_code);
      }
    };

    checkConnection();
  }, [user, setIsConnected, setPartnerName, setLinkCode]);

  // Subscribe to partner's status changes
  useEffect(() => {
    if (!user || !isConnected) return;

    const getPartnerId = async () => {
      const { data: connection } = await supabase
        .from('couple_connections')
        .select('partner_id')
        .eq('user_id', user.id)
        .maybeSingle();

      return connection?.partner_id;
    };

    let channel: ReturnType<typeof supabase.channel>;

    getPartnerId().then((partnerId) => {
      if (!partnerId) return;

      // Get initial partner status
      supabase
        .from('partner_status')
        .select('*')
        .eq('user_id', partnerId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setPartnerStatus(data.status as 'studying' | 'break' | 'distracted' | 'offline');
          }
        });

      // Subscribe to realtime updates
      channel = supabase
        .channel('partner-status')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'partner_status',
            filter: `user_id=eq.${partnerId}`
          },
          (payload) => {
            if (payload.new && 'status' in payload.new) {
              setPartnerStatus(payload.new.status as 'studying' | 'break' | 'distracted' | 'offline');
            }
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, isConnected, setPartnerStatus]);

  return {
    updateMyStatus,
    generateLinkCode,
    connectWithCode,
    disconnect
  };
}
