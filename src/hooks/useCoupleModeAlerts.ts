import { useEffect, useCallback } from 'react';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

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

  // Send distraction alert to partner
  const alertPartner = useCallback((appName: string) => {
    if (!isConnected || !partner) return;
    if (!alertSettings.enabled) return;
    if (!alertSettings.enabledApps.includes(appName)) return;
    if (!canSendAlert()) return;

    sendDistractionAlert(appName);

    // Show local toast
    toast.info(`Sent gentle reminder to ${partner.name} 💕`, {
      description: `They might be on ${appName}`,
      duration: 3000,
    });

    // In production, this would send via realtime/push
  }, [isConnected, partner, alertSettings, canSendAlert, sendDistractionAlert]);

  // Receive distraction alert from partner (simulated)
  const handlePartnerDistraction = useCallback((appName: string) => {
    if (!isConnected || !partner) return;

    const messages = alertSettings.customMessages;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      .replace('{app}', appName);

    // Browser notification
    if (isEnabled) {
      sendNotification({
        title: `💕 ${partner.name}`,
        body: randomMessage,
        type: 'info',
      });
    }

    // In-app toast
    toast.info(randomMessage, {
      description: `From ${partner.name}`,
      duration: 5000,
      icon: '💕',
    });
  }, [isConnected, partner, alertSettings, isEnabled, sendNotification]);

  return {
    alertPartner,
    handlePartnerDistraction,
    canSendAlert: canSendAlert(),
    cooldownMinutes: alertSettings.cooldownMinutes,
  };
}