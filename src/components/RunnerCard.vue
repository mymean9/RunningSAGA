<template>
  <div 
    @click="$emit('showDetail', name)"
    :class="[
      'bg-[#111111] border p-6 group hover:translate-y-[-4px] cursor-pointer transition-all duration-300 relative overflow-hidden',
      isMe ? 'border-volt shadow-[0_0_20px_rgba(204,255,0,0.1)]' : 'border-[#222222] hover:border-volt/50'
    ]"
  >
    <!-- Rank Number Backdrop -->
    <div class="absolute -top-4 -right-2 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
       <span class="text-[120px] font-black italic tracking-tighter text-white select-none">{{ rank }}</span>
    </div>
    <div class="flex items-start justify-between mb-6 relative z-10">
      <div>
        <div class="flex items-center space-x-3 mb-1">
          <h3 class="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40 font-nrc">RUNNER</h3>
          <span v-if="isMe" class="px-2 py-0.5 bg-volt text-black text-[8px] font-black italic uppercase tracking-widest rounded-sm">YOU</span>
        </div>
        <p class="text-2xl font-black italic tracking-tighter text-white group-hover:text-volt transition-colors uppercase leading-none">{{ name }}</p>
      </div>
      
      <!-- Latest Activity Image Thumbnail -->
      <div v-if="lastImage" class="w-16 h-16 border border-white/10 group-hover:border-volt/30 transition-colors bg-[#1a1a1a] shadow-lg rotate-3 group-hover:rotate-0 transition-transform overflow-hidden">
        <img :src="lastImage" class="w-full h-full object-cover">
      </div>
    </div>

    <div class="flex items-end justify-between mb-8 relative z-10">
      <div class="flex items-center space-x-6">
        <div>
          <p class="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40">PACE</p>
          <p class="text-lg font-black italic text-white leading-tight mt-1">{{ pace }} <span class="text-[10px] opacity-40 font-bold whitespace-nowrap tracking-widest block md:inline">/KM</span></p>
        </div>
        <div>
          <p class="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40">SESSIONS</p>
          <p class="text-lg font-black italic text-white leading-tight mt-1">{{ runs }}</p>
        </div>
      </div>
      
      <div class="text-right">
        <h3 class="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40 mb-1 text-right text-nrc">DISTANCE</h3>
        <p class="text-4xl font-black italic tracking-tight text-white leading-none">
          <span class="text-volt">{{ (distance || 0).toFixed(3) }}</span>
          <span class="text-[14px] ml-1 uppercase text-white/60 tracking-wider font-bold">KM</span>
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-col space-y-2 relative z-10">
      <div class="h-[3px] w-full bg-[#222222] relative overflow-hidden">
        <div 
          class="absolute inset-0 bg-volt transform origin-left transition-transform duration-1000 ease-out" 
          :style="{ transform: `scaleX(${progress / 100})` }"
        ></div>
      </div>
      <div class="flex justify-between items-center mt-1">
        <p class="text-[9px] font-bold tracking-[0.2em] text-volt uppercase italic">{{ progress }}% PROGRESS</p>
        <p class="text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase">GOAL: 200KM</p>
      </div>
    </div>
    
    <!-- Hover accent -->
    <div class="absolute left-0 top-0 w-[2px] h-full bg-volt transform -translate-x-full group-hover:translate-x-0 transition-transform"></div>
  </div>
</template>

<script setup>
defineProps({
  name: String,
  distance: Number,
  pace: String,
  runs: Number,
  rank: Number,
  progress: Number,
  lastImage: String,
  isMe: Boolean
})
defineEmits(['showDetail']);
</script>

<style scoped>
</style>
