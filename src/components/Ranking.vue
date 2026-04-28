<template>
  <div class="min-h-screen bg-[#000000] pb-20">
    <div class="max-w-7xl mx-auto px-6 pt-12">
      <!-- Header -->
      <div class="mb-10 md:mb-16 border-l-4 border-volt pl-6">
        <h1 class="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
          THE <span class="text-volt">LEADERBOARD</span>
        </h1>
        <p class="text-[10px] md:text-[11px] font-bold tracking-[0.3em] md:tracking-[0.4em] text-white/40 uppercase mt-4">Real-time runner rankings & performance trends</p>
      </div>

      <!-- Podium (Top 3) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20 items-end">
        <!-- 2nd Place -->
        <div v-if="allRunners[1]" class="order-2 md:order-1 bg-[#111111] border border-white/10 p-6 md:p-8 relative group hover:border-white/30 transition-all flex flex-col items-center">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#222222] border border-white/20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-black italic text-lg md:text-xl">2</div>
          <div class="text-center mt-2">
             <h3 class="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white mb-1 truncate max-w-[150px] md:max-w-none">{{ allRunners[1].name }}</h3>
             <p class="text-volt font-black italic text-base md:text-lg">{{ Number(allRunners[1].distance).toFixed(3) }} <span class="text-[10px] text-white/40 tracking-widest uppercase">KM</span></p>
          </div>
          <div class="mt-3 px-3 py-1 bg-white/5 rounded-full flex items-center space-x-2">
             <span class="text-[9px] md:text-[10px] font-bold text-white/40 tracking-widest uppercase italic">Pace: {{ allRunners[1].pace }}</span>
          </div>
        </div>

        <!-- 1st Place -->
        <div v-if="allRunners[0]" class="order-1 md:order-2 bg-[#1a1a1a] border border-volt/40 p-8 md:p-10 relative group hover:border-volt transition-all flex flex-col items-center md:scale-105 shadow-[0_0_50px_rgba(204,255,0,0.1)]">
          <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-volt border border-black w-14 h-14 md:w-16 md:h-16 flex items-center justify-center font-black italic text-2xl md:text-3xl text-black">1</div>
          <div class="text-center mt-4 md:mt-6">
             <div class="mb-2">
                <span class="px-2 py-0.5 bg-volt text-black text-[8px] font-black italic uppercase tracking-widest rounded-sm">TOP PERFORMER</span>
             </div>
             <h3 class="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white mb-2 truncate max-w-[180px] md:max-w-none">{{ allRunners[0].name }}</h3>
             <p class="text-volt font-black italic text-2xl md:text-3xl">{{ Number(allRunners[0].distance).toFixed(3) }} <span class="text-[12px] text-white/40 tracking-widest uppercase">KM</span></p>
          </div>
          <div class="mt-4 md:mt-6 px-4 py-1 bg-volt/10 rounded-full flex items-center space-x-2">
             <span class="text-[10px] md:text-[11px] font-bold text-volt tracking-widest uppercase italic">Pace: {{ allRunners[0].pace }}</span>
          </div>
        </div>

        <!-- 3rd Place -->
        <div v-if="allRunners[2]" class="order-3 md:order-3 bg-[#111111] border border-white/10 p-6 md:p-8 relative group hover:border-white/30 transition-all flex flex-col items-center">
          <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#222222] border border-white/20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center font-black italic text-lg md:text-xl">3</div>
          <div class="text-center mt-2">
             <h3 class="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white mb-1 truncate max-w-[150px] md:max-w-none">{{ allRunners[2].name }}</h3>
             <p class="text-volt font-black italic text-base md:text-lg">{{ Number(allRunners[2].distance).toFixed(3) }} <span class="text-[10px] text-white/40 tracking-widest uppercase">KM</span></p>
          </div>
          <div class="mt-3 px-3 py-1 bg-white/5 rounded-full flex items-center space-x-2">
             <span class="text-[9px] md:text-[10px] font-bold text-white/40 tracking-widest uppercase italic">Pace: {{ allRunners[2].pace }}</span>
          </div>
        </div>
      </div>

      <!-- Ranking List -->
      <div class="space-y-3">
        <div v-for="(runner, index) in allRunners" :key="runner.name" 
             :class="['group flex items-center justify-between p-4 md:p-6 transition-all duration-300 border-l-4 relative overflow-hidden', 
                      currentUser?.name === runner.name ? 'bg-volt/5 border-volt shadow-lg' : 'bg-[#0a0a0a] border-[#222222] hover:border-volt/40 hover:bg-[#111111]']">
          
          <!-- Rank & Info -->
          <div class="flex items-center space-x-4 md:space-x-8 relative z-10 shrink min-w-0">
            <span class="text-xl md:text-3xl font-black italic text-white/20 w-6 md:w-10 group-hover:text-volt transition-colors">{{ index + 1 }}</span>
            <div class="min-w-0 shrink">
              <div class="flex items-center space-x-2 md:space-x-3 mb-1 min-w-0">
                <p class="text-base md:text-xl font-black italic uppercase tracking-tighter text-white truncate">{{ runner.name }}</p>
                <span v-if="currentUser?.name === runner.name" class="px-1.5 py-0.5 bg-volt text-black text-[7px] md:text-[8px] font-black italic uppercase tracking-widest rounded-sm shrink-0">YOU</span>
              </div>
              <div class="flex items-center space-x-3 md:space-x-4">
                <p class="text-[8px] md:text-[9px] font-bold tracking-[0.1em] md:tracking-[0.2em] text-white/30 uppercase">RUNS: {{ runner.runs }}</p>
                <p class="text-[8px] md:text-[9px] font-bold tracking-[0.1em] md:tracking-[0.2em] text-white/30 uppercase truncate">PACE: {{ runner.pace }}</p>
              </div>
            </div>
          </div>

          <!-- Trend & Distance -->
          <div class="flex items-center space-x-4 md:space-x-8 relative z-10 shrink-0 ml-2">
            <div class="hidden sm:flex flex-col items-center justify-center">
               <div :class="[getTrendColor(runner.name), 'flex items-center font-black italic text-[9px] md:text-[10px] uppercase tracking-widest']">
                  <svg v-if="getTrend(runner.name) === 'up'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polyline points="18 15 12 9 6 15"></polyline></svg>
                  <svg v-else-if="getTrend(runner.name) === 'down'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="mr-1 text-red-500"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  <span v-else class="text-white/20 mr-1">—</span>
                  <span v-if="getTrend(runner.name) === 'up'" class="hidden xs:inline">UP</span>
                  <span v-else-if="getTrend(runner.name) === 'down'" class="text-red-500 hidden xs:inline">DOWN</span>
               </div>
            </div>
            <div class="text-right">
              <p class="text-xl md:text-3xl font-black italic text-volt leading-none">{{ Number(runner.distance).toFixed(3) }} <span class="text-[8px] md:text-[10px] text-white/40 ml-1">KM</span></p>
            </div>
          </div>

          <!-- Background Graphic -->
          <div class="absolute right-0 bottom-0 opacity-[0.05] -rotate-12 translate-x-4 translate-y-4">
             <span class="text-[100px] font-black italic tracking-tighter text-white pointer-events-none">{{ index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../dataStore';

const props = defineProps({
  currentUser: Object
});

const allRunners = computed(() => {
  return [...store.runners].sort((a, b) => b.distance - a.distance);
});

// Simulated trend logic for demo purposes
// In a real app, this would compare current rank vs previous day rank
const getTrend = (name) => {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (hash % 5 === 0) return 'up';
  if (hash % 7 === 0) return 'down';
  return 'steady';
};

const getTrendColor = (name) => {
  const trend = getTrend(name);
  if (trend === 'up') return 'text-volt';
  if (trend === 'down') return 'text-red-500';
  return 'text-white/20';
};
</script>

<style scoped>
</style>
