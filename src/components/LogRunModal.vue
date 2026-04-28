<template>
  <Transition name="modal">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-black md:bg-black/90 md:p-4 md:backdrop-blur-sm">
      <div class="bg-[#000000] md:bg-[#111111] md:border md:border-[#222222] w-full h-full md:h-auto md:max-w-lg p-8 relative overflow-hidden overflow-y-auto custom-scrollbar shadow-2xl modal-container">
        <!-- Decor line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-volt"></div>
        
        <div class="flex justify-between items-start mb-12 mt-6 md:mt-0">
          <div>
            <h2 class="text-6xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-[0.8]">
              LOG NEW<br/><span class="text-volt">ACTIVITY</span>
            </h2>
            <p class="text-[11px] font-bold tracking-[0.4em] text-white/40 uppercase mt-4">Enter your run details</p>
          </div>
          <button @click="$emit('close')" class="text-white/40 hover:text-white transition-colors p-2 -mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- DATE INPUT -->
          <div>
            <label class="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">DATE</label>
            <input v-model="form.date" type="date" required class="w-full bg-[#222222] border border-[#333333] text-white p-4 font-black italic outline-none focus:border-volt transition-colors">
          </div>

          <!-- IMAGE UPLOAD AREA -->
          <div>
            <label class="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-3 text-center">PROOF OF RUN (IMAGE)</label>
            <div 
              @click="$refs.fileInput.click()"
              @dragover.prevent="dragActive = true"
              @dragleave.prevent="dragActive = false"
              @drop.prevent="handleDrop"
              :class="[
                'relative cursor-pointer group transition-all duration-300 border-2 border-dashed overflow-hidden aspect-video flex items-center justify-center',
                dragActive ? 'border-volt bg-volt/5' : 'border-white/10 hover:border-volt/30 bg-[#1a1a1a]'
              ]"
            >
              <input 
                ref="fileInput" 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleFileChange"
              >
              
              <div v-if="!imagePreview" class="text-center p-6">
                <div class="w-12 h-12 border-2 border-volt/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CCFF00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <p class="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">DRAG & DROP OR CLICK TO UPLOAD</p>
              </div>
              
              <img v-else :src="imagePreview" class="w-full h-full object-cover">
              
              <div v-if="imagePreview" class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <p class="text-[10px] font-black italic tracking-widest text-volt uppercase">CHANGE IMAGE</p>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">RUNNER</label>
            <div class="w-full bg-[#1a1a1a] border border-volt/30 text-volt p-4 font-black italic outline-none flex items-center justify-between">
              <span class="tracking-widest uppercase">{{ currentUserName }}</span>
              <span class="text-[8px] bg-volt text-black px-2 py-1 leading-none not-italic rounded-sm">VERIFIED RUNNER</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">DISTANCE (KM)</label>
              <input v-model.number="form.distance" type="number" step="0.001" required class="w-full bg-[#222222] border border-[#333333] text-white p-4 text-2xl font-black italic outline-none focus:border-volt transition-colors" placeholder="0.000">
            </div>
            <div>
              <label class="block text-[10px] font-bold tracking-[0.2em] text-white/40 uppercase mb-2">AVG PACE (/KM)</label>
              <input v-model="form.pace" type="text" required class="w-full bg-[#222222] border border-[#333333] text-white p-4 text-2xl font-black italic outline-none focus:border-volt transition-colors" placeholder="4'30\"">
            </div>
          </div>

          <button type="submit" class="w-full bg-volt text-black py-4 font-black italic text-xl uppercase tracking-tighter hover:bg-white transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4">
            RECORD RUN
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';

const props = defineProps({
  isOpen: Boolean,
  currentUserName: String
});

const emit = defineEmits(['close', 'submit']);

// form.name auto-set is handled by the watch below

watch([() => props.isOpen, () => props.currentUserName], ([isOpen, currentUserName]) => {
  if (isOpen && currentUserName) {
    form.name = currentUserName;
  }
}, { immediate: true });

const dragActive = ref(false);
const imagePreview = ref(null);
const selectedFile = ref(null);

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  name: '',
  distance: null,
  pace: '',
  image: null,
  date: today
});

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) processFile(file);
};

const handleDrop = (e) => {
  dragActive.value = false;
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) processFile(file);
};

const processFile = (file) => {
  selectedFile.value = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
    form.image = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleSubmit = () => {
  // Ensure name is up to date
  form.name = props.currentUserName;
  emit('submit', { ...form });
  // Reset form but keep the name for consistency if needed (watch handles it on next open)
  form.distance = null;
  form.pace = '';
  form.image = null;
  form.date = today;
  imagePreview.value = null;
  selectedFile.value = null;
};
</script>

<style scoped>
/* Removed select styling as it's no longer used */

/* Custom scrollbar Nike Style */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #333333;
  border-radius: 10px;
}

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
