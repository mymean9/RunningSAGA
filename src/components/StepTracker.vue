<template>
  <div class="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden relative font-sans">
    
    <!-- POCKET MODE OVERLAY -->
    <div 
      v-if="isScreenLocked" 
      class="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center select-none"
      @touchstart.prevent="handleUnlockStart"
      @touchend="handleUnlockEnd"
      @touchcancel="handleUnlockEnd"
      @touchmove="handleUnlockEnd"
      @mousedown="handleUnlockStart"
      @mouseup="handleUnlockEnd"
      @mouseleave="handleUnlockEnd"
    >
       <div class="relative w-32 h-32 flex justify-center items-center">
         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white/20"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
         <svg class="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"></circle>
            <circle cx="64" cy="64" r="56" fill="none" stroke="#CCFF00" stroke-width="4" stroke-dasharray="351.86" :stroke-dashoffset="351.86 - (351.86 * unlockProgress / 100)" class="transition-all duration-75 ease-linear"></circle>
         </svg>
       </div>
       <p class="text-white/40 font-bold tracking-widest text-xs mt-8 uppercase">HOLD TO UNLOCK</p>
    </div>

    <!-- FULLSCREEN MAP OVERLAY -->
    <div 
      v-if="isMapFullscreen" 
      class="fixed inset-0 z-[120] bg-black flex flex-col animate-fade-in pt-safe md:pt-0"
    >
       <div class="px-4 py-4 md:py-4 mt-8 md:mt-0 flex justify-between items-center bg-zinc-900 border-b border-white/10">
          <p class="text-volt font-black italic tracking-tighter uppercase leading-none">SAGA REALTIME MAP</p>
          <button @click="toggleMapFullscreen" class="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full hover:bg-white/20 active:scale-95 transition-all">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
       </div>
       <div class="relative flex-1 bg-zinc-800 isolate">
          <div ref="fullscreenMapContainer" class="absolute inset-0 w-full h-full z-[5]"></div>
          
          <button @click="toggleMapFullscreen" class="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20] bg-volt text-black px-6 py-3 rounded-full font-black italic tracking-tighter uppercase shadow-[0_0_20px_rgba(204,255,0,0.4)] flex items-center space-x-2 active:scale-[0.98] transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"></path><path d="M20 10h-6V4"></path><path d="M14 10l7-7"></path><path d="M3 21l7-7"></path></svg>
            <span>MINIMIZE MAP</span>
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

    <!-- BACKGROUND LOCATION GUIDE MODAL -->
    <div v-if="showPermissionGuide" class="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-6 backdrop-blur-md animate-fade-in">
       <div class="bg-zinc-900 border border-volt/30 p-8 rounded-sm max-w-sm w-full space-y-6 shadow-2xl">
          <div class="relative">
             <div class="absolute inset-0 bg-volt/20 blur-xl rounded-full"></div>
             <div class="relative w-20 h-20 bg-volt/10 border border-volt/50 rounded-full flex items-center justify-center text-volt mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
             </div>
          </div>
          <div class="text-center space-y-3">
             <h3 class="text-2xl font-black italic tracking-tighter uppercase leading-tight text-white whitespace-pre-line">백그라운드 기록을 위해<br/><span class="text-volt">"항상 허용"</span>이 필요합니다</h3>
             <p class="text-white/40 text-[13px] leading-relaxed">화면을 끄거나 다른 앱을 사용 중일 때도 기록이 중단되지 않으려면, 위치 권한을 반드시 <span class="text-white font-bold">"항상 허용(Allow all the time)"</span>으로 설정해야 합니다.</p>
          </div>
          <div class="space-y-3 pt-2">
             <button @click="openAppSettings" class="w-full bg-volt text-black py-5 font-black italic uppercase tracking-tighter active:scale-95 shadow-[0_0_25px_rgba(204,255,0,0.4)] transition-all">권한 설정하러 가기</button>
             <button @click="showPermissionGuide = false" class="w-full bg-white/5 border border-white/10 text-white/40 py-4 font-bold text-xs uppercase tracking-widest active:scale-95">다음에 하기</button>
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
             <div ref="mapContainer" class="absolute inset-0 w-full h-full z-[5]"></div>
             
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
          <div v-if="isTracking" class="grid grid-cols-2 gap-4">
             <button @click="enablePocketMode" class="bg-white/5 border border-white/10 text-white/50 py-4 font-bold text-[10px] uppercase tracking-widest active:bg-white/10 transition-colors">POCKET MODE</button>
             <button @click="stopTracking" class="bg-white text-black py-4 font-black italic text-lg uppercase tracking-tighter active:scale-[0.98] transition-all">PAUSE RUN</button>
          </div>
          <div v-else class="flex space-x-4">
             <button @click="startTracking" class="flex-1 bg-volt text-black py-5 font-black italic text-xl uppercase tracking-tighter active:scale-[0.98] transition-all">RESUME</button>
             <button @click="finishSession" class="flex-1 border-2 border-white text-white py-5 font-black italic text-xl uppercase tracking-tighter active:scale-[0.98] transition-all">FINISH</button>
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
import { registerPlugin } from '@capacitor/core';

