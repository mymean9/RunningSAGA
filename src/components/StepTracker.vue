<template>
  <div class="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden relative font-sans">
    
    <!-- FULLSCREEN MAP OVERLAY -->
    <div 
      v-if="isMapFullscreen" 
      class="fixed inset-0 z-[120] bg-black flex flex-col animate-fade-in pt-safe md:pt-0"
    >
       <div class="px-4 py-4 md:py-4 mt-8 md:mt-0 flex justify-between items-center bg-zinc-900 border-b border-white/10 relative z-[200]">
          <p class="text-volt font-black italic tracking-tighter uppercase leading-none">SAGA REALTIME MAP</p>
          <button @click="toggleMapFullscreen" class="w-12 h-12 bg-white/10 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
       </div>
       <div class="relative flex-1 bg-zinc-800 isolate">
          <div ref="fullscreenMapContainer" class="absolute inset-0 w-full h-full z-[5]"></div>
          
          <!-- My Location Button (Crosshairs) -->
          <button @click="centerOnMe" class="absolute bottom-28 right-6 z-[1000] w-14 h-14 bg-zinc-900 border-2 border-volt text-volt rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)] hover:bg-volt hover:text-black active:scale-95 transition-all cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>
          </button>
          
          <button @click="toggleMapFullscreen" class="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-volt text-black px-8 py-4 rounded-full font-black italic tracking-tighter uppercase shadow-[0_0_30px_rgba(204,255,0,0.5)] flex items-center space-x-2 active:scale-[0.95] transition-all cursor-pointer">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"></path><path d="M20 10h-6V4"></path><path d="M14 10l7-7"></path><path d="M3 21l7-7"></path></svg>
             <span class="text-lg text-black font-black uppercase">MINIMIZE MAP</span>
          </button>
       </div>
       <div class="p-6 bg-zinc-900 border-t border-white/10 grid grid-cols-2 gap-8 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-10 relative">
          <div class="text-center">
             <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1 font-sans">DISTANCE</p>
             <p class="text-3xl font-black italic text-white">{{ distance.toFixed(2) }} <span class="text-xs text-white/40">KM</span></p>
          </div>
          <div class="text-center">
             <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-1 font-sans">STEPS</p>
             <p class="text-3xl font-black italic text-volt">{{ steps }}</p>
          </div>
       </div>
    </div>



    <!-- START SCREEN -->
    <div v-if="!isTracking && steps === 0" class="text-center space-y-12 max-w-sm animate-fade-in">
       <div class="relative inline-block">
          <div class="absolute inset-0 bg-volt/20 blur-[60px] rounded-full"></div>
          <div class="relative w-36 h-36 bg-volt/5 border-2 border-volt rounded-full flex items-center justify-center text-volt mb-8">
             <svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><path d="M4 16v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M18 16v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"></path><path d="M4 20h16"></path><circle cx="12" cy="6" r="3"></circle></svg>
          </div>
       </div>
       <div class="space-y-4">
          <h2 class="text-5xl font-black italic uppercase tracking-tighter leading-[0.85]">READY TO<br/><span class="text-volt">SAGA RUN?</span></h2>
          <p class="text-white/40 text-xs font-bold uppercase tracking-[0.3em]">Professional Background Tracker</p>
       </div>
       <button 
         @click="requestPermission"
         class="w-full bg-volt text-black py-6 font-black italic text-2xl uppercase tracking-tighter hover:bg-white transition-all transform active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.2)]"
       >
         START TRACKING
       </button>
    </div>

    <!-- TRACKING ACTIVE SCREEN -->
    <div v-else id="capture-area" class="w-full max-w-md flex flex-col items-center space-y-6 bg-black">
       <!-- CIRCULAR STATS -->
       <div class="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 shrink-0">
          <svg class="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(204,255,0,0.2)] z-0">
             <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="12"></circle>
             <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#CCFF00" stroke-width="12" stroke-linecap="round" pathLength="100" stroke-dasharray="100" :stroke-dashoffset="100 - goalProgress" class="transition-all duration-1000 ease-out"></circle>
          </svg>
          <div class="text-center z-20 flex flex-col items-center justify-center">
             <span class="text-volt font-bold text-[10px] uppercase tracking-[0.4em] mb-1">{{ steps.toLocaleString() }} STEPS</span>
             <span class="block text-[85px] md:text-[110px] font-black italic tracking-tighter leading-none text-white animate-pulse-light">{{ distance.toFixed(2) }}</span>
             <span class="block text-volt font-black italic tracking-widest uppercase text-base mt-1">KM TRACKED</span>
          </div>
       </div>

       <!-- ENHANCED MAP CONTAINER (CLICK TO FULLSCREEN) -->
       <div class="w-full px-4 mb-2 cursor-pointer group" @click="toggleMapFullscreen">
          <div class="relative w-full h-48 bg-zinc-900 border border-white/10 rounded-sm overflow-hidden isolate shadow-2xl">
             <!-- The actual map div -->
             <div ref="mapWrapper" class="absolute inset-0 w-full h-full z-[5]">
                <div ref="mapContainer" class="w-full h-full"></div>
             </div>
             
             <!-- Overlay UI -->
             <div class="absolute top-3 right-3 z-[20] bg-black/60 p-2.5 rounded-full border border-white/10 opacity-60 group-hover:opacity-100 group-hover:bg-volt group-hover:text-black transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
             </div>
             <div class="absolute bottom-3 left-3 z-[20] bg-black/50 px-3 py-1.5 text-[9px] font-bold text-white/70 tracking-[0.2em] uppercase border border-white/5 backdrop-blur-sm">TAP TO FULLSCREEN</div>
          </div>
       </div>

       <!-- STATS INFO -->
       <div class="grid grid-cols-2 gap-4 w-full px-4">
          <div class="bg-zinc-900/50 border border-white/10 p-5 rounded-sm text-center">
             <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">BURNED</p>
             <p class="text-2xl font-black italic text-white leading-none">{{ calories }} <span class="text-xs text-white/30">KCAL</span></p>
          </div>
          <div class="bg-zinc-900/50 border border-white/10 p-5 rounded-sm text-center">
             <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1">REALTIME</p>
             <p class="text-2xl font-black italic text-volt leading-none uppercase tracking-tighter">{{ isTracking ? 'ACTIVE' : 'READY' }}</p>
          </div>
       </div>

       <!-- ACTION CONTROLS -->
       <div class="flex flex-col w-full px-4 space-y-4 pb-12">
          <div v-if="isTracking" class="w-full">
             <button @click="stopTracking" class="w-full bg-white text-black py-4 font-black italic text-xl uppercase tracking-tighter active:scale-[0.98] transition-all">PAUSE RUN</button>
          </div>
          <div v-else class="flex space-x-2">
             <button @click="startTracking" class="flex-1 bg-volt text-black py-4 font-black italic text-sm uppercase tracking-tighter active:scale-[0.98] transition-all">RESUME</button>
             <button @click="finishSession" class="flex-1 border-2 border-white text-white py-4 font-black italic text-sm uppercase tracking-tighter active:scale-[0.98] transition-all">SAVE</button>
             <button @click="discardSession" class="flex-1 border border-red-500/50 text-red-500 py-4 font-black italic text-sm uppercase tracking-tighter active:scale-[0.98] transition-all">DISCARD</button>
          </div>
       </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick, watch } from 'vue';
