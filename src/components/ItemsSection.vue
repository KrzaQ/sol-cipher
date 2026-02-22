<script setup lang="ts">
import { computed } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import {
  CHARACTER_NAMES,
  ITEMS_PER_CHARACTER,
  QUANTITY_ITEM_IDS,
  PSYNERGY_ITEM_IDS,
  KEY_ITEM_IDS,
  REQUIRED_ITEM_IDS,
  QUEST_ITEM_IDS,
  MAX_GS1_ITEM_ID,
  CROSS_GAME_DIFFERENCES,
  TLA_ITEMS,
} from '../codec';
import { CHAR_COLORS } from '../elementColors';

const store = useGameDataStore();

const QUANTITY_SET = new Set(QUANTITY_ITEM_IDS);
const PSYNERGY_SET = new Set(PSYNERGY_ITEM_IDS);
const KEY_SET = new Set(KEY_ITEM_IDS);
const REQUIRED_SET = new Set(REQUIRED_ITEM_IDS);
const QUEST_SET = new Set(QUEST_ITEM_IDS);
const CROSS_GAME_MAP = new Map(CROSS_GAME_DIFFERENCES.map(d => [d.id, d.gs1Name]));
const SLOT_INDICES = Array.from({ length: ITEMS_PER_CHARACTER }, (_, i) => i);

function toggleChar(ci: number) {
  if (store.selectedCharIndex === ci) {
    store.clearSelection();
  } else {
    store.selectChar(ci);
  }
}

function clearSlot(ci: number, si: number) {
  store.setItem(ci, si, 0, 0);
}

function clampQuantity(ci: number, si: number, value: string) {
  const slot = store.gameData.items[ci]![si]!;
  let n = parseInt(value, 10);
  if (isNaN(n) || n < 1) n = 1;
  if (n > 30) n = 30;
  store.setItem(ci, si, slot.itemId, n);
}

const itemGridCols = computed(() => {
  const si = store.selectedCharIndex;
  if (si === null) return 'repeat(4, 1fr)';
  return CHARACTER_NAMES.map((_, i) => i === si ? '2fr' : '1fr').join(' ');
});

function setQuantity(ci: number, si: number, qty: number) {
  const slot = store.gameData.items[ci]![si]!;
  store.setItem(ci, si, slot.itemId, qty);
}
</script>

<template>
  <div v-if="!store.isGold" class="text-sm text-gray-400">
    Items are only available in Gold passwords.
  </div>
  <div v-else class="grid gap-2" :style="{ gridTemplateColumns: itemGridCols }">
    <div
      v-for="(charName, ci) in CHARACTER_NAMES"
      :key="ci"
      class="rounded-lg p-2 cursor-pointer border border-gray-800 bg-gray-900/50 min-w-0"
      :class="store.selectedCharIndex === ci
        ? ['ring-1', CHAR_COLORS[ci]!.ring, CHAR_COLORS[ci]!.selectedBg]
        : CHAR_COLORS[ci]!.hoverBg"
      @click="toggleChar(ci)"
    >
      <h3 class="text-sm font-semibold mb-2" :class="CHAR_COLORS[ci]!.heading">{{ charName }}</h3>
      <div class="space-y-1">
        <div
          v-for="si in SLOT_INDICES"
          :key="si"
          class="flex items-center gap-1 text-sm px-1 py-0.5"
        >
          <template v-if="store.gameData.items[ci]![si]!.itemId === 0">
            <span class="text-gray-600 flex-1">(empty)</span>
          </template>
          <template v-else>
            <span class="flex-1 truncate text-amber-50">
              {{ TLA_ITEMS.get(store.gameData.items[ci]![si]!.itemId) ?? `#${store.gameData.items[ci]![si]!.itemId}` }}
            </span>
            <span v-if="CROSS_GAME_MAP.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-orange-400" :title="`Called '${CROSS_GAME_MAP.get(store.gameData.items[ci]![si]!.itemId)}' in GS1`">GS1</span>
            <span v-if="REQUIRED_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-red-400" title="Required for TLA completion">Req</span>
            <span v-if="PSYNERGY_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-cyan-400">Psy</span>
            <span v-if="KEY_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-amber-400">Key</span>
            <span v-if="QUEST_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-emerald-400">Quest</span>
            <span v-if="store.gameData.items[ci]![si]!.itemId > MAX_GS1_ITEM_ID" class="shrink-0 text-[10px] font-semibold text-violet-400">TLA</span>
            <span v-if="store.selectedCharIndex === null && QUANTITY_SET.has(store.gameData.items[ci]![si]!.itemId)" class="text-xs text-gray-500">{{ store.gameData.items[ci]![si]!.quantity }}</span>
            <template v-if="store.selectedCharIndex === ci">
              <template v-if="QUANTITY_SET.has(store.gameData.items[ci]![si]!.itemId)">
                <button
                  class="text-gray-500 hover:text-amber-400 text-xs px-0.5"
                  title="Set quantity to 1"
                  @click.stop="setQuantity(ci, si, 1)"
                >1</button>
                <input
                  type="number"
                  min="1"
                  max="30"
                  :value="store.gameData.items[ci]![si]!.quantity"
                  @click.stop
                  @change="clampQuantity(ci, si, ($event.target as HTMLInputElement).value)"
                  class="w-10 border border-gray-700 bg-gray-800 text-amber-50 rounded px-1 text-center text-xs"
                >
                <button
                  class="text-gray-500 hover:text-amber-400 text-xs px-0.5"
                  title="Set quantity to 30"
                  @click.stop="setQuantity(ci, si, 30)"
                >30</button>
              </template>
              <button
                class="text-gray-500 hover:text-red-400 text-xs px-1"
                title="Clear slot"
                @click.stop="clearSlot(ci, si)"
              >&times;</button>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
