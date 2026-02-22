<script setup lang="ts">
import { useGameDataStore } from '../stores/gameData';
import { EVENT_FLAGS, MAX_COINS } from '../codec';

const store = useGameDataStore();

function clampCoins(value: string) {
  let n = parseInt(value, 10);
  if (isNaN(n) || n < 0) n = 0;
  if (n > MAX_COINS) n = MAX_COINS;
  store.setCoins(n);
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-semibold text-amber-50 mb-1">Coins</label>
      <input
        type="number"
        min="0"
        :max="MAX_COINS"
        :value="store.gameData.coins"
        @change="clampCoins(($event.target as HTMLInputElement).value)"
        class="w-40 border border-gray-700 bg-gray-800 text-amber-50 rounded px-2 py-1 text-sm"
      >
    </div>

    <div>
      <h3 class="text-sm font-semibold text-amber-50 mb-2">Event Flags</h3>
      <div class="space-y-1">
        <label
          v-for="(flag, index) in EVENT_FLAGS"
          :key="index"
          class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
          :title="flag.description"
        >
          <input
            type="checkbox"
            :checked="store.isFlagSet(index)"
            @change="store.setFlag(index, ($event.target as HTMLInputElement).checked)"
            class="accent-amber-600"
          >
          {{ flag.name }}
        </label>
      </div>
    </div>
  </div>
</template>
