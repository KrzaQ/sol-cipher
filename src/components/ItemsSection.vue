<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
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
  RUSTY_FORGE_MAP,
  UNOBTAINABLE_ITEM_IDS,
  SPECIAL_ITEM_IDS,
  TLA_ITEMS,
  type ItemSlot,
} from '../codec';
import { CHAR_COLORS } from '../elementColors';
import CollapsibleSection from './CollapsibleSection.vue';
import BottomSheet from './BottomSheet.vue';
import ItemCatalog from './ItemCatalog.vue';

const store = useGameDataStore();

const lgQuery = window.matchMedia('(min-width: 1024px)');
const isDesktop = ref(lgQuery.matches);
function onMediaChange(e: MediaQueryListEvent) { isDesktop.value = e.matches; }
onMounted(() => lgQuery.addEventListener('change', onMediaChange));
onUnmounted(() => lgQuery.removeEventListener('change', onMediaChange));

const sheetOpen = ref(false);

const QUANTITY_SET = new Set(QUANTITY_ITEM_IDS);
const PSYNERGY_SET = new Set(PSYNERGY_ITEM_IDS);
const KEY_SET = new Set(KEY_ITEM_IDS);
const REQUIRED_SET = new Set(REQUIRED_ITEM_IDS);
const QUEST_SET = new Set(QUEST_ITEM_IDS);
const UNOBTAINABLE_SET = new Set(UNOBTAINABLE_ITEM_IDS);
const CROSS_GAME_MAP = new Map(CROSS_GAME_DIFFERENCES.map(d => [d.id, d.gs1Name]));
const SLOT_INDICES = Array.from({ length: ITEMS_PER_CHARACTER }, (_, i) => i);

const E = { itemId: 0, quantity: 0 };
function I(id: number, q = 0): ItemSlot { return { itemId: id, quantity: q }; }
function pad(slots: ItemSlot[]): ItemSlot[] {
  return [...slots, ...Array(ITEMS_PER_CHARACTER - slots.length).fill(E)];
}

const ITEM_PRESETS: { name: string; items: ItemSlot[][] }[] = [
  { name: 'Minimal', items: [
    pad([I(0xDE), I(0xF2)]), // Isaac: Mythril Bag + Black Crystal
    pad([]),
    pad([]),
    pad([]),
  ]},
  { name: 'Psy', items: [
    pad([I(0xDE), I(0xF2), ...SPECIAL_ITEM_IDS.map(id => I(id))]), // Req + 8 psynergy items
    pad([]),
    pad([]),
    pad([]),
  ]},
  { name: 'Story Clear', items: [
    pad([I(0x09), I(0x97), I(0x83), I(0x55), I(0x100), I(0xCF), I(0xCE), I(0x107), I(0xFA), I(0xEF, 30), I(0xE5, 12), I(0xE4, 27), I(0xDE), I(0xF2)]),
    pad([I(0x0B), I(0x98), I(0x84), I(0x52), I(0x100), I(0x10C), I(0xFA), I(0xE9)]),
    pad([I(0x19), I(0xA0), I(0x8D), I(0x70), I(0x101), I(0xCC), I(0xC8), I(0x106), I(0xFC), I(0xBA, 15)]),
    pad([I(0x40), I(0x9F), I(0x8C), I(0x71), I(0x101), I(0xCD), I(0xCB), I(0xCA), I(0xC9), I(0x109), I(0xFB), I(0xBD, 15), I(0xB7, 30), I(0xEF, 25)]),
  ]},
  { name: 'Completionist', items: [
    pad([I(0xF2), I(0xEF, 30), I(0xE5, 12), I(0xE4, 30), I(0xDE), I(0x09), I(0xA4), I(0x97), I(0x83), I(0x55), I(0x100), I(0xCF), I(0xCE), I(0x107), I(0xFA)]),
    pad([I(0xEF, 30), I(0xBD, 30), I(0x32), I(0x26), I(0x0B), I(0xA2), I(0x98), I(0x84), I(0x60), I(0x54), I(0x53), I(0x52), I(0x100), I(0x10C), I(0xFA)]),
    pad([I(0xEF, 30), I(0xBA, 30), I(0xB7, 30), I(0x19), I(0x15), I(0xA1), I(0xA0), I(0x8D), I(0x70), I(0x62), I(0x101), I(0xCC), I(0xC8), I(0x106), I(0xFC)]),
    pad([I(0xEF, 30), I(0xBD, 30), I(0xB7, 30), I(0x40), I(0x31), I(0x9F), I(0x8C), I(0x71), I(0x101), I(0xCD), I(0xCB), I(0xCA), I(0xC9), I(0x109), I(0xFB)]),
  ]},
  { name: 'Ultimate', items: [
    pad([I(0x0A), I(0xA4), I(0x97), I(0x16B), I(0x16B), I(0x16D), I(0x18C), I(0x60), I(0x177), I(0x174), I(0x174), I(0x148), I(0x114), I(0x114), I(0x114)]),
    pad([I(0x141), I(0x142), I(0x143), I(0x125), I(0x110), I(0x112), I(0x129), I(0x132), I(0x150), I(0x159), I(0x159), I(0x15C), I(0x70), I(0x70), I(0x165)]),
    pad([I(0xBF, 30), I(0xC0, 30), I(0xC1, 30), I(0xC2, 30), I(0xC3, 30), I(0xC4, 30), I(0xE4, 30), I(0xE5, 30), I(0x10C), I(0x10C), I(0x197), I(0x197), I(0x197), I(0x197), I(0xCD)]),
    pad([I(0xCA), I(0xC9), I(0xCC), I(0xCF), I(0xCE), I(0xCB), I(0xC8), I(0xF2), I(0xDE), I(0xC4, 30), I(0xC3, 30), I(0xC2, 30), I(0xC1, 30), I(0xC0, 30), I(0xBF, 30)]),
  ]},
];

