package com.runningsaga.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(TrackingBridge.class);
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Running Tracker Channel";
            String description = "Notifications for Running SAGA tracker";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel("RunningTrackerChannel", name, importance);
            channel.setDescription(description);
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
}

@CapacitorPlugin(name = "TrackingBridge")
class TrackingBridge extends Plugin {
    @PluginMethod
    public void startService(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, TrackingService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, TrackingService.class);
        context.stopService(intent);
        call.resolve();
    }
}

