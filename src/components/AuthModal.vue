<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div class="bg-[#000000] border border-[#222222] w-full max-w-lg p-10 relative overflow-hidden shadow-2xl modal-container">
        <!-- Decor line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-volt"></div>
        
        <!-- Logo backdrop -->
        <div class="absolute -bottom-10 -right-10 opacity-[0.05] pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="white"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        </div>

        <div class="flex justify-between items-start mb-12">
          <div class="flex space-x-6">
            <button @click="modeRef = 'login'" :class="[modeRef === 'login' ? 'text-white border-volt' : 'text-white/30 border-transparent', 'text-2xl font-black italic tracking-tighter uppercase border-b-4 pb-1 transition-all duration-300']">
              {{ store.t('login') }}
            </button>
            <button @click="modeRef = 'signup'" :class="[modeRef === 'signup' ? 'text-white border-volt' : 'text-white/30 border-transparent', 'text-2xl font-black italic tracking-tighter uppercase border-b-4 pb-1 transition-all duration-300']">
              {{ store.t('signup') }}
            </button>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Lang Switcher inside Modal -->
            <button 
              @click="store.setLocale(store.locale === 'ko' ? 'en' : 'ko')"
              class="px-2 py-1 border border-white/20 text-[10px] font-black italic hover:bg-white hover:text-black transition-all uppercase tracking-tighter text-white"
            >
              {{ store.locale === 'ko' ? 'EN' : 'KR' }}
            </button>
            
            <button @click="$emit('close')" class="text-white/30 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div class="mb-8">
          <h3 class="text-5xl font-black italic tracking-tighter text-white uppercase leading-[0.9]">
             {{ modeRef === 'login' ? store.t('welcome_back') : store.t('auth_title') }}
          </h3>
          <p class="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mt-4">{{ store.t('auth_desc') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6 relative z-10">
          <div v-if="modeRef === 'signup'">
            <label class="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">{{ store.t('name') }}</label>
            <input v-model="form.displayName" type="text" required class="w-full bg-[#111111] border border-[#222222] text-white p-4 font-black italic uppercase outline-none focus:border-volt transition-colors" :placeholder="store.t('name')">
          </div>
          
          <div>
            <label class="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">{{ store.t('email') }}</label>
            <input v-model="form.email" type="email" required class="w-full bg-[#111111] border border-[#222222] text-white p-4 font-black italic outline-none focus:border-volt transition-colors" placeholder="MAIL@DOMAIN.COM">
          </div>

          <div>
            <label class="block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mb-2">{{ store.t('password') }}</label>
            <input v-model="form.password" type="password" required minlength="6" class="w-full bg-[#111111] border border-[#222222] text-white p-4 font-black italic outline-none focus:border-volt transition-colors" placeholder="••••••••">
          </div>

          <button 
            type="submit" 
            :disabled="loading"
            class="w-full bg-volt text-black py-4 font-black italic text-xl uppercase tracking-tighter hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-2 flex items-center justify-center disabled:opacity-50"
          >
            <span v-if="!loading">{{ modeRef === 'login' ? store.t('login') : store.t('signup') }}</span>
            <span v-else class="flex items-center">
               <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               {{ store.locale === 'ko' ? '처리 중...' : 'PROCESSING...' }}
            </span>
          </button>

          <!-- Divider -->
          <div class="flex items-center gap-4">
            <div class="flex-1 h-px bg-white/10"></div>
            <span class="text-[10px] font-bold text-white/30 uppercase tracking-widest">OR</span>
            <div class="flex-1 h-px bg-white/10"></div>
          </div>

          <!-- Google Sign-In -->
          <button
            type="button"
            @click="handleGoogle"
            :disabled="loading"
            class="w-full flex items-center justify-center gap-3 border border-white/20 text-white py-3 font-bold uppercase tracking-widest text-sm hover:border-white/50 transition-all disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.8 29.3 5 24 5 12.4 5 3 14.4 3 26s9.4 21 21 21 21-9.4 21-21c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.6 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.1 6.8 29.3 5 24 5 16.3 5 9.7 9 6.3 14.7z"/><path fill="#4CAF50" d="M24 47c5.2 0 9.9-1.8 13.5-4.8l-6.2-5.2A12 12 0 0 1 24 39c-5.2 0-9.6-3.3-11.3-7.9L6 36.4C9.6 42.5 16.3 47 24 47z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.4-2.4 4.4-4.4 5.8l6.2 5.2C40.5 36.2 45 30.6 45 26c0-1.3-.1-2.6-.4-3.9z"/></svg>
            {{ store.t('google_login') }}
          </button>
        </form>

        <p class="mt-8 text-center text-xs font-bold text-white/30 uppercase tracking-widest">
          {{ modeRef === 'login' ? store.t('no_account') : store.t('have_account') }}
          <button @click="modeRef = modeRef === 'login' ? 'signup' : 'login'" class="text-volt hover:underline ml-2 transition-all">
            {{ modeRef === 'login' ? store.t('signup') : store.t('login') }}
          </button>
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue';
import { store } from '../dataStore';

const props = defineProps({
  isOpen: Boolean,
  initialMode: { type: String, default: 'login' }
});

const emit = defineEmits(['close']);

const modeRef = ref('login');
const loading = computed(() => store.loading);

// Switch tab when initialMode changes (e.g. JOIN SAGA vs LOGIN buttons)
watch(() => props.initialMode, (val) => { modeRef.value = val; }, { immediate: true });

const form = reactive({
  email: 'mymean@paran.com',
  password: '1q2w3e',
  displayName: ''
});

const handleSubmit = async () => {
  if (modeRef.value === 'signup') {
    await store.signup(form.email, form.password, form.displayName);
  } else {
    await store.login(form.email, form.password);
  }
  if (store.user) emit('close');
};

const handleGoogle = async () => {
  await store.loginWithGoogle();
  if (store.user) emit('close');
};
</script>

<style scoped>
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
