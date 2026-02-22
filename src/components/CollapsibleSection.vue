<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section class="border border-gray-700 rounded-lg">
    <div class="flex items-center justify-between px-4 py-3 font-semibold text-amber-50">
      <span>{{ title }}</span>
      <slot name="header-right" />
    </div>
    <div class="px-4 pb-4">
      <slot />
    </div>
  </section>
</template>
