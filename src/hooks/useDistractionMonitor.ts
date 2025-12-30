import { useEffect, useRef, useCallback, useState } from 'react';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

// Apps/sites that can be detected on web
const DETECTABLE_PATTERNS = {
  'YouTube': ['youtube.com', 'youtu.be'],
  'Instagram': ['instagram.com'],
  'Facebook': ['facebook.com', 'fb.com'],
  'Twitter': ['twitter.com', 'x.com'],
  'TikTok': ['tiktok.com'],
  'Netflix': ['netflix.com'],
  'Reddit': ['reddit.com'],
  'Discord': ['discord.com', 'discord.gg'],
  'WhatsApp': ['web.whatsapp.com'],
  'Twitch': ['twitch.tv'],
};

// YouTube-specific supportive messages (neutral, informational)
const YOUTUBE_MESSAGES = [
  "YouTube just opened ❤️ Might be for study — just letting you know ✨",
  "Hey love, YouTube is on screen 💕 Could be educational! 📚",
  "YouTube detected 🎬 Staying focused together ❤️",
  "Just noticed YouTube opened 💕 We're in this together! ✨",
];

// General app messages
const APP_MESSAGES = [
  "Hey ❤️, {app} just opened. Staying with you! ✨",
  "{app} detected 💕 Just a gentle heads up!",
  "Noticed {app} is open — let's stay focused together! 🌟",
];

interface DetectionEvent {
  app: string;
  timestamp: Date;
  isYouTube: boolean;
}

export function useDistractionMonitor() {
  const { 
    isConnected, 
    partner,
    alertSettings,
    sendDistractionAlert,
    studyTogetherActive,
  } = useCoupleStore();
  
  const { sendNotification, isEnabled } = useNotifications();
  const { addManualDistraction, user } = useAppStore();
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastDetection, setLastDetection] = useState<DetectionEvent | null>(null);
  const lastAlertTimeRef = useRef<number>(0);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Check if we can send an alert (respecting cooldown)
  const canSendAlert = useCallback(() => {
    const cooldownMs = alertSettings.cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlertTimeRef.current >= cooldownMs;
  }, [alertSettings.cooldownMinutes]);

  // Get a random message based on app type
  const getAlertMessage = useCallback((appName: string, isYouTube: boolean) => {
    if (isYouTube) {
      return YOUTUBE_MESSAGES[Math.floor(Math.random() * YOUTUBE_MESSAGES.length)];
    }
    const messages = alertSettings.customMessages.length > 0 
      ? alertSettings.customMessages 
      : APP_MESSAGES;
    return messages[Math.floor(Math.random() * messages.length)].replace('{app}', appName);
  }, [alertSettings.customMessages]);

  // Send partner notification
  const notifyPartner = useCallback((appName: string, isYouTube: boolean) => {
    if (!isConnected || !partner) return;
    if (!alertSettings.enabled) return;
    if (!canSendAlert()) return;

    // Update last alert time
    lastAlertTimeRef.current = Date.now();

    // Get appropriate message
    const message = getAlertMessage(appName, isYouTube);

    // Log the alert
    sendDistractionAlert(appName);

    // Show local toast (soft, supportive)
    toast.info(
      isYouTube 
        ? `Notified ${partner.name} about YouTube 💕` 
        : `Sent a gentle heads up to ${partner.name} 💕`,
      {
        description: isYouTube 
          ? "They know it might be educational ✨"
          : `About ${appName}`,
        duration: 3000,
        icon: '💌',
      }
    );

    // Browser notification to partner (in production, would use realtime)
    if (isEnabled) {
      sendNotification({
        title: `💕 From ${user?.name || 'Your Partner'}`,
        body: message,
        type: 'reminder',
      });
    }

    // Log to analytics (but NOT as distraction for YouTube by default)
    if (!isYouTube) {
      const category = getAppCategory(appName);
      addManualDistraction({
        appName,
        category,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0, // Just logging the event
      });
    }

    // Set last detection
    setLastDetection({
      app: appName,
      timestamp: new Date(),
      isYouTube,
    });

  }, [
    isConnected, 
    partner, 
    alertSettings.enabled, 
    canSendAlert, 
    getAlertMessage, 
    sendDistractionAlert, 
    isEnabled, 
    sendNotification, 
    user?.name,
    addManualDistraction,
  ]);

  // Get category for an app
  const getAppCategory = (appName: string): 'social' | 'video' | 'games' | 'browser' | 'messaging' | 'other' => {
    const categoryMap: Record<string, 'social' | 'video' | 'games' | 'browser' | 'messaging' | 'other'> = {
      'YouTube': 'video',
      'Netflix': 'video',
      'Twitch': 'video',
      'TikTok': 'video',
      'Instagram': 'social',
      'Facebook': 'social',
      'Twitter': 'social',
      'Reddit': 'social',
      'Discord': 'messaging',
      'WhatsApp': 'messaging',
    };
    return categoryMap[appName] || 'other';
  };

  // Detect app from current page/tab (web-based detection)
  const detectCurrentApp = useCallback(() => {
    // Only check if document is visible and focused
    if (document.hidden || !document.hasFocus()) return null;

    const currentUrl = window.location.href.toLowerCase();
    
    // Check if we're on a detectable app/site
    for (const [appName, patterns] of Object.entries(DETECTABLE_PATTERNS)) {
      for (const pattern of patterns) {
        if (currentUrl.includes(pattern)) {
          return {
            app: appName,
            isYouTube: appName === 'YouTube',
          };
        }
      }
    }
    
    return null;
  }, []);

  // Main detection loop (event-based, efficient)
  const runDetection = useCallback(() => {
    if (!isConnected || !alertSettings.enabled) return;

    const detected = detectCurrentApp();
    
    if (detected && alertSettings.enabledApps.includes(detected.app)) {
      // Check if this is a new detection (not spam)
      const isDifferentApp = !lastDetection || lastDetection.app !== detected.app;
      const isNewSession = !lastDetection || 
        (Date.now() - new Date(lastDetection.timestamp).getTime() > 5 * 60 * 1000); // 5 min gap = new session

      if (isDifferentApp || isNewSession) {
        notifyPartner(detected.app, detected.isYouTube);
      }
    }
  }, [
    isConnected, 
    alertSettings.enabled, 
    alertSettings.enabledApps, 
    detectCurrentApp, 
    lastDetection, 
    notifyPartner,
  ]);

  // Set up visibility change listener (primary detection method)
  useEffect(() => {
    if (!isConnected || !alertSettings.enabled) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible - check what we're on
        setTimeout(runDetection, 100); // Small delay for URL to update
      }
    };

    const handleFocus = () => {
      setTimeout(runDetection, 100);
    };

    // Listen for visibility and focus changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Also do periodic checks (less frequent, battery-efficient)
    const interval = setInterval(runDetection, 30000); // Every 30s

    setIsMonitoring(true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [isConnected, alertSettings.enabled, runDetection]);

  // Enhanced detection for Study Together mode
  useEffect(() => {
    if (!studyTogetherActive || !isConnected || !alertSettings.enabled) {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    // More frequent checks during Study Together (every 10s)
    detectionIntervalRef.current = setInterval(runDetection, 10000);

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
    };
  }, [studyTogetherActive, isConnected, alertSettings.enabled, runDetection]);

  // Manual trigger for testing
  const triggerDetection = useCallback((appName: string) => {
    const isYouTube = appName === 'YouTube';
    notifyPartner(appName, isYouTube);
  }, [notifyPartner]);

  return {
    isMonitoring,
    lastDetection,
    canSendAlert: canSendAlert(),
    triggerDetection,
    runDetection,
  };
}
