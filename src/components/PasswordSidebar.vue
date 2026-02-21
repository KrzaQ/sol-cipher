<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import { PasswordType, PASSWORD_CHAR_COUNTS, passwordToUrl, urlToPassword } from '../codec';

const store = useGameDataStore();
const passwordText = ref('');

const VALID_LENGTHS = new Set(Object.values(PASSWORD_CHAR_COUNTS));

const presets = ['Story Clear', 'Completionist', 'Debug'];

const typeOptions = [
  { value: PasswordType.Gold, label: 'Gold (260 chars)' },
  { value: PasswordType.Silver, label: 'Silver (61 chars)' },
  { value: PasswordType.Bronze, label: 'Bronze (16 chars)' },
] as const;

// Reactive encode: state → password
watch(
  () => [store.gameData, store.passwordType],
  () => store.generatePassword(),
  { deep: true, immediate: true },
);

function formatPassword(raw: string): string {
  const ROWS_PER_PAGE = 5;
  const CHARS_PER_ROW = 10;
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i];
    const pos = i + 1;
    if (pos % CHARS_PER_ROW === 0) {
      result += '\n';
      if (pos % (CHARS_PER_ROW * ROWS_PER_PAGE) === 0 && pos < raw.length) {
        result += '\n';
      }
    } else if (pos % 5 === 0) {
      result += ' ';
    }
  }
  return result;
}

// Sync generated password → textarea (formatted) and update URL hash
watch(() => store.generatedPassword, (pw) => {
  passwordText.value = formatPassword(pw);
  history.replaceState(null, '', '#' + passwordToUrl(pw));
});

// On mount: decode password from URL hash if present
onMounted(() => {
  const hash = window.location.hash.slice(1);
  if (hash) {
    store.decodePassword(urlToPassword(hash));
  }
});

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') ?? '';
  store.decodePassword(text);
}

function onInput(e: Event) {
  const raw = (e.target as HTMLTextAreaElement).value;
  passwordText.value = raw;
  const stripped = raw.replace(/\s/g, '');
  if (VALID_LENGTHS.has(stripped.length)) {
    store.decodePassword(stripped);
  }
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
      :value="passwordText"
      @input="onInput"
      @paste="onPaste"
      rows="14"
      placeholder="Paste or type a password..."
      class="w-full rounded border border-gray-300 bg-white p-2 text-sm font-mono resize-y focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
    />

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