function applyPreset(preset: typeof ITEM_PRESETS[number]) {
  store.setAllItems(preset.items);
}

function toggleChar(ci: number) {
  if (isDesktop.value) {
    if (store.selectedCharIndex === ci) {
      store.clearSelection();
    } else {
      store.selectChar(ci);
    }
  } else {
    store.selectChar(ci);
    sheetOpen.value = true;
  }
}

function closeSheet() {
  sheetOpen.value = false;
  store.clearSelection();
}

function clearSlot(ci: number, si: number) {
  store.removeItem(ci, si);
}

function clampQuantity(ci: number, si: number, value: string) {
  const slot = store.gameData.items[ci]![si]!;
  let n = parseInt(value, 10);
  if (isNaN(n) || n < 1) n = 1;
  if (n > 30) n = 30;
  store.setItem(ci, si, slot.itemId, n);
}

const itemGridCols = computed(() => {
  if (!isDesktop.value) return undefined;
  const si = store.selectedCharIndex;
  if (si === null) return 'repeat(4, 1fr)';
  return CHARACTER_NAMES.map((_, i) => i === si ? '2fr' : '1fr').join(' ');
});

function isExpanded(ci: number): boolean {
  if (!isDesktop.value) return true; // mobile: always expanded
  return store.selectedCharIndex === ci;
}

type Badge = 'Req' | 'Forge' | 'Psy' | 'Key' | 'GS1' | 'Unused' | 'TLA' | 'Quest';

function topBadge(itemId: number): Badge | null {
  if (REQUIRED_SET.has(itemId)) return 'Req';
  if (RUSTY_FORGE_MAP.has(itemId)) return 'Forge';
  if (PSYNERGY_SET.has(itemId)) return 'Psy';
  if (KEY_SET.has(itemId)) return 'Key';
  if (CROSS_GAME_MAP.has(itemId)) return 'GS1';
  if (UNOBTAINABLE_SET.has(itemId)) return 'Unused';
  if (itemId > MAX_GS1_ITEM_ID) return 'TLA';
  if (QUEST_SET.has(itemId)) return 'Quest';
  return null;
}

function setQuantity(ci: number, si: number, qty: number) {
  const slot = store.gameData.items[ci]![si]!;
  store.setItem(ci, si, slot.itemId, qty);
}

const itemsEl = ref<HTMLElement | null>(null);

function onItemAdded(ci: number, si: number) {
  nextTick(() => {
    const el = itemsEl.value?.querySelector(`[data-slot="${ci}-${si}"]`) as HTMLElement | null;
    if (!el) return;
    // Find the scrollable ancestor (the root div with overflow-y-auto)
    let scroller: HTMLElement | null = el.parentElement;
    while (scroller && scroller.scrollHeight <= scroller.clientHeight) {
      scroller = scroller.parentElement;
    }
    if (!scroller) return;
    const elRect = el.getBoundingClientRect();
    const scrollerRect = scroller.getBoundingClientRect();
    // Scroll item to near the top — the bottom sheet covers most of the screen
    const target = scroller.scrollTop + (elRect.top - scrollerRect.top) - 16;
    scroller.scrollTo({ top: target, behavior: 'smooth' });
  });
}
</script>

