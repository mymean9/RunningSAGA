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
                  <p class="text-3xl font-black italic text-volt">{{ Number(runner.distance || 0).toFixed(1) }} <span class="text-sm">KM</span></p>
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
                    <p class="text-3xl font-black italic text-white tracking-tighter">{{ Number(act.distance || 0).toFixed(1) }} <span class="text-sm text-volt font-bold uppercase tracking-wider">KM</span></p>
                  </div>
                </div>
                
                <div class="flex items-center space-x-8 text-right">
                  <div class="hidden sm:block">
                    <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">PACE</p>
                    <p class="text-lg font-black italic text-white">{{ act.pace }}</p>
                  </div>
                  <div class="h-10 w-[1px] bg-white/10 hidden sm:block"></div>
                  <button @click="selectedActivity = act" class="px-6 py-2 border border-volt/30 hover:bg-volt hover:text-black transition-all text-volt font-black italic text-xs uppercase tracking-widest">VIEW ROUTE</button>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="text-center py-20 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <p class="text-2xl font-black italic uppercase tracking-tighter">NO ACTIVITIES LOGGED</p>
          </div>
        </div>
        
        <!-- Activity Route Placeholder (No Leaflet for now) -->
        <div v-else class="flex-1 flex flex-col p-6 md:p-10 overflow-hidden">
           <button @click="selectedActivity = null" class="self-start mb-4 md:mb-6 text-white/50 hover:text-white font-bold tracking-widest text-xs uppercase flex items-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              BACK TO LOGS
           </button>
           
           <div class="flex justify-between items-end mb-6">
              <div>
                 <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">{{ selectedActivity.date }}</p>
                 <p class="text-4xl font-black italic text-white tracking-tighter">{{ Number(selectedActivity.distance || 0).toFixed(1) }} <span class="text-lg text-volt font-bold uppercase">KM</span></p>
              </div>
              <div class="text-right">
                 <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest">PACE</p>
                 <p class="text-xl font-black italic text-white">{{ selectedActivity.pace }}</p>
              </div>
           </div>
           
           <div class="w-full flex-1 min-h-[250px] md:min-h-[400px] border border-white/10 flex flex-col items-center justify-center text-white/20 bg-[#111111]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
              <span class="font-bold tracking-widest uppercase text-sm">MAP LOADING SUSPENDED FOR DEBUGGING</span>
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
import { ref, watch } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  runner: Object
});
const emit = defineEmits(['close']);

const selectedActivity = ref(null);

watch(() => props.isOpen, (val) => {
  if (!val) {
    selectedActivity.value = null;
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
