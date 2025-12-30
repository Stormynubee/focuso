import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f235f8f553a2483dbe4cc93f49d6ba2c',
  appName: 'focuso',
  webDir: 'dist',
  server: {
    url: 'https://f235f8f5-53a2-483d-be4c-c93f49d6ba2c.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    // UsageStats plugin configuration
    UsageStats: {
      // Check interval in seconds
      checkInterval: 10,
      // Apps to monitor
      targetPackages: [
        'com.google.android.youtube',
        'com.instagram.android',
        'com.facebook.katana',
        'com.twitter.android',
        'com.zhiliaoapp.musically', // TikTok
        'com.netflix.mediaclient',
        'com.reddit.frontpage',
        'com.discord',
        'com.whatsapp',
        'tv.twitch.android.app',
        'com.snapchat.android',
      ]
    }
  }
};

export default config;
