<template>
  <!-- TOP HEADER (Logo & Profile) -->
  <nav class="sticky top-0 z-40 bg-[#000000]/95 backdrop-blur-md border-b border-volt/10 px-6 py-4">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <!-- LOGO -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 flex items-center justify-center bg-volt rounded-sm p-1">
           <svg viewBox="20 10 220 110" xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-black">
              <path d="M50 100 L70 30 Q80 20 105 20 Q130 20 125 50 Q120 75 90 75 L120 105" stroke="currentColor" stroke-width="20" fill="none" stroke-linecap="butt" stroke-linejoin="miter"/>
              <path d="M140 35 C180 15 200 55 170 65 C140 75 155 105 195 95" stroke="currentColor" stroke-width="22" fill="none" stroke-linecap="butt" stroke-linejoin="miter"/>
           </svg>
        </div>
        <span class="text-lg font-black italic tracking-tighter uppercase text-white">RUNNING <span class="text-volt">SAGA</span></span>
      </div>
      
      <!-- DESKTOP NAV LINKS (Hidden on Mobile) -->
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

      <!-- PROFILE ACCESS -->
      <div class="flex items-center space-x-4">
        <button v-if="user" @click="isProfileOpen = !isProfileOpen" class="w-8 h-8 rounded-full bg-[#111] border border-volt/30 flex items-center justify-center text-volt hover:bg-volt hover:text-black transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
        <button v-else @click="$emit('openAuth')" class="text-[10px] font-black italic text-volt border border-volt px-3 py-1 uppercase tracking-widest hover:bg-volt hover:text-black transition-all">
          LOGIN
        </button>
      </div>
    </div>
  </nav>

  <!-- MOBILE BOTTOM TAB BAR (Visible only on Mobile) -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-xl border-t border-white/5 px-4 pb-safe">
    <div class="flex justify-around items-center h-16">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="$emit('changeTab', tab.id)"
        class="flex flex-col items-center justify-center space-y-1 transition-all duration-300 active:scale-90"
        :class="activeTab === tab.id ? 'text-volt' : 'text-white/40'"
      >
        <div class="relative">
          <component :is="tab.icon" class="w-5 h-5" />
          <div v-if="activeTab === tab.id" class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-volt rounded-full shadow-[0_0_8px_#CEFF00]"></div>
        </div>
        <span class="text-[8px] font-black italic uppercase tracking-widest">{{ tab.name }}</span>
      </button>
    </div>
  </div>

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
          <h2 class="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{{ user?.name }}</h2>
          <p class="text-sm text-white/40 mt-2">{{ user?.email }}</p>
        </div>

        <!-- Stats -->
        <div class="p-8 border-b border-[#1a1a1a] grid grid-cols-2 gap-6">
          <div>
            <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest">TOTAL DISTANCE</p>
            <p class="text-3xl font-black italic text-volt mt-1">{{ user?.distance?.toFixed(1) || '0.0' }} <span class="text-sm">KM</span></p>
          </div>
          <div>
            <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest">SESSIONS</p>
            <p class="text-3xl font-black italic text-white mt-1">{{ user?.runs || 0 }}</p>
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

// Inline Icon Components
const IconDashboard = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`
};
const IconTracker = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v10l4.5 4.5"></path><circle cx="12" cy="12" r="10"></circle></svg>`
};
const IconRanking = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`
};
const IconStatistics = {
  template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`
};

const tabs = [
  { id: 'dashboard', name: 'HOME', icon: IconDashboard },
  { id: 'tracker', name: 'TRACK', icon: IconTracker },
  { id: 'ranking', name: 'RANK', icon: IconRanking },
  { id: 'statistics', name: 'STATS', icon: IconStatistics }
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
