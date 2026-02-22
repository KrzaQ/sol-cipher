<script setup lang="ts">
import { useGameDataStore } from '../stores/gameData';
import { CHARACTER_NAMES, STAT_DEFINITIONS, clamp } from '../codec';
import type { CharacterStats } from '../codec';
import { CHAR_COLORS } from '../elementColors';

const store = useGameDataStore();

const STAT_LABELS: Record<keyof CharacterStats, string> = {
  level: 'Level',
  hpMax: 'HP',
  ppMax: 'PP',
  attack: 'Attack',
  defense: 'Defense',
  agility: 'Agility',
  luck: 'Luck',
};

function onStatInput(charIndex: number, key: keyof CharacterStats, min: number, max: number, event: Event) {
  const raw = (event.target as HTMLInputElement).value;
  const parsed = parseInt(raw, 10);
  const value = Number.isNaN(parsed) ? min : clamp(parsed, min, max);
  store.setCharacterStat(charIndex, key, value);
}
</script>

<template>
  <div class="grid grid-cols-4 gap-2">
    <div v-for="(name, charIndex) in CHARACTER_NAMES" :key="name" class="rounded-lg p-2 border border-gray-800 bg-gray-900/50">
      <h3 class="text-sm font-semibold mb-2" :class="CHAR_COLORS[charIndex]!.heading">{{ name }}</h3>
      <div class="space-y-1">
        <div v-for="stat in STAT_DEFINITIONS" :key="stat.key" class="flex items-center gap-1">
          <label class="w-12 text-xs text-gray-400 shrink-0">{{ STAT_LABELS[stat.key] }}</label>
          <input
            type="number"
            :min="stat.min"
            :max="stat.max"
            :value="store.gameData.characters[charIndex]![stat.key]"
            @change="onStatInput(charIndex, stat.key, stat.min, stat.max, $event)"
            class="w-3/4 rounded border border-gray-700 bg-gray-800 text-amber-50 px-1.5 py-0.5 text-sm text-right tabular-nums focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
        </div>
      </div>
    </div>
  </div>
</template>