<template>
  <CollapsibleSection title="Items">
    <template #header-right>
      <div v-if="store.isGold" class="flex flex-wrap gap-1 font-normal">
        <template v-for="(preset, i) in ITEM_PRESETS" :key="preset.name">
          <span v-if="i > 0" class="text-xs text-gray-600">|</span>
          <button
            @click="applyPreset(preset)"
            class="text-xs text-amber-400 hover:text-amber-300"
          >{{ preset.name }}</button>
        </template>
      </div>
    </template>
    <div v-if="!store.isGold" class="text-sm text-gray-400">
      Items are only available in Gold passwords.
    </div>
    <div v-else ref="itemsEl" class="grid grid-cols-1 gap-2" :style="itemGridCols ? { gridTemplateColumns: itemGridCols } : undefined">
      <div
        v-for="(charName, ci) in CHARACTER_NAMES"
        :key="ci"
        class="rounded-lg p-2 cursor-pointer border border-gray-800 bg-gray-900/50 min-w-0"
        :class="store.selectedCharIndex === ci
          ? ['ring-1', CHAR_COLORS[ci]!.ring, CHAR_COLORS[ci]!.selectedBg]
          : CHAR_COLORS[ci]!.hoverBg"
        @click="toggleChar(ci)"
      >
        <h3 class="text-sm font-semibold mb-2" :class="CHAR_COLORS[ci]!.heading" style="font-family: 'Cinzel Decorative', serif">{{ charName }}</h3>
        <div class="space-y-1">
          <div
            v-for="si in SLOT_INDICES"
            :key="si"
            :data-slot="`${ci}-${si}`"
            class="flex items-center gap-1 text-sm px-1 py-0.5"
          >
            <template v-if="store.gameData.items[ci]![si]!.itemId === 0">
              <span class="text-gray-600 flex-1">(empty)</span>
            </template>
            <template v-else>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1">
                  <span class="truncate text-amber-50">
                    {{ TLA_ITEMS.get(store.gameData.items[ci]![si]!.itemId) ?? `#${store.gameData.items[ci]![si]!.itemId}` }}
                  </span>
                  <template v-if="isExpanded(ci)">
                    <span v-if="CROSS_GAME_MAP.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-orange-400">GS1</span>
                    <span v-if="REQUIRED_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-red-400">Req</span>
                    <span v-if="PSYNERGY_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-cyan-400">Psy</span>
                    <span v-if="KEY_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-amber-400">Key</span>
                    <span v-if="QUEST_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-emerald-400">Quest</span>
                    <span v-if="UNOBTAINABLE_SET.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-gray-400" title="Unobtainable in normal gameplay">Unused</span>
                    <span v-if="store.gameData.items[ci]![si]!.itemId > MAX_GS1_ITEM_ID" class="shrink-0 text-[10px] font-semibold text-violet-400">TLA</span>
                    <span v-if="RUSTY_FORGE_MAP.has(store.gameData.items[ci]![si]!.itemId)" class="shrink-0 text-[10px] font-semibold text-pink-400">Forge</span>
                  </template>
                  <template v-else>
                    <span v-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'Req'" class="shrink-0 text-[10px] font-semibold text-red-400">Req</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'Forge'" class="shrink-0 text-[10px] font-semibold text-pink-400">Forge</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'Psy'" class="shrink-0 text-[10px] font-semibold text-cyan-400">Psy</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'Key'" class="shrink-0 text-[10px] font-semibold text-amber-400">Key</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'GS1'" class="shrink-0 text-[10px] font-semibold text-orange-400">GS1</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'Unused'" class="shrink-0 text-[10px] font-semibold text-gray-400" title="Unobtainable in normal gameplay">Unused</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'TLA'" class="shrink-0 text-[10px] font-semibold text-violet-400">TLA</span>
                    <span v-else-if="topBadge(store.gameData.items[ci]![si]!.itemId) === 'Quest'" class="shrink-0 text-[10px] font-semibold text-emerald-400">Quest</span>
                  </template>
                </div>
                <div v-if="isExpanded(ci) && (CROSS_GAME_MAP.has(store.gameData.items[ci]![si]!.itemId) || RUSTY_FORGE_MAP.has(store.gameData.items[ci]![si]!.itemId) || UNOBTAINABLE_SET.has(store.gameData.items[ci]![si]!.itemId))" class="text-[11px] text-gray-500">
                  <span v-if="CROSS_GAME_MAP.has(store.gameData.items[ci]![si]!.itemId)">GS1: {{ CROSS_GAME_MAP.get(store.gameData.items[ci]![si]!.itemId) }}</span>
                  <span v-if="CROSS_GAME_MAP.has(store.gameData.items[ci]![si]!.itemId) && (RUSTY_FORGE_MAP.has(store.gameData.items[ci]![si]!.itemId) || UNOBTAINABLE_SET.has(store.gameData.items[ci]![si]!.itemId))"> · </span>
                  <span v-if="RUSTY_FORGE_MAP.has(store.gameData.items[ci]![si]!.itemId)">Forges into {{ RUSTY_FORGE_MAP.get(store.gameData.items[ci]![si]!.itemId) }}</span>
                  <span v-if="UNOBTAINABLE_SET.has(store.gameData.items[ci]![si]!.itemId)">Unobtainable in normal gameplay</span>
                </div>
              </div>
              <span v-if="!isExpanded(ci) && QUANTITY_SET.has(store.gameData.items[ci]![si]!.itemId)" class="text-xs text-gray-500">{{ store.gameData.items[ci]![si]!.quantity }}</span>
              <template v-if="isExpanded(ci)">
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
    <BottomSheet :open="sheetOpen" @close="closeSheet">
      <ItemCatalog @item-added="onItemAdded" />
    </BottomSheet>
  </CollapsibleSection>
</template>
