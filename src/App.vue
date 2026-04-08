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
        @changeTab="(tab) => activeTab = tab"
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

const handleLogout = () => {
  store.logout();
  activeTab.value = 'dashboard';
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Outfit:wght@700;900&display=swap');

.main-app {
  font-family: 'Outfit', 'Inter', sans-serif;
  background-color: #000000;
  color: white;
  min-height: 100vh;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
