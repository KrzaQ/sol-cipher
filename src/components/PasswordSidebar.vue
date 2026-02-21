<script setup lang="ts">
const presets = ['Story Clear', 'Completionist', 'Debug']
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800">Password</h2>

    <div class="border-2 border-dashed border-gray-300 rounded p-3 text-sm text-gray-500">
      Password type selector (Gold / Silver)
    </div>

    <textarea
      disabled
      rows="4"
      placeholder="Password text..."
      class="w-full rounded border border-gray-300 bg-gray-100 p-2 text-sm text-gray-400"
    />

    <div class="flex gap-2">
      <button
        disabled
        class="flex-1 rounded bg-gray-300 px-3 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
      >Generate</button>
      <button
        disabled
        class="flex-1 rounded bg-gray-300 px-3 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
      >Decode</button>
    </div>

    <hr class="border-gray-200">

    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Presets</p>
      <button
        v-for="name in presets"
        :key="name"
        disabled
        class="block w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-left text-sm text-gray-400 cursor-not-allowed"
      >{{ name }}</button>
    </div>
  </div>
</template>
