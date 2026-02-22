<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  defaultOpen?: boolean
}>(), {
  defaultOpen: true,
})

const isOpen = ref(props.defaultOpen)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <section class="border border-gray-700 rounded-lg">
    <button
      type="button"
      class="flex w-full items-center justify-between px-4 py-3 text-left font-semibold text-amber-50 hover:bg-gray-800/50"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <span>{{ title }}</span>
      <span
        class="text-xs transition-transform duration-150"
        :class="isOpen ? 'rotate-90' : ''"
      >&#9654;</span>
    </button>
    <div v-show="isOpen" class="px-4 pb-4">
      <slot />
    </div>
  </section>
</template>
