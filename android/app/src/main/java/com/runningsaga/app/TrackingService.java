package com.runningsaga.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import android.content.SharedPreferences;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;

public class TrackingService extends Service implements SensorEventListener {
    private static final String CHANNEL_ID = "RunningTrackerChannel";
    private static final int NOTIFICATION_ID = 1001;
    private PowerManager.WakeLock wakeLock;

    private SensorManager sensorManager;
    private Sensor stepSensor;
    private Sensor accelSensor;
    
    private boolean isInitialStepSet = false;
    private float initialStepCount = 0;
    
    // Software Fallback Variables
    private boolean isAccelPeak = false;
    private long lastAccelTime = 0;
    private int manualStepCount = 0;
    private float[] lastAccel = {0f, 0f, 0f};
    private float alpha = 0.8f;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Start Foreground Service with a sticky notification
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE);

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("🏃‍♂️ Running SAGA")
                .setContentText("러닝 기록을 측정 중입니다. 백그라운드에서 안전하게 진행됩니다.")
                .setSmallIcon(android.R.drawable.ic_menu_mylocation)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();

        // Important: Use startForeground for persistence on Android 10+
        startForeground(NOTIFICATION_ID, notification);

        // Keep CPU awake
        PowerManager powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "RunningSAGA:TrackerLock");
        wakeLock.acquire();

        // Register Hardware Step Counter & Accelerometer Fallback
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            stepSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            accelSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
            
            if (stepSensor != null) {
                sensorManager.registerListener(this, stepSensor, SensorManager.SENSOR_DELAY_UI);
            }
            if (accelSensor != null) {
                sensorManager.registerListener(this, accelSensor, SensorManager.SENSOR_DELAY_UI);
            }
        }

        // Reset step count for new session
        isInitialStepSet = false;
        manualStepCount = 0;
        SharedPreferences prefs = getSharedPreferences("SagaPrefs", Context.MODE_PRIVATE);
        prefs.edit().putInt("native_steps", 0).apply();

        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        if (sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
        }
        super.onDestroy();
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_STEP_COUNTER) {
            float totalSteps = event.values[0];
            if (!isInitialStepSet) {
                initialStepCount = totalSteps;
                isInitialStepSet = true;
            }
            int currentSessionSteps = (int) (totalSteps - initialStepCount);
            
            SharedPreferences prefs = getSharedPreferences("SagaPrefs", Context.MODE_PRIVATE);
            prefs.edit().putInt("native_steps", currentSessionSteps).apply();
            
        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            
            lastAccel[0] = alpha * lastAccel[0] + (1 - alpha) * x;
            lastAccel[1] = alpha * lastAccel[1] + (1 - alpha) * y;
            lastAccel[2] = alpha * lastAccel[2] + (1 - alpha) * z;
            
            double magnitude = Math.sqrt(lastAccel[0]*lastAccel[0] + lastAccel[1]*lastAccel[1] + lastAccel[2]*lastAccel[2]);
            long now = System.currentTimeMillis();
            
            if (magnitude > 12.0 && !isAccelPeak && (now - lastAccelTime) > 330) {
                isAccelPeak = true;
                lastAccelTime = now;
                manualStepCount++;
                
                // If the hardware step counter hasn't fired yet (e.g. permission denied or missing), use this software counter!
                if (!isInitialStepSet) {
                    SharedPreferences prefs = getSharedPreferences("SagaPrefs", Context.MODE_PRIVATE);
                    prefs.edit().putInt("native_steps", manualStepCount).apply();
                }
            } else if (magnitude < 10.5) {
                isAccelPeak = false;
            }
        }
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Running Tracker Channel",
                    NotificationManager.IMPORTANCE_HIGH
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
