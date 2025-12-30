import { useEffect, useRef, useCallback, useState } from 'react';
import { useSyncMode } from './useSyncMode';
import { toast } from 'sonner';
import UsageStats, { ForegroundAppInfo, YouTubeAccountInfo } from '@/plugins/UsageStatsPlugin';
import { Capacitor } from '@capacitor/core';

// Apps/sites that can be detected on web
const DETECTABLE_PATTERNS: Record<string, string[]> = {
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

const DEFAULT_ENABLED_APPS = ['YouTube', 'Instagram', 'WhatsApp', 'Games', 'Facebook', 'TikTok'];

interface DetectionEvent {
  app: string;
  timestamp: Date;
  isYouTube: boolean;
  accountInfo?: YouTubeAccountInfo;
}

export function useRealDistractionMonitor() {
  const { 
    isConnected, 
    partner,
    sendYouTubeAlert,
    sendAppDistraction,
  } = useSyncMode();
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastDetection, setLastDetection] = useState<DetectionEvent | null>(null);
  const [hasNativePermission, setHasNativePermission] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const [enabledApps] = useState(DEFAULT_ENABLED_APPS);
  const [cooldownMinutes] = useState(5);
  
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
          console.log('[Monitor] UsageStats permission check failed:', e);
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
      console.error('[Monitor] Failed to request permission:', e);
    }
  }, []);

  // Check if we can send an alert (respecting cooldown)
  const canSendAlert = useCallback(() => {
    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlertTimeRef.current >= cooldownMs;
  }, [cooldownMinutes]);

  // Send real notification to partner
  const notifyPartner = useCallback(async (appName: string, isYouTube: boolean, accountInfo?: YouTubeAccountInfo) => {
    if (!isConnected || !partner) {
      console.log('[Monitor] Cannot notify - not connected');
      return;
    }
    
    if (!enabledApps.includes(appName)) {
      console.log('[Monitor] App not in enabled list:', appName);
      return;
    }
    
    if (!canSendAlert()) {
      console.log('[Monitor] Alert on cooldown');
      return;
    }

    // Update last alert time
    lastAlertTimeRef.current = Date.now();

    // Send REAL event to partner via Supabase
    let success = false;
    if (isYouTube) {
      success = await sendYouTubeAlert({ accountName: accountInfo?.accountName });
    } else {
      success = await sendAppDistraction(appName);
    }

    if (success) {
      // Show local confirmation toast
      toast.info(
        isYouTube 
          ? `Notified ${partner.name} about YouTube 💕` 
          : `Sent heads up to ${partner.name} 💕`,
        {
          description: isYouTube 
            ? (accountInfo?.accountName ? `Account: ${accountInfo.accountName}` : 'Informational only')
            : `About ${appName}`,
          duration: 3000,
          icon: '💌',
        }
      );

      console.log('[Monitor] REAL notification sent to partner:', appName);
    } else {
      console.error('[Monitor] Failed to send notification');
    }

    // Set last detection
    setLastDetection({
      app: appName,
      timestamp: new Date(),
      isYouTube,
      accountInfo,
    });
  }, [isConnected, partner, enabledApps, canSendAlert, sendYouTubeAlert, sendAppDistraction]);

  // Handle native app detection event
  const handleNativeAppDetected = useCallback((info: ForegroundAppInfo) => {
    if (!enabledApps.includes(info.appName)) return;

    // Check if this is a new detection
    const isDifferentApp = !lastDetection || lastDetection.app !== info.appName;
    const isNewSession = !lastDetection || 
      (Date.now() - new Date(lastDetection.timestamp).getTime() > 5 * 60 * 1000);

    if (isDifferentApp || isNewSession) {
      notifyPartner(info.appName, info.isYouTube, info.youtubeAccountInfo);
    }
  }, [enabledApps, lastDetection, notifyPartner]);

  // Detect app from current page/tab (web-based detection)
  const detectCurrentApp = useCallback(async () => {
    if (document.hidden || !document.hasFocus()) return null;

    const currentUrl = window.location.href.toLowerCase();
    
    for (const [appName, patterns] of Object.entries(DETECTABLE_PATTERNS)) {
      for (const pattern of patterns) {
        if (currentUrl.includes(pattern)) {
          const isYouTube = appName === 'YouTube';
          
          // Try to get YouTube account info if applicable
          let accountInfo: YouTubeAccountInfo | undefined;
          if (isYouTube) {
            try {
              accountInfo = await UsageStats.getYouTubeAccountInfo();
            } catch (e) {
              console.log('[Monitor] YouTube account detection not available');
            }
          }
          
          return { app: appName, isYouTube, accountInfo };
        }
      }
    }
    
    return null;
  }, []);

  // Main detection loop
  const runDetection = useCallback(async () => {
    if (!isConnected) return;

    const detected = await detectCurrentApp();
    
    if (detected && enabledApps.includes(detected.app)) {
      const isDifferentApp = !lastDetection || lastDetection.app !== detected.app;
      const isNewSession = !lastDetection || 
        (Date.now() - new Date(lastDetection.timestamp).getTime() > 5 * 60 * 1000);

      if (isDifferentApp || isNewSession) {
        await notifyPartner(detected.app, detected.isYouTube, detected.accountInfo);
      }
    }
  }, [isConnected, enabledApps, detectCurrentApp, lastDetection, notifyPartner]);

  // Set up native monitoring
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isConnected) return;
    if (!hasNativePermission) return;

    const startNativeMonitoring = async () => {
      try {
        const handle = await UsageStats.addListener('appChanged', handleNativeAppDetected);
        listenerRemoveRef.current = async () => { await handle.remove(); };

        await UsageStats.startMonitoring({ intervalMs: 10000 });

        setIsMonitoring(true);
        console.log('[Monitor] Native monitoring started');
      } catch (e) {
        console.error('[Monitor] Failed to start native monitoring:', e);
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
  }, [isConnected, hasNativePermission, handleNativeAppDetected]);

  // Set up web-based visibility change listener
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!isConnected) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(runDetection, 100);
      }
    };

    const handleFocus = () => {
      setTimeout(runDetection, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Periodic checks
    const interval = setInterval(runDetection, 30000);

    setIsMonitoring(true);
    console.log('[Monitor] Web monitoring started');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [isConnected, runDetection]);

  // Manual trigger for testing
  const triggerDetection = useCallback(async (appName: string) => {
    const isYouTube = appName === 'YouTube';
    await notifyPartner(appName, isYouTube);
  }, [notifyPartner]);

  return {
    isMonitoring,
    lastDetection,
    canSendAlert: canSendAlert(),
    triggerDetection,
    runDetection,
    isNative,
    hasNativePermission,
    requestNativePermission,
  };
}
