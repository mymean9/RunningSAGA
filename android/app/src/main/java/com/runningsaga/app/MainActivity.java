package com.runningsaga.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.equimaps.capacitor_background_geolocation.BackgroundGeolocation;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(BackgroundGeolocation.class);
    }
}