import { store } from '../dataStore';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import html2canvas from 'html2canvas';

// Capacitor Native Plugins
import { Geolocation } from '@capacitor/geolocation';
import { Motion } from '@capacitor/motion';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App } from '@capacitor/app';
import { registerPlugin } from '@capacitor/core';

// Native Bridge for Foreground Service
const TrackingBridge = registerPlugin('TrackingBridge');

// Dynamic import for background geolocation to avoid vite build errors
const getBackgroundGeolocation = async () => {
  return (await import('@capacitor-community/background-geolocation')).BackgroundGeolocation;
};

// Haversine formula for distance between coordinates in meters
const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const props = defineProps({
  currentUser: Object
});

const steps = ref(0);
const gpsDistance = ref(0);
const isTracking = ref(false);
const lastStepTime = ref(0);
const threshold = ref(3.5);
const cooldown = 330;

const discardSession = () => {
  if(confirm("기록을 저장하지 않고 모두 지우시겠습니까?")) {
    steps.value = 0; 
    gpsDistance.value = 0;
    routeCoordinates.value = [];
    if (map) { map.remove(); map = null; }
    stopTracking();
  }
};



// Map States & Variables
const mapWrapper = ref(null);
const mapContainer = ref(null);
const fullscreenMapContainer = ref(null);
const routeCoordinates = ref([]);
const isMapFullscreen = ref(false);
let map = null;
let polyline = null;
let marker = null;
let watchId = null;

// Native Step Poller
let nativeStepInterval = null;

const pollNativeSteps = async () => {
  if (!isTracking.value) return;
  try {
    const res = await TrackingBridge.getNativeSteps();
    if (res && res.steps > 0) {
      steps.value = res.steps;
    }
  } catch (e) {
    // silently fail until native plugin responds
  }
};

