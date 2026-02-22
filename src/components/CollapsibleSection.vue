<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="border border-gray-700 rounded-lg">
    <div class="px-4 py-3 font-semibold text-amber-50">
      {{ title }}
    </div>
    <div class="px-4 pb-4">
      <slot />
    </div>
  </section>
</template>
