import { registerPlugin } from '@capacitor/core';

export interface UsageStatsInfo {
  packageName: string;
  appName: string;
  lastTimeUsed: number;
  totalTimeInForeground: number;
  isCurrentlyActive: boolean;
}

export interface YouTubeAccountInfo {
  isLoggedIn: boolean;
  accountName: string | null;
  accountEmail: string | null;
  isDetectable: boolean;
}

export interface ForegroundAppInfo {
  packageName: string;
  appName: string;
  isYouTube: boolean;
  youtubeAccountInfo?: YouTubeAccountInfo;
}

export interface UsageStatsPlugin {
  /**
   * Check if UsageStats permission is granted
   */
  hasPermission(): Promise<{ granted: boolean }>;

  /**
   * Request UsageStats permission (opens system settings)
   */
  requestPermission(): Promise<void>;

  /**
   * Get current foreground app
   */
  getForegroundApp(): Promise<ForegroundAppInfo | null>;

  /**
   * Get usage stats for specified time range
   */
  getUsageStats(options: { 
    startTime: number; 
    endTime: number;
    packageNames?: string[];
  }): Promise<{ stats: UsageStatsInfo[] }>;

  /**
   * Start monitoring foreground app changes
   */
  startMonitoring(options?: { 
    intervalMs?: number;
    targetPackages?: string[];
  }): Promise<void>;

  /**
   * Stop monitoring foreground app changes
   */
  stopMonitoring(): Promise<void>;

  /**
   * Try to detect YouTube account info (privacy-safe)
   */
  getYouTubeAccountInfo(): Promise<YouTubeAccountInfo>;

  /**
   * Add listener for app change events
   */
  addListener(
    eventName: 'appChanged',
    listenerFunc: (info: ForegroundAppInfo) => void
  ): Promise<{ remove: () => void }>;
}

// Register the plugin - will use web implementation on web, native on native
const UsageStats = registerPlugin<UsageStatsPlugin>('UsageStats', {
  web: () => import('./UsageStatsWeb').then(m => new m.UsageStatsWeb()),
});

export default UsageStats;
