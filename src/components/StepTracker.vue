<template>
  <div class="min-h-[calc(100vh-80px)] bg-black flex flex-col items-center justify-center p-6 text-white overflow-hidden relative">
    
    <!-- POCKET MODE OVERLAY -->
    <div 
      v-if="isScreenLocked" 
      class="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none"
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
         
         <!-- Progress Circle -->
         <svg class="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"></circle>
            <circle cx="64" cy="64" r="56" fill="none" stroke="#CCFF00" stroke-width="4" stroke-dasharray="351.86" :stroke-dashoffset="351.86 - (351.86 * unlockProgress / 100)" class="transition-all duration-75 ease-linear"></circle>
         </svg>
       </div>
       <p class="text-white/40 font-bold tracking-widest text-xs mt-8">HOLD TO UNLOCK</p>
    </div>

    <!-- PERMISSION / START SCREEN -->
    <div v-if="!isTracking && steps === 0" class="text-center space-y-8 max-w-sm animate-fade-in">
       <div class="relative inline-block">
          <div class="absolute inset-0 bg-volt/20 blur-3xl rounded-full"></div>
          <div class="relative w-32 h-32 bg-volt/10 border-2 border-volt rounded-full flex items-center justify-center text-volt mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-bounce"><path d="M4 16v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path><path d="M18 16v-2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"></path><path d="M4 20h16"></path><circle cx="12" cy="6" r="3"></circle></svg>
          </div>
       </div>
       <h2 class="text-4xl font-black italic uppercase tracking-tighter">READY TO<br/><span class="text-volt">SAGA RUN?</span></h2>
       
       <!-- GOAL SELECTION -->
       <div class="w-full space-y-2 mt-4">
          <p class="text-white/40 text-xs font-bold uppercase tracking-widest">SET YOUR DISTANCE GOAL (KM)</p>
          <div class="flex justify-between items-center bg-white/5 border border-white/10 rounded-sm p-2">
             <button @click="targetDistance = Math.max(1, targetDistance - 1)" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 font-bold active:scale-95 transition-transform">-</button>
             <span class="text-3xl font-black italic text-volt">{{ targetDistance.toFixed(1) }}</span>
             <button @click="targetDistance += 1" class="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 font-bold active:scale-95 transition-transform">+</button>
          </div>
       </div>
       <button 
         @click="requestPermission"
         class="w-full bg-volt text-black py-5 font-black italic text-xl uppercase tracking-tighter hover:bg-white transition-all transform active:scale-95 shadow-[0_0_20px_rgba(204,255,0,0.3)]"
       >
         START TRACKING
       </button>
    </div>

    <!-- TRACKING ACTIVE SCREEN -->
    <div v-else id="capture-area" class="w-full max-w-md flex flex-col items-center space-y-12 bg-black py-4">
       <!-- MAIN COUNTER -->
       <div class="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
          <!-- Outer Goal Progress Ring -->
          <svg class="absolute inset-0 w-full h-full -rotate-90 drop-shadow-[0_0_15px_rgba(204,255,0,0.3)] z-0">
             <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="8"></circle>
             <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#CCFF00" stroke-width="8" stroke-linecap="round"
                    pathLength="100" stroke-dasharray="100"
                    :stroke-dashoffset="100 - goalProgress"
                    class="transition-all duration-1000 ease-out"></circle>
          </svg>
          
          <!-- Inner Rotating Activity Indicator -->
          <div 
            class="absolute w-56 h-56 md:w-72 md:h-72 border-r-4 border-b-4 border-volt/50 rounded-full transition-transform duration-200 z-10"
            :style="{ transform: `rotate(${steps * 10}deg)` }"
          ></div>

          <div class="text-center z-20 flex flex-col items-center justify-center">
             <span class="text-volt font-bold text-xs uppercase tracking-widest mb-2 px-3 py-1 bg-volt/10 rounded-full border border-volt/20">{{ goalProgress.toFixed(0) }}% TO GOAL</span>
             <span class="block text-[80px] md:text-[110px] font-black italic tracking-tighter leading-none text-white animate-pulse-light">
               {{ steps }}
             </span>
             <span class="block text-volt font-black italic tracking-[0.5em] uppercase text-sm -mt-2">STEPS</span>
          </div>
       </div>

       <!-- MAP CONTAINER -->
       <div class="w-full px-4 mb-2">
          <div ref="mapContainer" class="w-full h-56 bg-white/5 border border-white/10 rounded-sm overflow-hidden isolate" style="z-index: 10"></div>
       </div>

       <!-- STATS GRID -->
       <div class="grid grid-cols-2 gap-6 w-full px-4">
          <div class="bg-white/5 border border-white/10 p-4 rounded-sm">
             <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">DISTANCE</p>
             <p class="text-2xl font-black italic text-white tracking-tighter mt-1">{{ distance.toFixed(2) }} <span class="text-xs">KM</span></p>
          </div>
          <div class="bg-white/5 border border-white/10 p-4 rounded-sm">
             <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">ENERGY</p>
             <p class="text-2xl font-black italic text-white tracking-tighter mt-1">{{ calories }} <span class="text-xs">KCAL</span></p>
          </div>
       </div>

       <!-- SENSITIVITY CONTROL -->
       <div class="w-full px-4 space-y-2">
          <div class="flex justify-between items-end">
             <p class="text-[9px] font-bold text-white/40 uppercase tracking-widest leading-none">SENSITIVITY (THRESHOLD)</p>
             <p class="text-xs font-black italic text-volt">{{ threshold.toFixed(1) }}</p>
          </div>
          <input 
            type="range" 
            v-model.number="threshold" 
            min="1.0" 
            max="15.0" 
            step="0.1"
            class="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-volt"
          />
          <div class="flex justify-between text-[8px] text-white/20 font-bold uppercase tracking-widest">
             <span>SENSITIVE</span>
             <span>STRICT</span>
          </div>
       </div>

       <!-- CONTROLS -->
       <div class="flex flex-col w-full px-4 space-y-4">
          <button 
            v-if="isTracking"
            @click="enablePocketMode"
            class="w-full bg-transparent border-2 border-white/20 text-white/50 py-3 font-bold text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            <span>POCKET MODE (LOCK)</span>
          </button>
          
          <button 
            v-if="isTracking"
            @click="stopTracking"
            class="w-full bg-white text-black py-4 font-black italic text-lg uppercase tracking-tighter transition-all active:scale-95"
          >
            PAUSE SESSION
          </button>
          <div v-else class="flex space-x-4">
             <button 
                @click="startTracking"
                class="flex-1 bg-volt text-black py-4 font-black italic text-lg uppercase tracking-tighter transition-all active:scale-95"
             >
                RESUME
             </button>
             <button 
                @click="finishSession"
                class="flex-1 border-2 border-white text-white py-4 font-black italic text-lg uppercase tracking-tighter transition-all active:scale-95"
             >
                FINISH & LOG
             </button>
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