// Native Bridge for Foreground Service
const TrackingBridge = registerPlugin('TrackingBridge');

// Dynamic import for background geolocation to avoid vite build errors
const getBackgroundGeolocation = async () => {
  return (await import('@capacitor-community/background-geolocation')).BackgroundGeolocation;
};

const props = defineProps({
  currentUser: Object
});

const steps = ref(0);
const isTracking = ref(false);
const lastStepTime = ref(0);
const threshold = ref(4.5);
const cooldown = 330;

// Pocket Mode / Lock variables
const isScreenLocked = ref(false);
const wakeLock = ref(null);
const unlockProgress = ref(0);
let unlockTimer = null;
let unlockInterval = null;

// Permission UI
const showPermissionGuide = ref(false);

// Map States & Variables
const mapContainer = ref(null);
const fullscreenMapContainer = ref(null);
const routeCoordinates = ref([]);
const isMapFullscreen = ref(false);
let map = null;
let polyline = null;
let marker = null;
let watchId = null;
let motionListenerId = null;

// Step calculation
const alpha = 0.8;
const lastAcc = { x: 0, y: 0, z: 0 };
const isPeak = ref(false);

const targetDistance = ref(5.0);

const distance = computed(() => (steps.value * 0.00075)); 
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

const handleMotion = (event) => {
  if (!isTracking.value) return;
  const acc = event.acceleration || event.accelerationIncludingGravity;
  if (!acc || acc.x === null) return;

  lastAcc.x = alpha * lastAcc.x + (1 - alpha) * acc.x;
  lastAcc.y = alpha * lastAcc.y + (1 - alpha) * acc.y;
  lastAcc.z = alpha * lastAcc.z + (1 - alpha) * acc.z;

  const magnitude = Math.sqrt(lastAcc.x ** 2 + lastAcc.y ** 2 + lastAcc.z ** 2);
  const now = Date.now();
  if (magnitude > threshold.value && !isPeak.value && (now - lastStepTime.value) > cooldown) {
    isPeak.value = true;
    steps.value++;
    lastStepTime.value = now;
  } else if (magnitude < threshold.value * 0.7) {
    isPeak.value = false;
  }
};

// PERMISSIONS
const requestPermission = async () => {
  try {
    const geoStatus = await Geolocation.checkPermissions();
    if (geoStatus.location !== 'granted') {
       const requestRes = await Geolocation.requestPermissions();
       if (requestRes.location !== 'granted') throw new Error('LOCATION_DENIED');
       showPermissionGuide.value = true;
    } else {
       showPermissionGuide.value = true; 
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
    alert("안드로이드 시스템 설정(Always Allow)으로 이동합니다.");
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
      // Shrinking: Move map BACK to the small container BEFORE removing the full screen overlay
      if (mapContainer.value) {
        mapContainer.value.appendChild(map.getContainer());
      }
      isMapFullscreen.value = false;
      setTimeout(() => { map.invalidateSize(); }, 300);
    } else {
      // Expanding: Show full screen overlay FIRST, then move the map
      isMapFullscreen.value = true;
      await nextTick();
      if (fullscreenMapContainer.value) {
        fullscreenMapContainer.value.appendChild(map.getContainer());
      }
      setTimeout(() => { map.invalidateSize(); }, 300);
    }
  } else {
    isMapFullscreen.value = !isMapFullscreen.value;
  }
};

