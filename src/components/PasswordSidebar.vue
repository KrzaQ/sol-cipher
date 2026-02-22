<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import { PasswordType, PASSWORD_CHAR_COUNTS, passwordToUrl, urlToPassword } from '../codec';

const store = useGameDataStore();

const TOTAL_PAGES = 6;
const CHARS_PER_ROW = 10;
const ROWS_PER_PAGE = 5;
const CHARS_PER_PAGE = CHARS_PER_ROW * ROWS_PER_PAGE;

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

// 5 rows of "XXXXX XXXXX" as a placeholder for consistent page height
const EMPTY_PAGE = Array(ROWS_PER_PAGE).fill('\u00A0'.repeat(11)).join('\n');

/** Split raw password into 6 pages of formatted rows. */
function formatPages(raw: string): string[] {
  const pages: string[] = [];
  for (let p = 0; p < TOTAL_PAGES; p++) {
    const pageChars = raw.slice(p * CHARS_PER_PAGE, (p + 1) * CHARS_PER_PAGE);
    if (!pageChars.length) {
      pages.push(EMPTY_PAGE);
      continue;
    }
    const rows: string[] = [];
    for (let r = 0; r < ROWS_PER_PAGE; r++) {
      const rowChars = pageChars.slice(r * CHARS_PER_ROW, (r + 1) * CHARS_PER_ROW);
      if (!rowChars.length) {
        rows.push('\u00A0'.repeat(11));
        continue;
      }
      rows.push(rowChars.slice(0, 5) + ' ' + rowChars.slice(5));
    }
    pages.push(rows.join('\n'));
  }
  return pages;
}

const pages = ref<string[]>(Array(TOTAL_PAGES).fill(''));

const activePages = computed(() => {
  const charCount = store.generatedPassword.length;
  return Math.ceil(charCount / CHARS_PER_PAGE);
});

// Sync generated password → pages display and update URL hash
watch(() => store.generatedPassword, (pw) => {
  pages.value = formatPages(pw);
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

async function onCopy() {
  await navigator.clipboard.writeText(store.generatedPassword);
}

async function onPasteButton() {
  const text = await navigator.clipboard.readText();
  store.decodePassword(text);
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

    <div
      class="grid grid-cols-2 grid-flow-col grid-rows-3 gap-1 rounded border border-gray-300 bg-gray-50 p-2"
      @paste="onPaste"
      tabindex="0"
    >
      <div
        v-for="(page, i) in pages"
        :key="i"
        class="rounded px-1.5 py-1 text-xs font-mono leading-relaxed whitespace-pre select-text"
        :class="i < activePages
          ? 'bg-white text-gray-800'
          : 'bg-gray-100 text-gray-300'"
      >
        <span class="text-[10px] font-sans text-gray-400 block mb-0.5">{{ i + 1 }}</span><span v-text="page"></span>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="onCopy"
        class="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
      >Copy</button>
      <button
        @click="onPasteButton"
        class="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100"
      >Paste</button>
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
