<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import {
  TLA_ITEMS,
  QUANTITY_ITEM_IDS,
  PSYNERGY_ITEM_IDS,
  KEY_ITEM_IDS,
  REQUIRED_ITEM_IDS,
  QUEST_ITEM_IDS,
  MAX_GS1_ITEM_ID,
  CROSS_GAME_DIFFERENCES,
  RUSTY_FORGE_MAP,
} from '../codec';

const emit = defineEmits<{ itemAdded: [charIndex: number, slotIndex: number] }>();

const store = useGameDataStore();
const search = ref('');

const QUANTITY_SET = new Set(QUANTITY_ITEM_IDS);
const PSYNERGY_SET = new Set(PSYNERGY_ITEM_IDS);
const KEY_SET = new Set(KEY_ITEM_IDS);
const REQUIRED_SET = new Set(REQUIRED_ITEM_IDS);
const QUEST_SET = new Set(QUEST_ITEM_IDS);
const CROSS_GAME_MAP = new Map(CROSS_GAME_DIFFERENCES.map(d => [d.id, d.gs1Name]));

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

// Only stackable items held by the selected character should be blocked
// (equipment can be added multiple times)
const heldQuantityIds = computed<Set<number>>(() => {
  if (store.selectedCharIndex === null) return new Set();
  const charItems = store.gameData.items[store.selectedCharIndex]!;
  const ids = new Set<number>();
  for (const slot of charItems) {
    if (slot.itemId !== 0 && QUANTITY_SET.has(slot.itemId)) ids.add(slot.itemId);
  }
  return ids;
});

// Check if inventory is full (no empty slots)
const inventoryFull = computed(() => {
  if (store.selectedCharIndex === null) return false;
  const charItems = store.gameData.items[store.selectedCharIndex]!;
  return charItems.every(slot => slot.itemId !== 0);
});

const hasSelection = computed(() => store.selectedCharIndex !== null);

function isDisabled(itemId: number): boolean {
  if (!hasSelection.value) return true;
  if (inventoryFull.value) return true;
  return heldQuantityIds.value.has(itemId);
}

function pickItem(itemId: number) {
  if (isDisabled(itemId)) return;
  const result = store.assignItem(itemId);
  if (result) emit('itemAdded', result[0], result[1]);
}

function gs1Name(itemId: number): string | undefined {
  return CROSS_GAME_MAP.get(itemId);
}
</script>

<template>
  <div class="space-y-3">
    <h2 class="text-lg font-bold text-amber-50" style="font-family: 'Cinzel Decorative', serif">Item Catalog</h2>

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
        class="w-full text-left px-2 py-1 text-sm rounded"
        :class="
          isDisabled(item.id)
            ? 'text-gray-600 cursor-default'
            : 'text-amber-50 hover:bg-amber-900/30 cursor-pointer'
        "
        :disabled="isDisabled(item.id)"
        @click="pickItem(item.id)"
      >
        <div class="flex items-center gap-1">
          <span class="truncate">{{ item.name }}</span>
          <span v-if="gs1Name(item.id)" class="shrink-0 text-[10px] font-semibold text-orange-400">GS1</span>
          <span v-if="REQUIRED_SET.has(item.id)" class="shrink-0 text-[10px] font-semibold text-red-400">Req</span>
          <span v-if="PSYNERGY_SET.has(item.id)" class="shrink-0 text-[10px] font-semibold text-cyan-400">Psy</span>
          <span v-if="KEY_SET.has(item.id)" class="shrink-0 text-[10px] font-semibold text-amber-400">Key</span>
          <span v-if="QUEST_SET.has(item.id)" class="shrink-0 text-[10px] font-semibold text-emerald-400">Quest</span>
          <span v-if="item.id > MAX_GS1_ITEM_ID" class="shrink-0 text-[10px] font-semibold text-violet-400">TLA</span>
          <span v-if="RUSTY_FORGE_MAP.has(item.id)" class="shrink-0 text-[10px] font-semibold text-pink-400">Forge</span>
        </div>
        <div v-if="gs1Name(item.id) || RUSTY_FORGE_MAP.has(item.id)" class="text-[11px] text-gray-500 pl-1">
          <span v-if="gs1Name(item.id)">GS1: {{ gs1Name(item.id) }}</span>
          <span v-if="gs1Name(item.id) && RUSTY_FORGE_MAP.has(item.id)"> · </span>
          <span v-if="RUSTY_FORGE_MAP.has(item.id)">Forges into {{ RUSTY_FORGE_MAP.get(item.id) }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