// TRACKING ENGINE
const startTracking = async () => {
  if (steps.value === 0) speak("러닝 사가 측정을 시작합니다.");
  
  isTracking.value = true;
  
  // 1. Kickstart Native Survival Service
  try {
    await TrackingBridge.startService();
  } catch (e) { console.error("Native Bridge Start Failed:", e); }

  // 2. Start Steps (Motion)
  if (!motionListenerId) {
    motionListenerId = await Motion.addListener('accel', handleMotion);
  }

  await nextTick();
  
  // 3. IMMEDIATE MAP INITIALIZATION (CRITICAL FIX)
  // We initialize the map with a default view first so the user SEES the map container immediately.
  if (!map && mapContainer.value) {
    map = L.map(mapContainer.value, { 
      zoomControl: false,
      fadeAnimation: false,
      markerZoomAnimation: false
    }).setView([37.5665, 126.9780], 15); // Default Seoul view until GPS is locked
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
      attribution: '© OpenStreetMap', 
      crossOrigin: true 
    }).addTo(map);
    
    polyline = L.polyline(routeCoordinates.value, { color: '#0066FF', weight: 6, lineCap: 'round' }).addTo(map);
    marker = L.circleMarker([37.5665, 126.9780], { radius: 7, fillColor: "#0066FF", color: "#FFFFFF", weight: 3, opacity: 0, fillOpacity: 0 }).addTo(map);
    
    setTimeout(() => { if(map) map.invalidateSize(); }, 500);
  }

  // 4. Start GPS (Open Source Watcher)
  try {
    const BG = await getBackgroundGeolocation();
    watchId = await BG.addWatcher(
      { 
        backgroundTitle: "🏃‍♂️ Running SAGA Tracking",
        backgroundMessage: "백그라운드에서 실시간 기록 중입니다.",
        requestPermissions: true,
        stale: false,
        distanceFilter: 5
      },
      async (pos, err) => {
        if (err || !pos) return;
        const { latitude, longitude, accuracy } = pos;
        if (accuracy > 35) return; // Ignore low accuracy points

        const newPoint = [latitude, longitude];
        routeCoordinates.value.push(newPoint);

        if (map) {
          polyline.setLatLngs(routeCoordinates.value);
          marker.setLatLng(newPoint);
          marker.setStyle({ opacity: 1, fillOpacity: 1 }); // Show marker once GPS is locked
          if (!isMapFullscreen.value) {
             map.setView(newPoint, map.getZoom(), { animate: false });
          }
        }
      }
    );
  } catch (error) { console.error('Watcher failed:', error); }
};

const stopTracking = async () => {
  isTracking.value = false;
  try { await TrackingBridge.stopService(); } catch(e) {}
  
  if (motionListenerId) {
    Motion.removeAllListeners();
    motionListenerId = null;
  }
  if (watchId) {
    const BG = await getBackgroundGeolocation();
    await BG.removeWatcher({ id: watchId });
    watchId = null;
  }
};

const finishSession = async () => {
  if (steps.value > 0 && props.currentUser) {
    const captureEl = document.getElementById("capture-area");
    if (captureEl) {
      const canvas = await html2canvas(captureEl, { useCORS: true, backgroundColor: "#000000" });
      const imgData = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = imgData; a.download = `SAGA_Run.png`;
      a.click();
    }
    store.addRun({
      name: props.currentUser.name,
      distance: distance.value,
      pace: "AUTO",
      date: new Date().toISOString(),
      route: [...routeCoordinates.value]
    });
  }
  steps.value = 0; routeCoordinates.value = [];
  if (map) { map.remove(); map = null; }
  stopTracking();
};

const handleUnlockStart = () => {
  unlockProgress.value = 0;
  clearInterval(unlockInterval);
  clearTimeout(unlockTimer);
  unlockInterval = setInterval(() => { if (unlockProgress.value < 100) unlockProgress.value += 5; }, 50);
  unlockTimer = setTimeout(() => { isScreenLocked.value = false; unlockProgress.value = 0; clearInterval(unlockInterval); }, 1000);
};

const handleUnlockEnd = () => { clearInterval(unlockInterval); clearTimeout(unlockTimer); setTimeout(() => { if (isScreenLocked.value) unlockProgress.value = 0; }, 50); };

onUnmounted(() => { stopTracking(); if (map) { map.remove(); map = null; } });
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
