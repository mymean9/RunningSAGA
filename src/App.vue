<template>
  <div class="main-app">
    <!-- NOT LOGGED IN: Landing Page -->
    <template v-if="!user">
      <LandingPage @openAuth="openAuth" />
      <AuthModal :isOpen="isAuthOpen" :initialMode="authMode" @close="isAuthOpen = false" />
    </template>

    <!-- LOGGED IN: Full App -->
    <template v-else>
      <Navbar
        :user="user"
        :activeTab="activeTab"
        @openAuth="openAuth"
        @logout="handleLogout"
        @changeTab="handleTabChange"
      />
      <main class="relative pb-24 md:pb-0">
        <Transition name="fade" mode="out-in">
          <component
            :is="activeTab === 'dashboard' ? Dashboard : (activeTab === 'tracker' ? Tracker : (activeTab === 'ranking' ? Ranking : Statistics))"
            :currentUser="user"
          />
        </Transition>
      </main>
    </template>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import LandingPage from './components/LandingPage.vue'
import Dashboard from './components/Dashboard.vue'
import Tracker from './components/StepTracker.vue'
import Ranking from './components/Ranking.vue'
import Statistics from './components/Statistics.vue'
import AuthModal from './components/AuthModal.vue'
import { ref, computed } from 'vue'
import { store } from './dataStore'

const isAuthOpen = ref(false);
const authMode = ref('login');
const activeTab = ref('dashboard');
const user = computed(() => store.user);

const openAuth = (mode = 'login') => {
  authMode.value = mode;
  isAuthOpen.value = true;
};

const handleTabChange = (tab) => {
  if (store.isTrackingActive && tab !== 'tracker') {
    const answer = window.confirm('현재 러닝 기록을 측정 중입니다. 무시하고 다른 메뉴로 가시겠습니까? (기록은 백그라운드에서 유지됩니다)');
    if (!answer) return;
  }
  activeTab.value = tab;
};

const handleLogout = () => {
  store.logout();
  activeTab.value = 'dashboard';
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;700;900&family=Inter:wght@400;700;900&family=Outfit:wght@700;900&display=swap');

.main-app {
  font-family: 'Noto Sans KR', 'Outfit', 'Inter', sans-serif;
  font-weight: 400;
  background-color: #000000;
  color: white;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
