package app.lovable.focuso;

import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.SortedMap;
import java.util.TreeMap;

@CapacitorPlugin(name = "UsageStats")
public class UsageStatsPlugin extends Plugin {

    private static final String YOUTUBE_PACKAGE = "com.google.android.youtube";
    private static final long DEFAULT_CHECK_INTERVAL = 10000; // 10 seconds

    private Handler monitorHandler;
    private Runnable monitorRunnable;
    private boolean isMonitoring = false;
    private String lastForegroundApp = null;
    private long checkInterval = DEFAULT_CHECK_INTERVAL;
    private List<String> targetPackages = new ArrayList<>();

    @Override
    public void load() {
        super.load();
        monitorHandler = new Handler(Looper.getMainLooper());
        
        // Default target packages
        targetPackages.add("com.google.android.youtube");
        targetPackages.add("com.instagram.android");
        targetPackages.add("com.facebook.katana");
        targetPackages.add("com.twitter.android");
        targetPackages.add("com.zhiliaoapp.musically");
        targetPackages.add("com.netflix.mediaclient");
        targetPackages.add("com.reddit.frontpage");
        targetPackages.add("com.discord");
        targetPackages.add("com.whatsapp");
        targetPackages.add("tv.twitch.android.app");
        targetPackages.add("com.snapchat.android");
    }

    @PluginMethod
    public void hasPermission(PluginCall call) {
        JSObject result = new JSObject();
        result.put("granted", hasUsageStatsPermission());
        call.resolve(result);
    }

    @PluginMethod
    public void requestPermission(PluginCall call) {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }

    @PluginMethod
    public void getForegroundApp(PluginCall call) {
        if (!hasUsageStatsPermission()) {
            call.reject("Usage stats permission not granted");
            return;
        }

        String foregroundPackage = getCurrentForegroundPackage();
        
        if (foregroundPackage == null) {
            call.resolve(null);
            return;
        }

        JSObject result = buildAppInfo(foregroundPackage);
        call.resolve(result);
    }

    @PluginMethod
    public void getUsageStats(PluginCall call) {
        if (!hasUsageStatsPermission()) {
            call.reject("Usage stats permission not granted");
            return;
        }

        long startTime = call.getLong("startTime", 0L);
        long endTime = call.getLong("endTime", System.currentTimeMillis());

        UsageStatsManager usageStatsManager = (UsageStatsManager) 
            getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        
        List<UsageStats> statsList = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, startTime, endTime);

        JSONArray statsArray = new JSONArray();
        String currentForeground = getCurrentForegroundPackage();

        for (UsageStats stats : statsList) {
            String packageName = stats.getPackageName();
            
            // Filter if target packages specified
            if (!targetPackages.isEmpty() && !targetPackages.contains(packageName)) {
                continue;
            }

            try {
                JSONObject statObj = new JSONObject();
                statObj.put("packageName", packageName);
                statObj.put("appName", getAppName(packageName));
                statObj.put("lastTimeUsed", stats.getLastTimeUsed());
                statObj.put("totalTimeInForeground", stats.getTotalTimeInForeground());
                statObj.put("isCurrentlyActive", packageName.equals(currentForeground));
                statsArray.put(statObj);
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }

        JSObject result = new JSObject();
        try {
            result.put("stats", new JSONArray(statsArray.toString()));
        } catch (JSONException e) {
            result.put("stats", new JSONArray());
        }
        call.resolve(result);
    }

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        if (!hasUsageStatsPermission()) {
            call.reject("Usage stats permission not granted");
            return;
        }

        if (isMonitoring) {
            call.resolve();
            return;
        }

        checkInterval = call.getLong("intervalMs", DEFAULT_CHECK_INTERVAL);
        
        // Update target packages if provided
        try {
            JSONArray packages = call.getArray("targetPackages");
            if (packages != null && packages.length() > 0) {
                targetPackages.clear();
                for (int i = 0; i < packages.length(); i++) {
                    targetPackages.add(packages.getString(i));
                }
            }
        } catch (JSONException e) {
            // Use defaults
        }

