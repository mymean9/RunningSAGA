<template>
  <Transition name="modal">
    <div v-if="isOpen && runner" class="fixed inset-0 z-[100] flex flex-col items-center justify-center p-0 md:p-6 bg-black/95 backdrop-blur-xl overflow-hidden">
      <div class="bg-[#000000] border-0 md:border border-[#222222] w-full flex-1 max-w-4xl md:max-h-[90vh] flex flex-col relative overflow-hidden shadow-2xl modal-container">
        <!-- Decor line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-volt"></div>

        <!-- Close Button -->
        <button @click="$emit('close')" class="absolute top-6 right-6 z-10 text-white/40 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Profile Header -->
        <div class="p-6 md:p-10 border-b border-[#222222] bg-gradient-to-b from-[#111111] to-black">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8">
            <div>
              <div class="flex items-center space-x-3 md:space-x-4 mb-2 md:mb-4">
                <span class="text-2xl md:text-4xl font-black italic text-white/20">#{{ runner.rank || '-' }}</span>
                <h2 class="text-3xl sm:text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">
                  {{ runner.name }}
                </h2>
              </div>
              <div class="flex items-center space-x-8">
                <div>
                  <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">TOTAL DISTANCE</p>
                  <p class="text-3xl font-black italic text-volt">{{ Number(runner.distance || 0).toFixed(3) }} <span class="text-sm">KM</span></p>
                </div>
                <div>
                  <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">SESSIONS</p>
                  <p class="text-3xl font-black italic text-white">{{ runner.runs }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">AVG PACE</p>
                  <p class="text-3xl font-black italic text-white">{{ runner.pace }} <span class="text-sm">/KM</span></p>
                </div>
              </div>
            </div>
            
            <div class="text-right">
               <div v-if="runner.rank === 1" class="inline-block px-6 py-2 bg-volt text-black font-black italic text-xl skew-x-[-12deg]">
                  <span class="inline-block skew-x-[12deg]">TOP PERFORMER</span>
               </div>
               <div v-else-if="runner.isMe" class="inline-block px-6 py-2 border-2 border-volt text-volt font-black italic text-xl skew-x-[-12deg]">
                  <span class="inline-block skew-x-[12deg]">MY PERFORMANCE</span>
               </div>
            </div>
          </div>
        </div>

        <!-- Activities List -->
        <div v-if="!selectedActivity" class="flex-1 overflow-y-auto min-h-0 p-6 md:p-10 custom-scrollbar">
          <h3 class="text-xl font-black italic text-white uppercase tracking-tighter mb-6 md:mb-8 border-l-4 border-volt pl-4">ACTIVITY LOG</h3>
          
          <div v-if="runner.activities && runner.activities.length > 0" class="space-y-4">
            <div v-for="act in runner.activities" :key="act.id" class="bg-[#111111] border border-[#222222] p-6 group hover:border-volt/30 transition-all">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div class="flex items-center space-x-6">
                  <!-- Activity Thumbnail -->
                  <div class="w-20 h-20 bg-[#222222] border border-white/10 overflow-hidden flex-shrink-0">
                    <img v-if="act.image" :src="act.image" class="w-full h-full object-cover">
                    <div v-else class="w-full h-full flex items-center justify-center opacity-20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    </div>
                  </div>
                  
                  <div>
                    <p class="text-xs font-bold text-white/40 uppercase tracking-widest">{{ act.date }}</p>
                    <p class="text-3xl font-black italic text-white tracking-tighter">{{ Number(act.distance || 0).toFixed(3) }} <span class="text-sm text-volt font-bold uppercase tracking-wider">KM</span></p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-8 text-right">
                  <div class="hidden sm:block">
                    <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">PACE</p>
                    <p class="text-lg font-black italic text-white">{{ act.pace }}</p>
                  </div>
                  <div class="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                  <button @click="selectActivity(act)" class="px-6 py-2 border border-volt/30 hover:bg-volt hover:text-black transition-all text-volt font-black italic text-xs uppercase tracking-widest">VIEW ROUTE</button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-20 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p class="text-2xl font-black italic uppercase tracking-tighter">NO ACTIVITIES LOGGED</p>
          </div>
        </div>
        
        <!-- Activity Route Map -->
        <div v-else class="flex-1 flex flex-col p-6 md:p-10 overflow-hidden">
           <button @click="backToList" class="self-start mb-4 md:mb-6 text-white/50 hover:text-white font-bold tracking-widest text-xs uppercase flex items-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              BACK TO LOGS
           </button>
           
           <div class="flex justify-between items-end mb-6">
              <div>
                 <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">{{ selectedActivity.date }}</p>
                 <p class="text-4xl font-black italic text-white tracking-tighter">{{ Number(selectedActivity.distance || 0).toFixed(3) }} <span class="text-lg text-volt font-bold uppercase">KM</span></p>
              </div>
              <div class="text-right">
                 <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">PACE</p>
                 <p class="text-xl font-black italic text-white">{{ selectedActivity.pace }}</p>
              </div>
           </div>
           <div class="w-full flex-1 min-h-[250px] md:min-h-[400px] border border-white/10 relative overflow-hidden bg-[#111111] group">
              <div v-if="selectedActivity.route && selectedActivity.route.length > 0" class="absolute inset-0 z-0 isolate">
                 <div ref="mapContainer" class="w-full h-full"></div>
                 
                 <!-- Map Controls Overlay -->
                 <div class="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
                    <button @click="toggleMapFullscreen" class="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-volt hover:text-black transition-all shadow-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
                    </button>
                    <button @click="recenterMap" class="w-10 h-10 bg-black/60 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-volt hover:text-black transition-all shadow-lg">
                       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path></svg>
                    </button>
                 </div>
              </div>
              <div v-else class="w-full h-full flex flex-col items-center justify-center text-white/20">
                 <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                 <span class="font-bold tracking-widest uppercase text-sm">NO GPS DATA RECORDED</span>
              </div>
           </div>
        </div>

        <!-- FULLSCREEN MAP OVERLAY -->
        <div v-if="isMapFullscreen" class="fixed inset-0 z-[120] bg-black flex flex-col animate-fade-in pt-safe md:pt-0">
           <div class="px-6 py-4 mt-8 md:mt-0 flex justify-between items-center bg-[#0a0a0a] border-b border-white/10 relative z-[200]">
              <div>
                 <p class="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-1">REPLAYING SAGA ROUTE</p>
                 <h2 class="text-xl md:text-2xl font-black italic text-volt tracking-tighter uppercase leading-none">{{ selectedActivity.date }}</h2>
              </div>
              <button @click="toggleMapFullscreen" class="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
           </div>
           
           <div class="relative flex-1 bg-[#111111] isolate">
              <div ref="fullscreenMapContainer" class="absolute inset-0 w-full h-full z-[5]"></div>
              
              <!-- Map Controls -->
              <div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center space-x-4">
                 <button @click="recenterMap" class="h-14 px-8 bg-black/80 backdrop-blur-xl border-2 border-volt text-volt flex items-center space-x-3 font-black italic tracking-tighter uppercase shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:bg-volt hover:text-black transition-all active:scale-95">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><path d="M12 2v3"></path><path d="M12 19v3"></path><path d="M2 12h3"></path><path d="M19 12h3"></path></svg>
                    <span class="text-lg">RECENTER ROUTE</span>
                 </button>
                 
                 <button @click="toggleMapFullscreen" class="h-14 px-8 bg-volt text-black flex items-center space-x-3 font-black italic tracking-tighter uppercase shadow-[0_0_30px_rgba(204,255,0,0.5)] active:scale-95 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14h6v6"></path><path d="M20 10h-6V4"></path><path d="M14 10l7-7"></path><path d="M3 21l7-7"></path></svg>
                    <span class="text-lg">MINIMIZE</span>
                 </button>
              </div>
           </div>
           
           <!-- Bottom Stats -->
           <div class="p-8 bg-[#0a0a0a] border-t border-white/10 grid grid-cols-2 gap-8 z-[200]">
              <div>
                 <p class="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mb-1">ROUTE DISTANCE</p>
                 <p class="text-4xl font-black italic text-white">{{ Number(selectedActivity.distance || 0).toFixed(3) }} <span class="text-sm text-volt">KM</span></p>
              </div>
              <div class="text-right">
                 <p class="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em] mb-1">AVG PACE</p>
                 <p class="text-4xl font-black italic text-white">{{ selectedActivity.pace }}</p>
              </div>
           </div>
        </div>

        <!-- Footer Decor -->
        <div class="p-6 bg-[#0a0a0a] border-t border-[#222222] flex justify-between items-center">
           <div class="flex items-center space-x-2">
              <div class="w-4 h-4 bg-volt rotate-45"></div>
              <span class="text-[10px] font-bold tracking-[0.4em] text-white/30 uppercase">RUNNING SAGA PERFORMANCE UNIT</span>
           </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const props = defineProps({
  isOpen: Boolean,
  runner: Object
});
const emit = defineEmits(['close']);

const selectedActivity = ref(null);
const isMapFullscreen = ref(false);
const mapContainer = ref(null);
const fullscreenMapContainer = ref(null);
let map = null;
let polyline = null;

const selectActivity = async (act) => {
  selectedActivity.value = act;
  if (act.route && act.route.length > 0) {
    await nextTick();
    if (mapContainer.value) {
      if (map) { map.remove(); map = null; }
      map = L.map(mapContainer.value, { zoomControl: false });
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      let parsedRoute = act.route;
      try {
        if (typeof parsedRoute === 'string') parsedRoute = JSON.parse(parsedRoute);
      } catch(e) { parsedRoute = []; }

      polyline = L.polyline(parsedRoute, { color: '#0066FF', weight: 6 }).addTo(map);
      if (parsedRoute.length > 0) {
         map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }
      
      // 모달/트랜지션 애니메이션이 끝난 후 지도의 크기를 재계산(렌더링 버그 픽스)
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
          if (polyline) map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }
      }, 100);
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 400);
    }
  }
};

