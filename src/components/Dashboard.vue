<template>
  <div class="min-h-screen bg-[#000000]">
    <div class="max-w-7xl mx-auto px-6 py-10">
      <!-- MOBILE-FIRST PREMIUM HEADER -->
      <div class="flex flex-col space-y-8 mb-12">
        <div class="flex items-end justify-between border-b border-volt/20 pb-6">
          <h1 class="text-4xl md:text-8xl font-black italic tracking-tighter uppercase leading-none text-white">
            RUNNING<span class="text-volt">.SAGA</span>
          </h1>
          <button 
            @click="isModalOpen = true"
            :disabled="!currentUser"
            class="w-12 h-12 bg-volt text-black flex items-center justify-center rounded-sm transform active:scale-95 transition-all shadow-[0_0_15px_rgba(206,255,0,0.3)] disabled:opacity-30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>

        <!-- STAT CARDS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-[#111] border border-white/5 p-4 rounded-sm group hover:border-volt/30 transition-all">
               <p class="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">YOUR DISTANCE</p>
               <p class="text-2xl font-black italic text-white leading-none">{{ (currentUser?.distance || 0).toFixed(3) }} <span class="text-[10px] text-volt">KM</span></p>
            </div>
            <div class="bg-[#111] border border-white/5 p-4 rounded-sm group hover:border-volt/30 transition-all">
               <p class="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">TRIBE TOTAL</p>
               <p class="text-2xl font-black italic text-white leading-none">{{ (totalDistance || 0).toFixed(3) }} <span class="text-[10px] text-volt">KM</span></p>
            </div>
        </div>
      </div>

      <!-- CREW MANAGEMENT AREA (ONLY LOGGED IN) -->
      <div v-if="currentUser" class="mb-12">
        <div v-if="myGroup" class="bg-white/5 border border-volt/30 p-6 rounded-sm inline-block w-full md:w-auto">
           <p class="text-xs font-bold text-volt uppercase tracking-widest mb-1">MY SAGA CREW</p>
           <h3 class="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">{{ myGroup.name }}</h3>
           
           <div class="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div class="bg-black border border-white/20 px-4 py-2 flex items-center justify-between flex-1">
               <span class="text-[10px] font-bold text-white/40 tracking-widest uppercase mr-4">INVITE CODE</span>
               <span class="text-xl font-black italic tracking-widest select-all">{{ myGroup.secretCode }}</span>
             </div>
             <button @click="leaveGroup" class="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest underline md:ml-4 text-center">LEAVE CREW</button>
           </div>
        </div>
        
        <div v-else class="bg-[#111111] border border-[#222222] p-8 rounded-sm">
           <div class="max-w-xl">
             <h3 class="text-2xl font-black italic uppercase tracking-tighter mb-2">RUNNING SOLO</h3>
             <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-6">YOU ARE CURRENTLY NOT IN A CREW. YOUR DASHBOARD ONLY SHOWS YOUR OWN STATS. CREATE OR JOIN A CREW TO COMPETE WITH OTHERS.</p>
             <div class="flex flex-col sm:flex-row gap-4">
                <button @click="createGroup" class="flex-1 px-6 py-3 bg-volt text-black font-black italic text-lg uppercase tracking-tighter hover:bg-white transition-all text-center">CREATE CREW</button>
                <button @click="joinGroup" class="flex-1 px-6 py-3 border border-white/20 text-white font-black italic text-lg uppercase tracking-tighter hover:border-white transition-all text-center">JOIN CREW</button>
             </div>
           </div>
        </div>
      </div>

      <!-- RUNNERS LIST -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-4">
        <RunnerCard 
          v-for="(runner, index) in sortedRunners" 
          :key="runner.name"
          v-bind="runner"
          :rank="index + 1"
          :isMe="currentUser?.name === runner.name"
          @showDetail="openDetail"
        />
      </div>
      
      <div v-if="runners.length === 0" class="text-center py-20">
         <p class="text-2xl font-black italic text-white/20 uppercase tracking-tighter">NO RUNNERS JOINED YET. BE THE FIRST!</p>
      </div>

      <!-- BUILD VERSION INDICATOR -->
      <div class="mt-16 text-center">
         <p class="text-[10px] font-bold text-white/20 tracking-[0.3em] uppercase">Running.SAGA Build v1.0.2</p>
         <p class="text-[8px] text-white/10 mt-1">2026-04-20 Update</p>
      </div>
    </div>

    <!-- LOG RUN MODAL -->
    <LogRunModal 
      :is-open="isModalOpen" 
      :current-user-name="currentUser?.name"
      @close="isModalOpen = false" 
      @submit="handleNewRun"
    />

    <!-- RUNNER DETAIL MODAL -->
    <RunnerDetailModal
      v-if="selectedRunner"
      :is-open="isDetailOpen"
      :runner="selectedRunner"
      @close="isDetailOpen = false"
    />
  </div>
</template>

<script setup>
import RunnerCard from './RunnerCard.vue';
import LogRunModal from './LogRunModal.vue';
import RunnerDetailModal from './RunnerDetailModal.vue';
import { ref, computed } from 'vue';
import { store } from '../dataStore';

const props = defineProps({
  currentUser: Object
});

const isModalOpen = ref(false);
const isDetailOpen = ref(false);
const selectedRunnerName = ref('');

const runners = computed(() => store.runners);

const myGroup = computed(() => {
  if (!props.currentUser || !props.currentUser.groupId) return null;
  return store.groups.find(g => g.id === props.currentUser.groupId);
});

const filteredRunners = computed(() => {
  if (!props.currentUser) {
    // Not logged in -> Show global demo list (or empty list if preferred, but demo is nice)
    return store.runners;
  }
  
  if (myGroup.value) {
    // In a Crew -> Show all crew members
    return store.runners.filter(r => r.groupId === myGroup.value.id);
  }
  
  // Solo -> Show only me
  return store.runners.filter(r => r.name === props.currentUser.name);
});

const selectedRunner = computed(() => {
  const allSorted = sortedRunners.value;
  const index = allSorted.findIndex(r => r.name === selectedRunnerName.value);
  if (index === -1) return null;
  return {
    ...allSorted[index],
    rank: index + 1,
    isMe: props.currentUser?.name === allSorted[index].name
  };
});

const sortedRunners = computed(() => {
  return [...filteredRunners.value].sort((a, b) => b.distance - a.distance);
});

const totalDistance = computed(() => {
  return filteredRunners.value.reduce((sum, r) => sum + r.distance, 0);
});

const createGroup = () => {
  const name = prompt("ENTER NEW CREW NAME:");
  if (name && name.trim()) {
    store.createGroup(name.trim());
  }
};

const joinGroup = () => {
  const code = prompt("ENTER 6-CHARACTER CREW INVITE CODE:");
  if (code && code.trim()) {
    const success = store.joinGroup(code.trim());
    if (!success) {
      alert("INVALID CREW CODE. PLEASE CHECK AND TRY AGAIN.");
    } else {
      alert("SUCCESSFULLY JOINED THE CREW!");
    }
  }
};

const leaveGroup = () => {
  if(confirm("ARE YOU SURE YOU WANT TO LEAVE THIS CREW? YOU WILL LOSE ACCESS TO THE CREW LEADERBOARD.")) {
    store.leaveGroup();
  }
};

const openDetail = (name) => {
  selectedRunnerName.value = name;
  isDetailOpen.value = true;
};

const handleNewRun = async (data) => {
  await store.addRun({
    name: props.currentUser?.name,
    distance: data.distance,
    pace: data.pace,
    date: data.date,
    image: null,
    route: []
  });
  isModalOpen.value = false;
};
</script>

<style scoped>
</style>