const targetDistance = ref(5.0);

const distance = computed(() => (gpsDistance.value / 1000)); 
const calories = computed(() => Math.floor(steps.value * 0.04));
const goalProgress = computed(() => Math.min(100, (distance.value / targetDistance.value) * 100));

// Voice Coach System
const speak = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
};

let lastAnnouncedKm = 0;
let goalReachedAnnounced = false;

watch(distance, (newDist) => {
  if (isTracking.value && newDist > 0) {
    const currentKmFloor = Math.floor(newDist);
    if (currentKmFloor > lastAnnouncedKm) {
      lastAnnouncedKm = currentKmFloor;
      speak(`축하합니다. ${currentKmFloor} 킬로미터를 돌파했습니다.`);
    }
    if (!goalReachedAnnounced && newDist >= targetDistance.value) {
      goalReachedAnnounced = true;
      speak("목표 지점에 도착했습니다! 대단한 기록입니다.");
    }
  }
});

// PERMISSIONS
const requestPermission = async () => {
  try {
    const geoStatus = await Geolocation.checkPermissions();
    if (geoStatus.location !== 'granted') {
       const requestRes = await Geolocation.requestPermissions();
       if (requestRes.location !== 'granted') throw new Error('LOCATION_DENIED');
    }
    
    await LocalNotifications.requestPermissions();

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      await DeviceMotionEvent.requestPermission();
    }

    startTracking();
  } catch (error) {
    console.error('Permission flow error:', error);
    openAppSettings();
  }
};

const openAppSettings = async () => {
  try {
    alert("안드로이드 시스템 설정으로 이동합니다. 위치 권한을 확인해 주세요.");
    await TrackingBridge.openAppSettings();
  } catch (e) {
    console.error("Native settings open failed", e);
    alert("설정 화면을 열지 못했습니다: " + (e.message || "알 수 없는 오류"));
    // Fallback to plugin if native fails
    const BG = await getBackgroundGeolocation();
    await BG.openSettings();
  }
};

const toggleMapFullscreen = async () => {
  if (map) {
    if (isMapFullscreen.value) {
      // Shrinking: Move map wrapper BACK to the small container BEFORE removing the full screen overlay
      if (mapWrapper.value && mapContainer.value) {
        mapWrapper.value.appendChild(mapContainer.value);
      }
      isMapFullscreen.value = false;
      setTimeout(() => { map.invalidateSize(); }, 300);
    } else {
      // Expanding: Show full screen overlay FIRST, then move the map wrapper
      isMapFullscreen.value = true;
      await nextTick();
      if (fullscreenMapContainer.value && mapContainer.value) {
        fullscreenMapContainer.value.appendChild(mapContainer.value);
      }
      setTimeout(() => { map.invalidateSize(); }, 300);
    }
  } else {
    isMapFullscreen.value = !isMapFullscreen.value;
  }
};

const centerOnMe = () => {
  if (map && routeCoordinates.value.length > 0) {
    const lastPoint = routeCoordinates.value[routeCoordinates.value.length - 1];
    map.setView(lastPoint, 16, { animate: true, duration: 0.5 });
  }
};