// GPS Map variables
const mapContainer = ref(null);
const routeCoordinates = ref([]);
let map = null;
let polyline = null;
let marker = null;
let watchId = null;
let motionListenerId = null;

// Low-pass filter variables
const alpha = 0.8;
const lastAcc = { x: 0, y: 0, z: 0 };
const isPeak = ref(false);

const targetDistance = ref(5.0);

const distance = computed(() => (steps.value * 0.00075)); 
const calories = computed(() => Math.floor(steps.value * 0.04));
const goalProgress = computed(() => {
  return Math.min(100, Math.max(0, (distance.value / targetDistance.value) * 100));
});

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
      speak(`축하합니다. ${currentKmFloor} 킬로미터를 돌파했습니다! 현재 소모 칼로리는 ${calories.value} 칼로리입니다.`);
    }
    
    if (!goalReachedAnnounced && newDist >= targetDistance.value) {
      goalReachedAnnounced = true;
      speak("목표 거리를 달성했습니다! 대단한 성과입니다!");
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

const requestPermission = async () => {
  try {
    const geoStatus = await Geolocation.checkPermissions();
    if (geoStatus.location !== 'granted') {
       const requestRes = await Geolocation.requestPermissions();
       if (requestRes.location !== 'granted') {
         throw new Error('LOCATION_PERMISSION_DENIED');
       }
    }
    
    try {
      const notifyPerm = await LocalNotifications.requestPermissions();
      if (notifyPerm.display !== 'granted') {
        console.warn("Notification permission denied by user");
      }
    } catch (e) {
      console.warn("LocalNotifications not supported");
    }

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      const motionRes = await DeviceMotionEvent.requestPermission();
      if (motionRes !== 'granted') {
        throw new Error('MOTION_PERMISSION_DENIED');
      }
    }

    startTracking();
  } catch (error) {
    console.error('Permission error:', error);
    if (error.message === 'LOCATION_PERMISSION_DENIED') {
      if (confirm('GPS ACCESS IS REQUIRED FOR BACKGROUND TRACKING.\n\nOPEN SETTINGS NOW?')) {
        const BG = await getBackgroundGeolocation();
        await BG.openSettings();
      }
    } else {
      alert(error.message || 'SENSOR ACCESS DENIED.');
    }
  }
};

const requestWakeLock = async () => {
  try {
    if ('wakeLock' in navigator) {
      wakeLock.value = await navigator.wakeLock.request('screen');
      document.addEventListener('visibilitychange', reRequestWakeLock);
    }
  } catch (err) {
    console.warn('Wake Lock error:', err);
  }
};

