<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

// --- Back button support ---
let pushedState = false;

function onPopState() {
  if (props.open) {
    pushedState = false;
    emit('close');
  }
}

watch(() => props.open, (open) => {
  if (open) {
    history.pushState({ bottomSheet: true }, '');
    pushedState = true;
    window.addEventListener('popstate', onPopState);
  } else {
    window.removeEventListener('popstate', onPopState);
    if (pushedState) {
      pushedState = false;
      history.back();
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('popstate', onPopState);
  if (pushedState) {
    pushedState = false;
    history.back();
  }
});

// --- Swipe to close (handle bar only) ---
const dragY = ref(0);
let dragging = false;
let startY = 0;

function onHandleTouchStart(e: TouchEvent) {
  startY = e.touches[0]!.clientY;
  dragging = true;
  dragY.value = 0;
}

function onHandleTouchMove(e: TouchEvent) {
  if (!dragging) return;
  const dy = e.touches[0]!.clientY - startY;
  if (dy < 0) {
    dragY.value = 0;
    return;
  }
  dragY.value = dy;
  e.preventDefault();
}

function onHandleTouchEnd() {
  if (!dragging) return;
  dragging = false;
  if (dragY.value > 80) {
    emit('close');
  }
  dragY.value = 0;
}

function close() {
  emit('close');
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="fixed inset-0 z-50 flex flex-col justify-end">
        <div class="absolute inset-0 bg-black/60" @click="close" />
        <div
          class="relative bg-gray-900 rounded-t-2xl border-t border-gray-700 max-h-[80vh] flex flex-col"
          :style="dragY > 0 ? { transform: `translateY(${dragY}px)`, transition: 'none' } : undefined"
        >
          <div
            class="flex justify-center py-2 cursor-grab"
            @click="close"
            @touchstart="onHandleTouchStart"
            @touchmove="onHandleTouchMove"
            @touchend="onHandleTouchEnd"
          >
            <div class="w-10 h-1 rounded-full bg-gray-600" />
          </div>
          <div class="overflow-y-auto px-4 pb-4 flex-1">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active > .relative,
.sheet-leave-active > .relative {
  transition: transform 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from > .relative,
.sheet-leave-to > .relative {
  transform: translateY(100%);
}
</style>
