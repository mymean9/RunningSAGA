<template>
  <div class="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-6">
    <!-- Lang Switcher inside Modal -->
    <div class="absolute top-8 right-8 z-50">
      <button 
        @click="store.setLocale(store.locale === 'ko' ? 'en' : 'ko')"
        class="px-3 py-1.5 border border-white/20 text-xs font-black italic hover:bg-white hover:text-black transition-all uppercase tracking-tighter text-white"
      >
        {{ store.locale === 'ko' ? 'EN' : 'KR' }}
      </button>
    </div>

    <!-- Animated background glow -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-volt/5 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-80 h-80 bg-volt/5 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Grid pattern overlay -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: linear-gradient(#CCFF00 1px, transparent 1px), linear-gradient(to right, #CCFF00 1px, transparent 1px); background-size: 40px 40px;"></div>

    <!-- Logo -->
    <div class="flex items-center space-x-3 mb-16 animate-fade-in">
      <div class="w-12 h-12 flex items-center justify-center bg-volt rounded-sm p-1.5">
        <svg viewBox="20 10 220 110" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-black">
          <path d="M50 100 L70 30 Q80 20 105 20 Q130 20 125 50 Q120 75 90 75 L120 105" stroke="currentColor" stroke-width="20" fill="none" stroke-linecap="butt" stroke-linejoin="miter"/>
          <path d="M35 40 Q20 45 45 50" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.8"/>
          <path d="M30 60 Q15 65 40 70" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round" opacity="0.6"/>
          <path d="M140 35 C180 15 200 55 170 65 C140 75 155 105 195 95" stroke="currentColor" stroke-width="22" fill="none" stroke-linecap="butt" stroke-linejoin="miter"/>
          <path d="M190 30 L225 15 L200 40 Z" fill="currentColor" />
          <path d="M195 50 L230 40 L205 60 Z" fill="currentColor" />
          <path d="M200 70 L225 65 L208 80 Z" fill="currentColor" />
        </svg>
      </div>
      <span class="text-2xl font-black italic tracking-tighter uppercase text-white">RUNNING <span class="text-volt">SAGA</span></span>
    </div>

    <!-- Hero Text -->
    <div class="text-center max-w-3xl mb-12">
      <h1 class="text-6xl sm:text-8xl md:text-[100px] font-black italic tracking-tighter uppercase leading-none text-white mb-6">
        {{ store.t('run') }}.<br><span class="text-volt">{{ store.t('compete') }}.</span><br>{{ store.t('dominate') }}.
      </h1>
      <p class="text-sm md:text-base font-bold uppercase tracking-[0.2em] text-white/40 leading-relaxed max-w-lg mx-auto">
        {{ store.t('landing_desc') }}
      </p>
    </div>

    <!-- Feature Pills -->
    <div class="flex flex-wrap justify-center gap-3 mb-14">
      <span v-for="feat in features" :key="feat" class="px-4 py-1.5 border border-white/10 text-white/50 text-[10px] font-bold uppercase tracking-widest">{{ feat }}</span>
    </div>

    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
      <button
        @click="$emit('openAuth', 'signup')"
        class="flex-1 bg-volt text-black py-4 font-black italic text-xl uppercase tracking-tighter hover:bg-white transition-all transform hover:scale-[1.03] active:scale-95 shadow-[0_0_40px_rgba(204,255,0,0.2)]"
      >
        {{ store.t('join_saga_btn') }}
      </button>
      <button
        @click="$emit('openAuth', 'login')"
        class="flex-1 border-2 border-white/30 text-white py-4 font-black italic text-xl uppercase tracking-tighter hover:border-white transition-all active:scale-95"
      >
        {{ store.t('login') }}
      </button>
    </div>

    <!-- Decor bottom bar -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-volt to-transparent opacity-40"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { store } from '../dataStore';

defineEmits(['openAuth']);

const features = computed(() => 
  store.locale === 'ko' 
    ? ['GPS 경로 추적', '실시간 리더보드', '음성 코칭', '크루 시스템', '클라우드 동기화']
    : ['GPS ROUTE TRACKING', 'REAL-TIME LEADERBOARD', 'VOICE COACHING', 'CREW SYSTEM', 'FIREBASE SYNC']
);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out both;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
