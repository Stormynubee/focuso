import { useCallback, useEffect, useState } from 'react';
import { useRealTimeSync, SyncEvent, SyncEventType, PartnerStatusData } from './useRealTimeSync';
import { useNotifications } from './useNotifications';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

// Partner representation for UI
export interface Partner {
  id: string;
  name: string;
  avatarUrl: string | null;
  status: 'studying' | 'break' | 'distracted' | 'offline';
  pomodoroActive: boolean;
  pomodoroTimeLeft: number;
  lastSeen: Date;
}

interface UseSyncModeReturn {
  // Connection state
  isSyncModeEnabled: boolean;
  isConnected: boolean;
  partner: Partner | null;
  linkCode: string | null;
  syncStatus: 'disconnected' | 'connecting' | 'connected';
  
  // Actions
  enableSyncMode: () => void;
  disableSyncMode: () => void;
  generateCode: () => Promise<string | null>;
  connectWithCode: (code: string) => Promise<boolean>;
  disconnect: () => Promise<void>;
  
  // Event sending
  sendYouTubeAlert: (accountInfo?: { accountName?: string }) => Promise<boolean>;
  sendAppDistraction: (appName: string) => Promise<boolean>;
  sendPomodoroStarted: (duration: number) => Promise<boolean>;
  sendPomodoroEnded: () => Promise<boolean>;
  sendBreakStarted: (duration: number) => Promise<boolean>;
  sendStatusChange: (status: 'studying' | 'break' | 'distracted' | 'offline') => Promise<boolean>;
  sendStudyInvite: () => Promise<boolean>;
  sendStudyJoin: () => Promise<boolean>;
  sendStudyLeave: () => Promise<boolean>;
  
  // Status updates
  updateMyStatus: (status: 'studying' | 'break' | 'distracted' | 'offline', pomodoroActive?: boolean, timeLeft?: number) => Promise<void>;
}

