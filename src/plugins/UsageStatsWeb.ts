import { WebPlugin } from '@capacitor/core';
import type { UsageStatsPlugin, UsageStatsInfo, ForegroundAppInfo, YouTubeAccountInfo } from './UsageStatsPlugin';

// Web implementation - uses browser APIs for detection
export class UsageStatsWeb extends WebPlugin implements UsageStatsPlugin {
  private monitoringInterval: ReturnType<typeof setInterval> | null = null;
  private appListeners: ((info: ForegroundAppInfo) => void)[] = [];
  private lastDetectedApp: string | null = null;

  // Package to app name mapping for web
  private readonly APP_PATTERNS: Record<string, { patterns: string[]; name: string }> = {
    'com.google.android.youtube': { patterns: ['youtube.com', 'youtu.be'], name: 'YouTube' },
    'com.instagram.android': { patterns: ['instagram.com'], name: 'Instagram' },
    'com.facebook.katana': { patterns: ['facebook.com', 'fb.com'], name: 'Facebook' },
    'com.twitter.android': { patterns: ['twitter.com', 'x.com'], name: 'Twitter' },
    'com.zhiliaoapp.musically': { patterns: ['tiktok.com'], name: 'TikTok' },
    'com.netflix.mediaclient': { patterns: ['netflix.com'], name: 'Netflix' },
    'com.reddit.frontpage': { patterns: ['reddit.com'], name: 'Reddit' },
    'com.discord': { patterns: ['discord.com', 'discord.gg'], name: 'Discord' },
    'com.whatsapp': { patterns: ['web.whatsapp.com'], name: 'WhatsApp' },
    'tv.twitch.android.app': { patterns: ['twitch.tv'], name: 'Twitch' },
    'com.snapchat.android': { patterns: ['snapchat.com'], name: 'Snapchat' },
  };

  async hasPermission(): Promise<{ granted: boolean }> {
    // Web always has "permission" - we use visibility API
    return { granted: true };
  }

  async requestPermission(): Promise<void> {
    // No-op on web - permissions not needed
    console.log('[UsageStats Web] Permission request not needed on web');
  }

  async getForegroundApp(): Promise<ForegroundAppInfo | null> {
    if (document.hidden || !document.hasFocus()) {
      return null;
    }

    const currentUrl = window.location.href.toLowerCase();

    for (const [packageName, { patterns, name }] of Object.entries(this.APP_PATTERNS)) {
      for (const pattern of patterns) {
        if (currentUrl.includes(pattern)) {
          const isYouTube = packageName === 'com.google.android.youtube';
          
          return {
            packageName,
            appName: name,
            isYouTube,
            youtubeAccountInfo: isYouTube ? await this.getYouTubeAccountInfo() : undefined,
          };
        }
      }
    }

    return null;
  }

  async getUsageStats(options: { 
    startTime: number; 
    endTime: number;
    packageNames?: string[];
  }): Promise<{ stats: UsageStatsInfo[] }> {
    // Web cannot provide historical usage stats
    console.log('[UsageStats Web] Historical usage stats not available on web');
    return { stats: [] };
  }

  async startMonitoring(options?: { 
    intervalMs?: number;
    targetPackages?: string[];
  }): Promise<void> {
    const intervalMs = options?.intervalMs || 10000; // Default 10s

    // Set up visibility change listener
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleFocus);

    // Periodic check
    this.monitoringInterval = setInterval(() => {
      this.checkCurrentApp();
    }, intervalMs);

    console.log('[UsageStats Web] Monitoring started with interval:', intervalMs);
  }

  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleFocus);

    console.log('[UsageStats Web] Monitoring stopped');
  }

  async getYouTubeAccountInfo(): Promise<YouTubeAccountInfo> {
    // Privacy-safe detection on web
    // We can detect if user is logged in via cookie presence, but NOT access private data
    
    try {
      // Check for YouTube login indicators in the page (non-invasive)
      // This works when the app is embedded or on YouTube domain
      
      const currentUrl = window.location.href.toLowerCase();
      const isOnYouTube = currentUrl.includes('youtube.com');

      if (!isOnYouTube) {
        return {
          isLoggedIn: false,
          accountName: null,
          accountEmail: null,
          isDetectable: false,
        };
      }

      // Try to detect account name from page content (privacy-safe)
      // YouTube displays the account name in certain page elements when logged in
      const accountButton = document.querySelector('[aria-label*="Account"]');
      const channelName = document.querySelector('yt-formatted-string#account-name');
      
      // Check for login state via DOM hints
      const isLoggedIn = !!document.querySelector('#avatar-btn') || 
                         !!document.querySelector('button[aria-label*="Account"]');

      // Extract visible account name if present (user's own visible data)
      let accountName: string | null = null;
      if (channelName?.textContent) {
        accountName = channelName.textContent.trim();
      } else if (accountButton?.getAttribute('aria-label')) {
        const label = accountButton.getAttribute('aria-label') || '';
        // Extract name from "Account: [Name]" pattern
        const match = label.match(/Account[:\s]+(.+)/i);
        if (match) {
          accountName = match[1].trim();
        }
      }

      return {
        isLoggedIn,
        accountName,
        accountEmail: null, // Never access email - privacy
        isDetectable: isOnYouTube,
      };
    } catch (error) {
      console.log('[UsageStats Web] YouTube account detection failed (expected):', error);
      return {
        isLoggedIn: false,
        accountName: null,
        accountEmail: null,
        isDetectable: false,
      };
    }
  }

  async addListener(
    eventName: 'appChanged',
    listenerFunc: (info: ForegroundAppInfo) => void
  ): Promise<{ remove: () => Promise<void> }> {
    this.appListeners.push(listenerFunc);
    
    return {
      remove: async () => {
        const index = this.appListeners.indexOf(listenerFunc);
        if (index > -1) {
          this.appListeners.splice(index, 1);
        }
      }
    };
  }

  // Private methods
  private handleVisibilityChange = () => {
    if (!document.hidden) {
      setTimeout(() => this.checkCurrentApp(), 100);
    }
  };

  private handleFocus = () => {
    setTimeout(() => this.checkCurrentApp(), 100);
  };

  private async checkCurrentApp() {
    const appInfo = await this.getForegroundApp();
    
    if (appInfo && appInfo.packageName !== this.lastDetectedApp) {
      this.lastDetectedApp = appInfo.packageName;
      this.notifyAppListeners(appInfo);
    }
  }

  private notifyAppListeners(info: ForegroundAppInfo) {
    this.appListeners.forEach(listener => {
      try {
        listener(info);
      } catch (e) {
        console.error('[UsageStats Web] Listener error:', e);
      }
    });
  }
}
