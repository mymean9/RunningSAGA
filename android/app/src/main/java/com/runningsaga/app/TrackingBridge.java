package com.runningsaga.app;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "TrackingBridge")
public class TrackingBridge extends Plugin {
    @PluginMethod
    public void startService(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent(context, TrackingService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent);
            } else {
                context.startService(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Start Service Failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        try {
            Context context = getContext();
            Intent intent = new Intent(context, TrackingService.class);
            context.stopService(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Stop Service Failed: " + e.getMessage());
        }
    }

    @PluginMethod
    public void openAppSettings(PluginCall call) {
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            Uri uri = Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            // Use Activity to start settings for better compatibility on Android 16
            getActivity().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Open Settings Failed: " + e.getMessage());
        }
    }
}