const toggleMapFullscreen = async () => {
  if (map) {
    if (isMapFullscreen.value) {
      isMapFullscreen.value = false;
      await nextTick();
      const smallContainer = mapContainer.value.parentElement;
      if (smallContainer && mapContainer.value) {
        smallContainer.prepend(mapContainer.value);
      }
      setTimeout(() => { map.invalidateSize(); }, 300);
    } else {
      isMapFullscreen.value = true;
      await nextTick();
      if (fullscreenMapContainer.value && mapContainer.value) {
        fullscreenMapContainer.value.appendChild(mapContainer.value);
      }
      setTimeout(() => { map.invalidateSize(); }, 300);
    }
  }
};

const recenterMap = () => {
  if (map && polyline) {
    map.fitBounds(polyline.getBounds(), { padding: [60, 60], animate: true });
  }
};

const backToList = () => {
  selectedActivity.value = null;
  if (map) { map.remove(); map = null; }
};

watch(() => props.isOpen, (val) => {
  if (!val) {
    selectedActivity.value = null;
    if (map) { map.remove(); map = null; }
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #000000;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 0;
}

/* Leaflet integration */
:deep(.leaflet-container) {
  height: 100% !important;
  width: 100% !important;
  background: #09090b !important;
  z-index: 1;
}

:deep(.leaflet-tile-pane) {
  filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
}

@keyframes fade-in {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out forwards;
}

/* Modal animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.modal-enter-from .modal-container {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}
</style>
