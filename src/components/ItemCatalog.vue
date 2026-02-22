<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import { TLA_ITEMS } from '../codec';

const store = useGameDataStore();
const search = ref('');

// All items except (empty) id=0
const allItems = computed(() => {
  const result: { id: number; name: string }[] = [];
  for (const [id, name] of TLA_ITEMS) {
    if (id === 0) continue;
    result.push({ id, name });
  }
  return result;
});

const filteredItems = computed(() => {
  const q = search.value.toLowerCase();
  if (!q) return allItems.value;
  return allItems.value.filter(item => item.name.toLowerCase().includes(q));
});

// Set of item IDs held by the currently selected character
const heldItemIds = computed<Set<number>>(() => {
  if (store.selectedCharIndex === null) return new Set();
  const charItems = store.gameData.items[store.selectedCharIndex]!;
  const ids = new Set<number>();
  for (const slot of charItems) {
    if (slot.itemId !== 0) ids.add(slot.itemId);
  }
  return ids;
});

const hasSelection = computed(() => store.selectedCharIndex !== null);

function pickItem(itemId: number) {
  if (!hasSelection.value) return;
  if (heldItemIds.value.has(itemId)) return;
  store.assignItem(itemId);
}
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-lg font-bold text-amber-50">Item Catalog</h2>

    <input
      v-model="search"
      type="search"
      placeholder="Search items..."
      class="w-full rounded border border-gray-700 bg-gray-800 text-amber-50 placeholder:text-gray-500 p-2 text-sm"
    >

    <p v-if="!hasSelection" class="text-xs text-gray-500">
      Select a character in the Items section to assign items.
    </p>

    <div class="overflow-y-auto max-h-[60vh] -mx-1">
      <button
        v-for="item in filteredItems"
        :key="item.id"
        type="button"
        class="block w-full text-left px-2 py-1 text-sm rounded"
        :class="
          !hasSelection || heldItemIds.has(item.id)
            ? 'text-gray-600 cursor-default'
            : 'text-amber-50 hover:bg-amber-900/30 cursor-pointer'
        "
        :disabled="!hasSelection || heldItemIds.has(item.id)"
        @click="pickItem(item.id)"
      >
        {{ item.name }}
      </button>
    </div>
  </div>
</template>