export function useSyncMode(): UseSyncModeReturn {
  const { user } = useAuth();
  const { sendNotification, isEnabled: notificationsEnabled } = useNotifications();
  
  const [isSyncModeEnabled, setIsSyncModeEnabled] = useState(false);
  const [partner, setPartner] = useState<Partner | null>(null);
  
  // Handle incoming events from partner
  const handleEventReceived = useCallback((event: SyncEvent) => {
    console.log('[SyncMode] Event received:', event.event_type, event.payload);
    
    const payload = event.payload as Record<string, unknown>;
    
    switch (event.event_type) {
      case 'YOUTUBE_ACTIVE': {
        const accountName = payload.accountName as string | undefined;
        const message = accountName 
          ? `YouTube just opened ❤️ (${accountName})`
          : 'YouTube just opened ❤️ Might be for study!';
        
        toast.info(message, {
          description: 'From your partner 💕',
          duration: 5000,
          icon: '📺',
        });
        
        if (notificationsEnabled) {
          sendNotification({
            title: '💕 Partner Update',
            body: message,
            type: 'reminder'
          });
        }
        break;
      }
      
      case 'APP_DISTRACTION': {
        const appName = payload.appName as string;
        toast.info(`${appName} detected 💕`, {
          description: 'Gentle heads up from your partner',
          duration: 4000,
          icon: '📱',
        });
        
        if (notificationsEnabled) {
          sendNotification({
            title: '💕 Partner Update',
            body: `${appName} opened`,
            type: 'reminder'
          });
        }
        break;
      }
      
      case 'POMODORO_STARTED': {
        const duration = payload.duration as number;
        toast.info('Partner started focusing! 🎯', {
          description: `${Math.floor(duration / 60)} min session`,
          duration: 3000,
        });
        setPartner(prev => prev ? { ...prev, pomodoroActive: true, status: 'studying' } : null);
        break;
      }
      
      case 'POMODORO_ENDED': {
        toast.success('Partner completed a session! 🎉', {
          duration: 3000,
        });
        setPartner(prev => prev ? { ...prev, pomodoroActive: false } : null);
        break;
      }
      
      case 'BREAK_STARTED': {
        setPartner(prev => prev ? { ...prev, status: 'break', pomodoroActive: false } : null);
        break;
      }
      
      case 'STATUS_CHANGED': {
        const status = payload.status as Partner['status'];
        setPartner(prev => prev ? { ...prev, status } : null);
        break;
      }
      
      case 'STUDY_TOGETHER_INVITE': {
        toast.info('Partner wants to study together! 📚', {
          description: 'Click to join the session',
          duration: 10000,
          action: {
            label: 'Join',
            onClick: () => {
              // This will be handled by the component
            }
          }
        });
        break;
      }
      
      case 'STUDY_TOGETHER_JOIN': {
        toast.success('Partner joined the study session! 💕', {
          duration: 3000,
        });
        break;
      }
      
      case 'STUDY_TOGETHER_LEAVE': {
        toast.info('Partner left the study session', {
          duration: 3000,
        });
        break;
      }
    }
  }, [notificationsEnabled, sendNotification]);
  
  // Handle partner status changes
  const handlePartnerStatusChanged = useCallback((status: PartnerStatusData) => {
    console.log('[SyncMode] Partner status changed:', status);
    setPartner(prev => prev ? {
      ...prev,
      status: status.status as Partner['status'],
      pomodoroActive: status.pomodoro_active,
      pomodoroTimeLeft: status.pomodoro_time_left || 0,
      lastSeen: new Date(status.last_seen),
    } : null);
  }, []);
  
  // Handle connection changes
  const handleConnectionChanged = useCallback((connected: boolean, partnerId: string | null) => {
    console.log('[SyncMode] Connection changed:', connected, partnerId);
    if (!connected) {
      setPartner(null);
    }
  }, []);
  
  // Initialize real-time sync
  const {
    isConnected,
    partnerId,
    partnerProfile,
    linkCode,
    syncStatus,
    generateLinkCode,
    connectWithCode: rtConnectWithCode,
    disconnect: rtDisconnect,
    sendEvent,
    updateMyStatus: rtUpdateMyStatus,
  } = useRealTimeSync({
    onEventReceived: handleEventReceived,
    onPartnerStatusChanged: handlePartnerStatusChanged,
    onConnectionChanged: handleConnectionChanged,
  });
  
  // Update partner when profile is fetched
  useEffect(() => {
    if (partnerProfile && partnerId) {
      setPartner({
        id: partnerId,
        name: partnerProfile.display_name,
        avatarUrl: partnerProfile.avatar_url,
        status: 'offline',
        pomodoroActive: false,
        pomodoroTimeLeft: 0,
        lastSeen: new Date(),
      });
    }
  }, [partnerProfile, partnerId]);
  
  // Auto-enable sync mode when connected
  useEffect(() => {
    if (isConnected) {
      setIsSyncModeEnabled(true);
    }
  }, [isConnected]);
  
  // Event sending functions
  const sendYouTubeAlert = useCallback(async (accountInfo?: { accountName?: string }) => {
    return sendEvent('YOUTUBE_ACTIVE', { accountName: accountInfo?.accountName });
  }, [sendEvent]);
  
  const sendAppDistraction = useCallback(async (appName: string) => {
    return sendEvent('APP_DISTRACTION', { appName });
  }, [sendEvent]);
  
  const sendPomodoroStarted = useCallback(async (duration: number) => {
    return sendEvent('POMODORO_STARTED', { duration });
  }, [sendEvent]);
  
  const sendPomodoroEnded = useCallback(async () => {
    return sendEvent('POMODORO_ENDED', {});
  }, [sendEvent]);
  
  const sendBreakStarted = useCallback(async (duration: number) => {
    return sendEvent('BREAK_STARTED', { duration });
  }, [sendEvent]);
  
  const sendStatusChange = useCallback(async (status: 'studying' | 'break' | 'distracted' | 'offline') => {
    return sendEvent('STATUS_CHANGED', { status });
  }, [sendEvent]);
  
  const sendStudyInvite = useCallback(async () => {
    return sendEvent('STUDY_TOGETHER_INVITE', {});
  }, [sendEvent]);
  
  const sendStudyJoin = useCallback(async () => {
    return sendEvent('STUDY_TOGETHER_JOIN', {});
  }, [sendEvent]);
  
  const sendStudyLeave = useCallback(async () => {
    return sendEvent('STUDY_TOGETHER_LEAVE', {});
  }, [sendEvent]);
  
  return {
    // Connection state
    isSyncModeEnabled,
    isConnected,
    partner,
    linkCode,
    syncStatus,
    
    // Actions
    enableSyncMode: () => setIsSyncModeEnabled(true),
    disableSyncMode: () => {
      setIsSyncModeEnabled(false);
      rtDisconnect();
    },
    generateCode: generateLinkCode,
    connectWithCode: rtConnectWithCode,
    disconnect: rtDisconnect,
    
    // Event sending
    sendYouTubeAlert,
    sendAppDistraction,
    sendPomodoroStarted,
    sendPomodoroEnded,
    sendBreakStarted,
    sendStatusChange,
    sendStudyInvite,
    sendStudyJoin,
    sendStudyLeave,
    
    // Status updates
    updateMyStatus: rtUpdateMyStatus,
  };
}