        monitorRunnable = new Runnable() {
            @Override
            public void run() {
                checkForegroundApp();
                if (isMonitoring) {
                    monitorHandler.postDelayed(this, checkInterval);
                }
            }
        };

        isMonitoring = true;
        monitorHandler.post(monitorRunnable);
        call.resolve();
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        isMonitoring = false;
        if (monitorHandler != null && monitorRunnable != null) {
            monitorHandler.removeCallbacks(monitorRunnable);
        }
        lastForegroundApp = null;
        call.resolve();
    }

    @PluginMethod
    public void getYouTubeAccountInfo(PluginCall call) {
        // Privacy-safe YouTube account detection
        // We can detect if YouTube is active but cannot access account details on Android
        // This respects privacy while still providing useful information
        
        JSObject result = new JSObject();
        String foreground = getCurrentForegroundPackage();
        boolean isYouTubeActive = YOUTUBE_PACKAGE.equals(foreground);

        if (isYouTubeActive) {
            result.put("isLoggedIn", true); // Assume logged in if app is open
            result.put("accountName", null); // Cannot access without invasive permissions
            result.put("accountEmail", null);
            result.put("isDetectable", false); // Native cannot access account without special APIs
        } else {
            result.put("isLoggedIn", false);
            result.put("accountName", null);
            result.put("accountEmail", null);
            result.put("isDetectable", false);
        }

        call.resolve(result);
    }

    // Private helper methods

    private boolean hasUsageStatsPermission() {
        AppOpsManager appOps = (AppOpsManager) getContext().getSystemService(Context.APP_OPS_SERVICE);
        int mode = appOps.checkOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS,
            android.os.Process.myUid(),
            getContext().getPackageName()
        );
        return mode == AppOpsManager.MODE_ALLOWED;
    }

    private String getCurrentForegroundPackage() {
        UsageStatsManager usageStatsManager = (UsageStatsManager) 
            getContext().getSystemService(Context.USAGE_STATS_SERVICE);
        
        long endTime = System.currentTimeMillis();
        long startTime = endTime - 60000; // Last minute

        UsageEvents usageEvents = usageStatsManager.queryEvents(startTime, endTime);
        String lastPackage = null;
        long lastTime = 0;

        while (usageEvents.hasNextEvent()) {
            UsageEvents.Event event = new UsageEvents.Event();
            usageEvents.getNextEvent(event);
            
            if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
                if (event.getTimeStamp() > lastTime) {
                    lastTime = event.getTimeStamp();
                    lastPackage = event.getPackageName();
                }
            }
        }

        return lastPackage;
    }

    private String getAppName(String packageName) {
        PackageManager pm = getContext().getPackageManager();
        try {
            ApplicationInfo appInfo = pm.getApplicationInfo(packageName, 0);
            return pm.getApplicationLabel(appInfo).toString();
        } catch (PackageManager.NameNotFoundException e) {
            return packageName;
        }
    }

    private JSObject buildAppInfo(String packageName) {
        JSObject result = new JSObject();
        result.put("packageName", packageName);
        result.put("appName", getAppName(packageName));
        result.put("isYouTube", YOUTUBE_PACKAGE.equals(packageName));

        if (YOUTUBE_PACKAGE.equals(packageName)) {
            JSObject youtubeInfo = new JSObject();
            youtubeInfo.put("isLoggedIn", true);
            youtubeInfo.put("accountName", null);
            youtubeInfo.put("accountEmail", null);
            youtubeInfo.put("isDetectable", false);
            result.put("youtubeAccountInfo", youtubeInfo);
        }

        return result;
    }

    private void checkForegroundApp() {
        String currentPackage = getCurrentForegroundPackage();
        
        if (currentPackage != null && 
            !currentPackage.equals(lastForegroundApp) &&
            targetPackages.contains(currentPackage)) {
            
            lastForegroundApp = currentPackage;
            
            JSObject data = buildAppInfo(currentPackage);
            notifyListeners("appChanged", data);
        }
    }
}