// TRACKING ENGINE
const startTracking = async () => {
  if (steps.value === 0) speak("러닝 사가 측정을 시작합니다.");
  
  isTracking.value = true;
  store.isTrackingActive = true;
  
  // 1. Kickstart Native Survival Service
  try {
    await TrackingBridge.startService();
  } catch (e) { console.error("Native Bridge Start Failed:", e); }

  // 2. Start Steps (Native Poller)
  if (!nativeStepInterval) {
    nativeStepInterval = setInterval(pollNativeSteps, 1500);
  }

  await nextTick();
  
  // 3. IMMEDIATE MAP INITIALIZATION
  let initLat = 37.5665;
  let initLng = 126.9780;

  if (!map && mapContainer.value) {
    map = L.map(mapContainer.value, { 
      zoomControl: false,
      fadeAnimation: false,
      markerZoomAnimation: false
    }).setView([initLat, initLng], 15); 
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap', 
      crossOrigin: true 
    }).addTo(map);
    
    polyline = L.polyline(routeCoordinates.value, { color: '#CCFF00', weight: 8, lineCap: 'round', lineJoin: 'round', opacity: 0.9 }).addTo(map);
    // Setup invisible marker initially until real location arrives
    marker = L.circleMarker([initLat, initLng], { radius: 8, fillColor: "#CCFF00", color: "#FFFFFF", weight: 3, opacity: 0, fillOpacity: 0 }).addTo(map);
    
    setTimeout(() => { if(map) map.invalidateSize(); }, 500);

    // Fast asynchronous location request to update the initially grey/seoul map
    Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 })
      .then(pos => {
        initLat = pos.coords.latitude;
        initLng = pos.coords.longitude;
        routeCoordinates.value.push([initLat, initLng]);
        if (map) {
          marker.setLatLng([initLat, initLng]);
          marker.setStyle({ opacity: 1, fillOpacity: 1 });
          map.setView([initLat, initLng], 15);
        }
      })
      .catch(e => console.warn("Could not get fast initial location", e));
  }

  // 4. Start GPS (Standard Watcher supported by Foreground Service)
  try {
    watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      (pos, err) => {
        if (err || !pos || !pos.coords) return;
        const { latitude, longitude, accuracy } = pos.coords;
        
        // Strict accuracy filter to entirely drop GPS bounces
        // Ignore locations with worse than 40m precision (very normal bounds for smartphones)
        if (accuracy > 40) return; 

        // Apply a Distance Threshold (Minimum Distance Filter)
        if (routeCoordinates.value.length > 0) {
          const lastPoint = routeCoordinates.value[routeCoordinates.value.length - 1];
          const dist = calculateDistanceMeters(lastPoint[0], lastPoint[1], latitude, longitude);
          
          // Drop point if the user moved less than 6 meters (filters out jitter when stopping or walking slowly)
          if (dist < 6) return;
          
          // Accumulate actual real-world GPS distance
          gpsDistance.value += dist;
        }

        const newPoint = [latitude, longitude];
        routeCoordinates.value.push(newPoint);

        if (map) {
          polyline.setLatLngs([...routeCoordinates.value]);
          marker.setLatLng(newPoint);
          marker.setStyle({ opacity: 1, fillOpacity: 1 });
          if (!isMapFullscreen.value) {
             map.setView(newPoint, map.getZoom(), { animate: true, duration: 0.5 });
          }
        }
      }
    );
  } catch (error) { console.error('Watcher failed:', error); }
};

const stopTracking = async () => {
  isTracking.value = false;
  store.isTrackingActive = false;
  try { await TrackingBridge.stopService(); } catch(e) {}
  
  if (nativeStepInterval) {
    clearInterval(nativeStepInterval);
    nativeStepInterval = null;
  }
  if (watchId) {
    await Geolocation.clearWatch({ id: watchId });
    watchId = null;
  }
};

const finishSession = async () => {
  if (steps.value > 0 && props.currentUser) {
    let imgData = null;
    try {
      const captureEl = document.getElementById("capture-area");
      if (captureEl) {
        const canvas = await html2canvas(captureEl, { useCORS: true, backgroundColor: "#000000" });
        imgData = canvas.toDataURL("image/png");
      }
    } catch (e) {
      console.warn("지도 캡처 실패:", e);
    }
    
    try {
      await store.addRun({
        name: props.currentUser.name,
        distance: distance.value,
        pace: "AUTO",
        date: new Date().toISOString(),
        route: [...routeCoordinates.value],
        image: imgData
      });
      alert("성공적으로 기록이 저장되었습니다! 대시보드에서 확인해 보세요.");
    } catch (e) {
      alert("저장 중 오류가 발생했습니다: " + e.message);
    }
  } else if (!props.currentUser) {
    alert("로그인이 필요합니다.");
  } else {
    alert("저장할 걸음 또는 거리가 없습니다.");
  }
  
  steps.value = 0; 
  gpsDistance.value = 0;
  routeCoordinates.value = [];
  if (map) { map.remove(); map = null; }
  stopTracking();
};

// Android Back Button Handler
let backButtonListener = null;

const setupBackButton = async () => {
  backButtonListener = await App.addListener('backButton', () => {
    if (isMapFullscreen.value) {
      toggleMapFullscreen();
    } else if (isScreenLocked.value) {
      // Don't go back if locked
    } else {
      // Default behavior or App.exitApp() if needed
    }
  });
};

import { onMounted } from 'vue';
onMounted(() => {
  setupBackButton();
});

onUnmounted(() => { 
  stopTracking(); 
  if (map) { map.remove(); map = null; }
  if (backButtonListener) {
    backButtonListener.remove();
  }
});
</script>

<style scoped>
.animate-pulse-light {
  animation: pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* LEAFLET INTEGRITY */
:deep(.leaflet-container) {
  height: 100% !important;
  width: 100% !important;
  background: #09090b !important;
  z-index: 1;
}
:deep(.leaflet-tile-pane) {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

@keyframes pulse-light {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.01); }
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}
</style>
