<template>
  <div class="min-h-screen bg-[#000000] pb-20">
    <div class="max-w-7xl mx-auto px-6 pt-12">
      <!-- Header -->
      <div class="mb-12 border-l-4 border-volt pl-6">
        <h1 class="text-6xl font-black italic tracking-tighter uppercase leading-none text-white">
          TRIBE <span class="text-volt">INSIGHTS</span>
        </h1>
        <p class="text-[11px] font-bold tracking-[0.4em] text-white/40 uppercase mt-4">Collective performance & milestone tracking</p>
      </div>

      <!-- Grand Goal Progress Section -->
      <div class="bg-[#111111] border border-white/10 p-10 mb-12 relative overflow-hidden group">
         <div class="flex flex-col md:flex-row md:items-end justify-between mb-10 relative z-10">
            <div>
               <h2 class="text-[10px] font-bold tracking-[0.5em] text-volt uppercase mb-2">MONTHLY MILESTONE</h2>
               <div class="text-6xl md:text-8xl font-black italic tracking-tighter text-white leading-none uppercase">
                  ROAD TO <span class="text-volt">{{ GRAND_GOAL }}</span> KM
               </div>
            </div>
            <div class="mt-6 md:mt-0 text-right">
               <p class="text-4xl font-black italic text-white">{{ totalDistance.toFixed(1) }} <span class="text-lg text-white/30">KM</span></p>
               <p class="text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase">CURRENT TOTAL</p>
            </div>
         </div>

         <!-- Large Progress Bar -->
         <div class="relative h-4 bg-[#222222] w-full overflow-hidden mb-6 z-10">
            <div 
              class="absolute inset-0 bg-volt transform origin-left transition-transform duration-1500 ease-out"
              :style="{ transform: `scaleX(${goalProgress / 100})` }"
            ></div>
            <!-- Glow effect -->
            <div 
              class="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-r from-transparent to-volt/50 blur-md pointer-events-none"
              :style="{ right: `${100 - goalProgress}%` }"
            ></div>
         </div>

         <div class="flex justify-between items-center relative z-10">
            <p class="text-xl font-black italic text-volt">{{ goalProgress.toFixed(1) }}% COMPLETED</p>
            <p class="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase italic">REMAINING: {{ (GRAND_GOAL - totalDistance).toFixed(1) }} KM</p>
         </div>

         <!-- Back decor -->
         <div class="absolute -bottom-10 -right-10 opacity-[0.03] select-none pointer-events-none">
            <span class="text-[250px] font-black italic tracking-tighter text-white">SAGA</span>
         </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <!-- Total Sessions -->
         <div class="bg-[#111111] border border-white/5 p-8 group hover:border-volt/30 transition-all">
            <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-4">TOTAL SESSIONS</p>
            <div class="flex items-baseline space-x-2">
               <span class="text-5xl font-black italic text-white">{{ totalRuns }}</span>
               <span class="text-[10px] font-bold text-volt uppercase tracking-widest leading-none">RUNS</span>
            </div>
            <div class="h-1 w-12 bg-volt/30 mt-6 group-hover:w-full transition-all duration-500"></div>
         </div>

         <!-- Avg Pace -->
         <div class="bg-[#111111] border border-white/5 p-8 group hover:border-volt/30 transition-all">
            <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-4">AVG TRIBE PACE</p>
            <div class="flex items-baseline space-x-2">
               <span class="text-5xl font-black italic text-white">{{ averagePace }}</span>
               <span class="text-[10px] font-bold text-volt uppercase tracking-widest leading-none">/KM</span>
            </div>
            <div class="h-1 w-12 bg-volt/30 mt-6 group-hover:w-full transition-all duration-500"></div>
         </div>

         <!-- Active Runners -->
         <div class="bg-[#111111] border border-white/5 p-8 group hover:border-volt/30 transition-all">
            <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-4">ACTIVE RUNNERS</p>
            <div class="flex items-baseline space-x-2">
               <span class="text-5xl font-black italic text-white">{{ store.runners.length }}</span>
               <span class="text-[10px] font-bold text-volt uppercase tracking-widest leading-none">ATHLETES</span>
            </div>
            <div class="h-1 w-12 bg-volt/30 mt-6 group-hover:w-full transition-all duration-500"></div>
         </div>

         <!-- Goal Achievement -->
         <div class="bg-volt p-8 group transition-all">
            <p class="text-[10px] font-black tracking-[0.3em] text-black/50 uppercase mb-4">STILL TO GO</p>
            <div class="flex items-baseline space-x-2">
               <span class="text-5xl font-black italic text-black">{{ runnersReachedGoal }}</span>
               <span class="text-[10px] font-bold text-black/40 uppercase tracking-widest leading-none">AT FINISH LINE</span>
            </div>
            <p class="text-[9px] font-black italic text-black/60 mt-4 uppercase">TARGET: {{ store.runners.length }} RUNNERS @ 200KM</p>
         </div>
      </div>

      <!-- Tribe Participation Chart Simulation -->
      <div class="mt-12 bg-[#0a0a0a] border border-white/5 p-8 rounded-sm">
         <div class="flex justify-between items-center mb-8">
            <h3 class="text-xs font-black italic uppercase tracking-[0.4em] text-white">INDIVIDUAL CONTRIBUTION STAKES</h3>
            <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest">RANKED BY DISTANCE %</span>
         </div>
         <div class="space-y-6">
            <div v-for="runner in sortedByDist" :key="runner.name" class="relative">
               <div class="flex justify-between items-center mb-1">
                  <span class="text-[10px] font-black italic text-white/60 uppercase tracking-widest">{{ runner.name }}</span>
                  <span class="text-[10px] font-black italic text-volt">{{ ((runner.distance / totalDistance) * 100).toFixed(1) }}% share</span>
               </div>
               <div class="h-1 bg-[#222222] overflow-hidden">
                  <div class="h-full bg-volt opacity-50 transition-all duration-1000" :style="{ width: `${(runner.distance / totalDistance) * 100}%` }"></div>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../dataStore';

const GRAND_GOAL = 1000;

const props = defineProps({
  currentUser: Object
});

const totalDistance = computed(() => {
  return store.runners.reduce((acc, r) => acc + r.distance, 0);
});

const goalProgress = computed(() => {
  return Math.min(100, (totalDistance.value / GRAND_GOAL) * 100);
});

const totalRuns = computed(() => {
  return store.runners.reduce((acc, r) => acc + r.runs, 0);
});

const runnersReachedGoal = computed(() => {
  return store.runners.filter(r => r.distance >= 200).length;
});

const sortedByDist = computed(() => {
  return [...store.runners].sort((a, b) => b.distance - a.distance);
});

const averagePace = computed(() => {
  if (store.runners.length === 0) return "0'00\"";
  // Simplified pace average for demo
  const paces = store.runners.map(r => {
     const [min, sec] = r.pace.replace('"', '').split("'").map(Number);
     return min * 60 + sec;
  });
  const avgSecs = paces.reduce((a, b) => a + b, 0) / paces.length;
  const min = Math.floor(avgSecs / 60);
  const sec = Math.floor(avgSecs % 60);
  return `${min}'${sec.toString().padStart(2, '0')}"`;
});
</script>

<style scoped>
</style>
