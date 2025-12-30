import { useEffect, useCallback } from 'react';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

// YouTube-specific supportive messages (neutral, informational - never judgmental)
const YOUTUBE_PARTNER_MESSAGES = [
  "YouTube just opened ❤️ Might be for study — just letting you know ✨",
  "Hey love, YouTube is on screen 💕 Could be educational! 📚",
  "YouTube detected 🎬 We're staying focused together ❤️",
];

export function useCoupleModeAlerts() {
  const { 
    isConnected, 
    partner,
    alertSettings,
    sendDistractionAlert,
    distractionAlerts,
  } = useCoupleStore();
  
  const { sendNotification, isEnabled } = useNotifications();

  // Last alert timestamp for cooldown
  const lastAlertRef = useCallback(() => {
    const alerts = distractionAlerts.filter(a => a.from === 'me');
    if (alerts.length === 0) return 0;
    return new Date(alerts[alerts.length - 1].timestamp).getTime();
  }, [distractionAlerts]);

  // Check cooldown
  const canSendAlert = useCallback(() => {
    const lastAlert = lastAlertRef();
    const cooldownMs = alertSettings.cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlert >= cooldownMs;
  }, [lastAlertRef, alertSettings.cooldownMinutes]);

  // Get appropriate message based on app
  const getAlertMessage = useCallback((appName: string) => {
    // YouTube gets neutral, informational messages
    if (appName === 'YouTube') {
      return YOUTUBE_PARTNER_MESSAGES[Math.floor(Math.random() * YOUTUBE_PARTNER_MESSAGES.length)];
    }
    
    // Other apps use custom messages
    const messages = alertSettings.customMessages;
    return messages[Math.floor(Math.random() * messages.length)]
      .replace('{app}', appName);
  }, [alertSettings.customMessages]);

  // Send distraction alert to partner (informational, not disciplinary)
  const alertPartner = useCallback((appName: string) => {
    if (!isConnected || !partner) return;
    if (!alertSettings.enabled) return;
    if (!alertSettings.enabledApps.includes(appName)) return;
    if (!canSendAlert()) return;

    const isYouTube = appName === 'YouTube';

    sendDistractionAlert(appName);

    // Show local toast - supportive, never judgmental
    toast.info(
      isYouTube 
        ? `Notified ${partner.name} about YouTube 💕` 
        : `Sent gentle reminder to ${partner.name} 💕`,
      {
        description: isYouTube 
          ? "They know it might be educational ✨"
          : `About ${appName}`,
        duration: 3000,
        icon: '💌',
      }
    );

    // In production, this would send via realtime/push
  }, [isConnected, partner, alertSettings, canSendAlert, sendDistractionAlert]);

  // Receive distraction alert from partner (soft, supportive UI)
  const handlePartnerDistraction = useCallback((appName: string) => {
    if (!isConnected || !partner) return;

    const randomMessage = getAlertMessage(appName);

    // Browser notification - gentle tone
    if (isEnabled) {
      sendNotification({
        title: `💕 ${partner.name}`,
        body: randomMessage,
        type: 'reminder',
      });
    }

    // In-app toast - soft, no red warnings
    toast.info(randomMessage, {
      description: `From ${partner.name}`,
      duration: 5000,
      icon: '💕',
    });
  }, [isConnected, partner, getAlertMessage, isEnabled, sendNotification]);

  return {
    alertPartner,
    handlePartnerDistraction,
    canSendAlert: canSendAlert(),
    cooldownMinutes: alertSettings.cooldownMinutes,
    getAlertMessage,
  };
}