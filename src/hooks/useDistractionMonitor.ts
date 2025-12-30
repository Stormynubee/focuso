import { useEffect, useRef, useCallback, useState } from 'react';
import { useCoupleStore } from '@/store/useCoupleStore';
import { useNotifications } from '@/hooks/useNotifications';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import UsageStats, { ForegroundAppInfo, YouTubeAccountInfo } from '@/plugins/UsageStatsPlugin';
import { Capacitor } from '@capacitor/core';

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

// YouTube messages with account info
const YOUTUBE_ACCOUNT_MESSAGES = [
  "YouTube opened ❤️ Account active: {account} (informational only)",
  "Hey love, YouTube is on 💕 Using: {account} ✨",
  "YouTube detected with {account} 📚 Stay focused! ❤️",
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
  accountInfo?: YouTubeAccountInfo;
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
  const [hasNativePermission, setHasNativePermission] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const lastAlertTimeRef = useRef<number>(0);
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const listenerRemoveRef = useRef<(() => Promise<void>) | null>(null);
  
  // Check if running on native platform
  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  // Check native permissions on mount
  useEffect(() => {
    const checkPermission = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const { granted } = await UsageStats.hasPermission();
          setHasNativePermission(granted);
        } catch (e) {
          console.log('UsageStats permission check failed:', e);
        }
      }
    };
    checkPermission();
  }, []);

  // Request native permission
  const requestNativePermission = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      await UsageStats.requestPermission();
      toast.info('Please enable usage access for FocusOS 📱', {
        description: 'This allows automatic distraction detection',
        duration: 5000,
      });
    } catch (e) {
      console.error('Failed to request permission:', e);
    }
  }, []);
  
  // Check if we can send an alert (respecting cooldown)
  const canSendAlert = useCallback(() => {
    const cooldownMs = alertSettings.cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlertTimeRef.current >= cooldownMs;
  }, [alertSettings.cooldownMinutes]);

  // Get a random message based on app type and account info
  const getAlertMessage = useCallback((appName: string, isYouTube: boolean, accountInfo?: YouTubeAccountInfo) => {
    if (isYouTube) {
      // Check if we should include account info
      if (alertSettings.accountAwareDetection && 
          alertSettings.showAccountNameToPartner && 
          accountInfo?.accountName) {
        const msg = YOUTUBE_ACCOUNT_MESSAGES[Math.floor(Math.random() * YOUTUBE_ACCOUNT_MESSAGES.length)];
        return msg.replace('{account}', accountInfo.accountName);
      }
      
      // Default YouTube message (no account info)
      return YOUTUBE_MESSAGES[Math.floor(Math.random() * YOUTUBE_MESSAGES.length)];
    }
    
    const messages = alertSettings.customMessages.length > 0 
      ? alertSettings.customMessages 
      : APP_MESSAGES;
    return messages[Math.floor(Math.random() * messages.length)].replace('{app}', appName);
  }, [alertSettings.customMessages, alertSettings.accountAwareDetection, alertSettings.showAccountNameToPartner]);

  // Send partner notification
  const notifyPartner = useCallback((appName: string, isYouTube: boolean, accountInfo?: YouTubeAccountInfo) => {
    if (!isConnected || !partner) return;
    if (!alertSettings.enabled) return;
    if (!canSendAlert()) return;

    // Update last alert time
    lastAlertTimeRef.current = Date.now();

    // Get appropriate message
    const message = getAlertMessage(appName, isYouTube, accountInfo);

    // Log the alert
    sendDistractionAlert(appName);

    // Build account info display
    const accountDisplay = accountInfo?.accountName 
      ? `Account: ${accountInfo.accountName}` 
      : 'Account info unavailable';

    // Show local toast (soft, supportive)
    toast.info(
      isYouTube 
        ? `Notified ${partner.name} about YouTube 💕` 
        : `Sent a gentle heads up to ${partner.name} 💕`,
      {
        description: isYouTube 
          ? (alertSettings.showAccountNameToPartner && accountInfo?.accountName
              ? accountDisplay
              : "They know it might be educational ✨")
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
    if (!isYouTube || !alertSettings.youtubeNotifyOnly) {
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
      accountInfo,
    });

  }, [
    isConnected, 
    partner, 
    alertSettings.enabled, 
    alertSettings.showAccountNameToPartner,
    alertSettings.youtubeNotifyOnly,
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

  // Handle native app detection event
  const handleNativeAppDetected = useCallback((info: ForegroundAppInfo) => {
    if (!alertSettings.enabledApps.includes(info.appName)) return;

    // Check if this is a new detection (not spam)
    const isDifferentApp = !lastDetection || lastDetection.app !== info.appName;
    const isNewSession = !lastDetection || 
      (Date.now() - new Date(lastDetection.timestamp).getTime() > 5 * 60 * 1000);

    if (isDifferentApp || isNewSession) {
      notifyPartner(info.appName, info.isYouTube, info.youtubeAccountInfo);
    }
  }, [alertSettings.enabledApps, lastDetection, notifyPartner]);

  // Detect app from current page/tab (web-based detection)
  const detectCurrentApp = useCallback(async () => {
    // Only check if document is visible and focused
    if (document.hidden || !document.hasFocus()) return null;

    const currentUrl = window.location.href.toLowerCase();
    
    // Check if we're on a detectable app/site
    for (const [appName, patterns] of Object.entries(DETECTABLE_PATTERNS)) {
      for (const pattern of patterns) {
        if (currentUrl.includes(pattern)) {
          const isYouTube = appName === 'YouTube';
          
          // Try to get YouTube account info if applicable
          let accountInfo: YouTubeAccountInfo | undefined;
          if (isYouTube && alertSettings.accountAwareDetection) {
            try {
              accountInfo = await UsageStats.getYouTubeAccountInfo();
            } catch (e) {
              console.log('YouTube account detection not available');
            }
          }
          
          return {
            app: appName,
            isYouTube,
            accountInfo,
          };
        }
      }
    }
    
    return null;
  }, [alertSettings.accountAwareDetection]);

  // Main detection loop (event-based, efficient)
  const runDetection = useCallback(async () => {
    if (!isConnected || !alertSettings.enabled) return;

    const detected = await detectCurrentApp();
    
    if (detected && alertSettings.enabledApps.includes(detected.app)) {
      // Check if this is a new detection (not spam)
      const isDifferentApp = !lastDetection || lastDetection.app !== detected.app;
      const isNewSession = !lastDetection || 
        (Date.now() - new Date(lastDetection.timestamp).getTime() > 5 * 60 * 1000); // 5 min gap = new session

      if (isDifferentApp || isNewSession) {
        notifyPartner(detected.app, detected.isYouTube, detected.accountInfo);
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

  // Set up native monitoring
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isConnected || !alertSettings.enabled) return;
    if (!hasNativePermission) return;

    const startNativeMonitoring = async () => {
      try {
        // Add listener for app changes
        const handle = await UsageStats.addListener('appChanged', handleNativeAppDetected);
        listenerRemoveRef.current = async () => { await handle.remove(); };

        // Start monitoring
        await UsageStats.startMonitoring({
          intervalMs: studyTogetherActive ? 5000 : 10000, // Faster during study together
        });

        setIsMonitoring(true);
        console.log('[Native] Distraction monitoring started');
      } catch (e) {
        console.error('[Native] Failed to start monitoring:', e);
      }
    };

    startNativeMonitoring();

    return () => {
      const cleanup = async () => {
        if (listenerRemoveRef.current) {
          await listenerRemoveRef.current();
          listenerRemoveRef.current = null;
        }
        await UsageStats.stopMonitoring().catch(console.error);
        setIsMonitoring(false);
      };
      cleanup();
    };
  }, [isConnected, alertSettings.enabled, hasNativePermission, studyTogetherActive, handleNativeAppDetected]);

  // Set up web-based visibility change listener (primary detection method for web)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return; // Use native monitoring instead
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

  // Enhanced detection for Study Together mode (web)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return; // Native has its own enhanced mode
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
    // Native-specific
    isNative,
    hasNativePermission,
    requestNativePermission,
  };
}
