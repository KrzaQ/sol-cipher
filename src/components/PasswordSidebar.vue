<script setup lang="ts">
import { ref, watch } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import { PasswordType } from '../codec';

const store = useGameDataStore();
const passwordText = ref('');

const presets = ['Story Clear', 'Completionist', 'Debug'];

const typeOptions = [
  { value: PasswordType.Gold, label: 'Gold (260 chars)' },
  { value: PasswordType.Silver, label: 'Silver (61 chars)' },
  { value: PasswordType.Bronze, label: 'Bronze (16 chars)' },
] as const;

watch(() => store.generatedPassword, (pw) => {
  passwordText.value = pw;
});

function generate() {
  store.generatePassword();
  passwordText.value = store.generatedPassword;
}

function decodeInput() {
  store.decodePassword(passwordText.value);
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800">Password</h2>

    <fieldset class="space-y-1">
      <label
        v-for="opt in typeOptions"
        :key="opt.value"
        class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
      >
        <input
          type="radio"
          :value="opt.value"
          v-model="store.passwordType"
          class="accent-amber-600"
        >
        {{ opt.label }}
      </label>
    </fieldset>

    <textarea
      v-model="passwordText"
      rows="6"
      placeholder="Paste a password to decode, or click Generate..."
      class="w-full rounded border border-gray-300 bg-white p-2 text-sm font-mono resize-y focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
    />

    <div class="flex gap-2">
      <button
        @click="generate"
        class="flex-1 rounded bg-amber-600 px-3 py-2 text-sm font-medium text-white hover:bg-amber-700 active:bg-amber-800"
      >Generate</button>
      <button
        @click="decodeInput"
        class="flex-1 rounded bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:bg-indigo-800"
      >Decode</button>
    </div>

    <p
      v-if="store.decodeError"
      class="text-sm text-red-600 whitespace-pre-line"
    >{{ store.decodeError }}</p>

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
