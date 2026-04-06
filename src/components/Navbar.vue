<template>
  <nav class="sticky top-0 z-50 bg-[#000000]/95 backdrop-blur-md border-b border-volt/10 px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <!-- LOGO -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-volt rounded-sm p-1">
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
        <span class="text-lg md:text-xl font-black italic tracking-tighter uppercase text-white">RUNNING <span class="text-volt">SAGA</span></span>
      </div>
      
      <!-- DESKTOP NAV LINKS -->
      <div class="hidden md:flex items-center space-x-12">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="$emit('changeTab', tab.id)"
          :class="[activeTab === tab.id ? 'text-volt border-b-2 border-volt' : 'text-white/60 hover:text-white', 'text-xs font-black italic uppercase tracking-[0.3em] pb-1 transition-all duration-300']"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- RIGHT SECTION (DESKTOP USER INFO & HAMBURGER) -->
      <div class="flex items-center space-x-6">
        <!-- Desktop User Info -->
        <div v-if="user" class="hidden md:flex items-center space-x-4">
          <button @click="isProfileOpen = !isProfileOpen" class="text-right hover:opacity-70 transition-opacity cursor-pointer">
             <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">SIGNED IN AS</p>
             <p class="text-xs font-black italic text-volt uppercase leading-tight flex items-center justify-end">
               {{ user.name || user.email }}
               <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="ml-1 opacity-50"><polyline points="6 9 12 15 18 9"></polyline></svg>
             </p>
          </button>
        </div>
        
        <button 
          v-else-if="!user"
          @click="$emit('openAuth')"
          class="hidden md:block border-2 border-volt px-4 py-1.5 text-volt text-xs font-black italic uppercase tracking-widest hover:bg-volt hover:text-black transition-all transform active:scale-95"
        >
          LOGIN / JOIN
        </button>

        <!-- HAMBURGER BUTTON -->
        <button 
          @click="isMenuOpen = !isMenuOpen"
          class="md:hidden text-white p-2 focus:outline-none"
        >
          <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <!-- MOBILE MENU OVERLAY -->
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-4"
    >
      <div v-if="isMenuOpen" class="md:hidden mt-4 pt-4 border-t border-volt/10 space-y-6">
        <div class="flex flex-col space-y-4 px-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="handleTabChange(tab.id)"
            :class="[activeTab === tab.id ? 'text-volt' : 'text-white/60', 'text-lg font-black italic uppercase tracking-[0.2em] text-left transition-all']"
          >
            {{ tab.name }}
          </button>
        </div>

        <div class="pt-4 border-t border-volt/10 px-2 space-y-4">
          <div v-if="user" class="flex flex-col items-start">
             <p class="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">SIGNED IN AS</p>
             <p class="text-sm font-black italic text-volt uppercase leading-tight mt-1">{{ user.name || user.email }}</p>
             <button @click="$emit('logout'); isMenuOpen = false" class="mt-4 text-xs font-bold text-white/60 hover:text-white uppercase tracking-widest flex items-center">
                LOGOUT
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
             </button>
          </div>
          <button 
            v-else
            @click="$emit('openAuth'); isMenuOpen = false"
            class="w-full border-2 border-volt py-3 text-volt text-sm font-black italic uppercase tracking-widest active:bg-volt active:text-black transition-all"
          >
            LOGIN / JOIN
          </button>
        </div>
      </div>
    </transition>
  </nav>

  <!-- PROFILE DRAWER OVERLAY -->
  <Transition name="drawer">
    <div v-if="isProfileOpen" class="fixed inset-0 z-[200] flex justify-end" @click.self="isProfileOpen = false">
      <div class="bg-[#0a0a0a] border-l border-[#222222] w-full max-w-sm h-full flex flex-col shadow-2xl overflow-y-auto">
        <!-- Top bar -->
        <div class="p-6 border-b border-[#222222] flex justify-between items-center bg-black">
          <div class="w-2 h-2 bg-volt rotate-45"></div>
          <p class="text-[10px] font-bold tracking-[0.4em] text-white/40 uppercase">MY PROFILE</p>
          <button @click="isProfileOpen = false" class="text-white/40 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- User info -->
        <div class="p-8 border-b border-[#1a1a1a]">
          <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">RUNNER</p>
          <h2 class="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{{ user.name }}</h2>
          <p class="text-sm text-white/40 mt-2">{{ user.email }}</p>
        </div>

        <!-- Stats -->
        <div class="p-8 border-b border-[#1a1a1a] grid grid-cols-2 gap-6">
          <div>
            <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest">TOTAL DISTANCE</p>
            <p class="text-3xl font-black italic text-volt mt-1">{{ user.distance?.toFixed(1) || '0.0' }} <span class="text-sm">KM</span></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest">SESSIONS</p>
            <p class="text-3xl font-black italic text-white mt-1">{{ user.runs || 0 }}</p>
          </div>
        </div>

        <!-- Crew info -->
        <div class="p-8 border-b border-[#1a1a1a]">
          <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3">CREW STATUS</p>
          <div v-if="myGroup" class="bg-volt/10 border border-volt/30 p-4">
            <p class="text-[10px] text-volt font-bold uppercase tracking-widest">MEMBER OF</p>
            <p class="text-xl font-black italic text-white uppercase mt-1">{{ myGroup.name }}</p>
            <p class="text-[10px] text-white/30 tracking-widest mt-2">INVITE CODE: <span class="text-white font-bold select-all">{{ myGroup.secretCode }}</span></p>
          </div>
          <div v-else class="text-white/30 text-sm font-bold uppercase tracking-widest">
            NOT IN A CREW — SOLO RUNNER
          </div>
        </div>

        <!-- Logout -->
        <div class="p-8 mt-auto">
          <button @click="doLogout" class="w-full border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white py-3 font-black italic uppercase tracking-widest text-sm transition-all">
            LOGOUT
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { store } from '../dataStore';

const props = defineProps({
  user: Object,
  activeTab: String
});
const emit = defineEmits(['openAuth', 'logout', 'changeTab']);

const isMenuOpen = ref(false);
const isProfileOpen = ref(false);

const myGroup = computed(() => {
  if (!props.user?.groupId) return null;
  return store.groups.find(g => g.id === props.user.groupId);
});

const tabs = [
  { id: 'dashboard', name: 'DASHBOARD' },
  { id: 'tracker', name: 'TRACKER' },
  { id: 'ranking', name: 'RANKING' },
  { id: 'statistics', name: 'STATISTICS' }
];

const handleTabChange = (tabId) => {
  emit('changeTab', tabId);
  isMenuOpen.value = false;
};

const doLogout = () => {
  isProfileOpen.value = false;
  emit('logout');
};
</script>

<style scoped>
.drawer-enter-active, .drawer-leave-active {
  transition: opacity 0.3s ease;
}
.drawer-enter-from, .drawer-leave-to {
  opacity: 0;
}
.drawer-enter-active > div, .drawer-leave-active > div {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.drawer-enter-from > div, .drawer-leave-to > div {
  transform: translateX(100%);
}
</style>


<style scoped>
</style>