const releaseWakeLock = async () => {
  if (wakeLock.value !== null) {
    await wakeLock.value.release();
    wakeLock.value = null;
  }
  document.removeEventListener('visibilitychange', reRequestWakeLock);
};

const reRequestWakeLock = async () => {
  if (document.visibilityState === 'visible' && isTracking.value) {
    requestWakeLock();
  }
};

const enablePocketMode = () => {
  if (isTracking.value) {
    isScreenLocked.value = true;
  }
};

const handleUnlockStart = (e) => {
  unlockProgress.value = 0;
  clearInterval(unlockInterval);
  clearTimeout(unlockTimer);
  unlockInterval = setInterval(() => {
    if (unlockProgress.value < 100) unlockProgress.value += 5;
  }, 50);
  unlockTimer = setTimeout(() => {
    isScreenLocked.value = false;
    unlockProgress.value = 0;
    clearInterval(unlockInterval);
  }, 1000);
};

const handleUnlockEnd = () => {
  clearInterval(unlockInterval);
  clearTimeout(unlockTimer);
  setTimeout(() => { if (isScreenLocked.value) unlockProgress.value = 0; }, 50);
};

const startTracking = async () => {
  if (steps.value === 0) {
    speak("러닝 사가, 측정을 시작합니다. 오늘도 화이팅!");
  } else {
    speak("러닝을 재개합니다.");
  }
  
  isTracking.value = true;
  requestWakeLock();
  
  // Independent Motion Listener for Steps
  if (!motionListenerId) {
    motionListenerId = await Motion.addListener('accel', handleMotion);
  }

  await nextTick();
  
  // Free Community Background Geolocation Watcher
  try {
    const BG = await getBackgroundGeolocation();
    watchId = await BG.addWatcher(
      { 
        backgroundTitle: "🏃‍♂️ SAGA RUNNING TRACKER",
        backgroundMessage: "SCREEN OFF TRACKING ACTIVE - RECORDING YOUR RUN",
        requestPermissions: true,
        stale: false,
        distanceFilter: 10
      },
      (pos, err) => {
        if (err || !pos) return;
        const { latitude, longitude, accuracy } = pos;
        if (accuracy > 30) return;

        const newPoint = [latitude, longitude];
        routeCoordinates.value.push(newPoint);

        if (!map && mapContainer.value) {
          map = L.map(mapContainer.value, { zoomControl: false }).setView(newPoint, 17);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', crossOrigin: true }).addTo(map);
          polyline = L.polyline(routeCoordinates.value, { color: '#0066FF', weight: 6 }).addTo(map);
          marker = L.circleMarker(newPoint, { radius: 7, fillColor: "#0066FF", color: "#FFFFFF", weight: 3, opacity: 1, fillOpacity: 1 }).addTo(map);
          setTimeout(() => { if(map) map.invalidateSize(); }, 200);
        } else if (map) {
          polyline.setLatLngs(routeCoordinates.value);
          marker.setLatLng(newPoint);
          map.setView(newPoint, map.getZoom(), { animate: false });
        }
      }
    );
  } catch (error) {
    console.error('Background Geolocation failed:', error);
  }
};

const stopTracking = async () => {
  isTracking.value = false;
  releaseWakeLock();
  if (motionListenerId) {
    Motion.removeAllListeners();
    motionListenerId = null;
  }
  if (watchId) {
    try {
      const BG = await getBackgroundGeolocation();
      await BG.removeWatcher({ id: watchId });
      watchId = null;
    } catch (e) { console.error(e); }
  }
};

const finishSession = async () => {
  if (steps.value > 0 && props.currentUser) {
    speak("러닝을 종료하고 기록을 저장합니다. 정말 수고하셨습니다!");
    const captureEl = document.getElementById("capture-area");
    if (captureEl) {
      try {
        const canvas = await html2canvas(captureEl, { useCORS: true, backgroundColor: "#000000" });
        const imgData = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = imgData; a.download = `SAGA_Run_${new Date().getTime()}.png`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
      } catch (err) { console.error(err); }
    }

    const distKm = parseFloat(distance.value.toFixed(2));
    store.addRun({
      name: props.currentUser.name,
      distance: distKm,
      pace: "AUTO",
      date: new Date().toISOString(),
      route: [...routeCoordinates.value]
    });
    alert(`GREAT JOB! ${steps.value} STEPS LOGGED.`);
  }
  steps.value = 0; routeCoordinates.value = [];
  if (map) { map.remove(); map = null; }
  stopTracking();
};

onUnmounted(() => { stopTracking(); if (map) { map.remove(); map = null; } });
</script>

<style scoped>
.animate-pulse-light {
  animation: pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-light {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.02); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
</style>
