<script setup lang="ts">
import { useGameDataStore } from '../stores/gameData';
import { DJINN_NAMES, DJINN_PER_ELEMENT, type Element } from '../codec';
import { ELEMENT_COLORS } from '../elementColors';

const store = useGameDataStore();

const ELEMENT_NAMES: { name: string; index: Element }[] = [
  { name: 'Venus', index: 0 },
  { name: 'Mars', index: 2 },
  { name: 'Jupiter', index: 3 },
  { name: 'Mercury', index: 1 },
];

function isDjinnSet(elementIndex: Element, djinnIndex: number): boolean {
  return (store.gameData.djinn[elementIndex]! & (1 << djinnIndex)) !== 0;
}

function toggleDjinn(elementIndex: Element, djinnIndex: number) {
  const current = store.gameData.djinn[elementIndex]!;
  store.setDjinn(elementIndex, current ^ (1 << djinnIndex));
}

function selectAll(elementIndex: Element) {
  store.setDjinn(elementIndex, (1 << DJINN_PER_ELEMENT) - 1);
}

function clearAll(elementIndex: Element) {
  store.setDjinn(elementIndex, 0);
}

const allMask = (1 << DJINN_PER_ELEMENT) - 1;

function selectAllGlobal() {
  for (const elem of ELEMENT_NAMES) store.setDjinn(elem.index, allMask);
}

function clearAllGlobal() {
  for (const elem of ELEMENT_NAMES) store.setDjinn(elem.index, 0);
}
</script>

<template>
  <div class="flex gap-1 mb-3">
    <button @click="selectAllGlobal" class="text-xs text-amber-400 hover:text-amber-300">All</button>
    <span class="text-xs text-gray-600">|</span>
    <button @click="clearAllGlobal" class="text-xs text-amber-400 hover:text-amber-300">None</button>
  </div>
  <div class="grid grid-cols-4 gap-2">
    <div v-for="elem in ELEMENT_NAMES" :key="elem.index" class="rounded-lg p-2 border border-gray-800 bg-gray-900/50">
      <h3 class="text-sm font-semibold mb-1" :class="ELEMENT_COLORS[elem.index].heading">{{ elem.name }}</h3>
      <div class="flex gap-1 mb-2">
        <button
          @click="selectAll(elem.index)"
          class="text-xs" :class="ELEMENT_COLORS[elem.index].link"
        >All</button>
        <span class="text-xs text-gray-600">|</span>
        <button
          @click="clearAll(elem.index)"
          class="text-xs" :class="ELEMENT_COLORS[elem.index].link"
        >None</button>
      </div>
      <div class="space-y-1">
        <label
          v-for="(djinnName, djinnIndex) in DJINN_NAMES[elem.index]"
          :key="djinnIndex"
          class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="isDjinnSet(elem.index, djinnIndex)"
            @change="toggleDjinn(elem.index, djinnIndex)"
            :class="ELEMENT_COLORS[elem.index].accent"
          >
          {{ djinnName }}
        </label>
      </div>
    </div>
  </div>
</template>
