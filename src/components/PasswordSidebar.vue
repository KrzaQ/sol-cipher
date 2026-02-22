<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import { PasswordType, passwordToUrl, urlToPassword } from '../codec';

const store = useGameDataStore();

const TOTAL_PAGES = 6;
const CHARS_PER_ROW = 10;
const ROWS_PER_PAGE = 5;
const CHARS_PER_PAGE = CHARS_PER_ROW * ROWS_PER_PAGE;

const presets = [
  { name: 'Story Clear', password: 'n389#mrtcQwF$LXdxuZLH4HK+httqmDejh3A6K?dQUeabkwahRDFx$9BP7Pf%C#MyZnDip6T!kF&zi#7nkikf+Pq2Dv?jZi8xG&%##MA++REG3pVRcK2vD74fQdMPYWWfy533j9NzubAicZ&DL8S#YGrWFUpdvvMF#!!K+$$PaDBBV?XFSM5LL5SQQ9WUfVe3ZZi755qpcaatUeexwmjj#rpp+vGuuD!y$h$&wMNB==SFDDgXSJJ5t727!VTTcZWhgUy' },
  { name: 'Completionist', password: 'r#aG$NHze8X7L!kN=z4RdePggG&9W3jiJRE8xbG5Rjsk9ENVb4%qRE+3HyfNPSG5fAnrdgLU$7Kpm9Dpss6HkZJFH%WghP23dDQi2&Z=euY$xMU?VS76Tt7&956HcxgY#R+&WF7sp7#!Le2WJ3zMgiS7yDZYG77JD3auH7eyM6cj&PA%=Lk2uE3ryJhV#xPc!=Tg$D2jmBJ4LRN8vjLTd!QXh$UdNNBZ8cf5bYPLah?Qem%gVsaCW6=75tu?May%+euu' },
  { name: 'Ultimate', password: 'SrA$L%wUkZ+K3rCx5VNXCZiXGaEVkChBT=rF2Mtxkd2p+m6y4NkB%ZhWnXR9td8m$ku?xiLTbwp4rPw6haLz5ZZeqJ7wnXjC+?AK88hs?xx%#uGMZqrrXQDRUFNzA9m3rT&Kt&VRH4iswa9?FNg&tW&V?q8gd5cQ%ivZBnz5F2t$aLxAeQ?NFjV+KpZCPau6HUyaMY#PfS5=jW9DdyN%ZHpihCb5pT&gtX=kxJ3kcVpav+cPP!DhUiRCXwBNs4FUv8CY' },
];

function loadPreset(password: string) {
  store.decodePassword(password);
}

const typeOptions = [
  { value: PasswordType.Gold, label: 'Gold (260 chars)', selected: 'bg-amber-900/40 border-amber-500 text-amber-200', unselected: 'border-gray-700 text-gray-500 hover:border-gray-600' },
  { value: PasswordType.Silver, label: 'Silver (61 chars)', selected: 'bg-gray-700/40 border-gray-400 text-gray-200', unselected: 'border-gray-700 text-gray-500 hover:border-gray-600' },
  { value: PasswordType.Bronze, label: 'Bronze (16 chars)', selected: 'bg-orange-900/40 border-orange-700 text-orange-200', unselected: 'border-gray-700 text-gray-500 hover:border-gray-600' },
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

function formatForCopy(raw: string): string {
  const lines: string[] = [];
  for (let i = 0; i < raw.length; i += CHARS_PER_ROW) {
    const row = raw.slice(i, i + CHARS_PER_ROW);
    lines.push(row.slice(0, 5) + ' ' + row.slice(5));
    if ((lines.length % ROWS_PER_PAGE) === 0 && i + CHARS_PER_ROW < raw.length) {
      lines.push('');
    }
  }
  return lines.join('\n');
}

async function onCopy() {
  const text = formatForCopy(store.generatedPassword);
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for non-HTTPS contexts
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }
}

async function onPasteButton() {
  try {
    const text = await navigator.clipboard.readText();
    store.decodePassword(text);
  } catch {
    // Clipboard read requires HTTPS + permission; no good fallback
    store.decodeError = 'Paste failed — clipboard access requires HTTPS. Use Ctrl+V instead.';
  }
}
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-lg font-bold text-amber-50" style="font-family: 'Cinzel Decorative', serif">Password</h2>

    <fieldset class="space-y-1">
      <label
        v-for="opt in typeOptions"
        :key="opt.value"
        class="block rounded border px-3 py-1.5 text-sm cursor-pointer transition-colors"
        :class="store.passwordType === opt.value ? opt.selected : opt.unselected"
      >
        <input
          type="radio"
          :value="opt.value"
          v-model="store.passwordType"
          class="sr-only"
        >
        {{ opt.label }}
      </label>
    </fieldset>

    <div
      class="grid grid-cols-2 grid-flow-col grid-rows-3 gap-1 rounded border border-gray-700 bg-gray-900 p-2"
      @paste="onPaste"
      tabindex="0"
    >
      <div
        v-for="(page, i) in pages"
        :key="i"
        class="rounded px-1.5 py-1 text-xs font-mono leading-relaxed whitespace-pre select-text"
        :class="i < activePages
          ? 'bg-gray-800 text-amber-50'
          : 'bg-gray-800/40 text-gray-600'"
      >
        <span class="text-[10px] font-sans text-gray-500 block mb-0.5">{{ i + 1 }}</span><span v-text="page"></span>
      </div>
    </div>

    <div class="flex gap-2">
      <button
        @click="onCopy"
        class="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 active:bg-gray-600"
      >Copy</button>
      <button
        @click="onPasteButton"
        class="flex-1 rounded border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 active:bg-gray-600"
      >Paste</button>
    </div>

    <p
      v-if="store.decodeError"
      class="text-sm text-red-400 whitespace-pre-line"
    >{{ store.decodeError }}</p>

    <hr class="border-gray-700/50">

    <div class="space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-gray-500">Presets</p>
      <button
        v-for="preset in presets"
        :key="preset.name"
        @click="loadPreset(preset.password)"
        class="block w-full rounded border border-gray-700 bg-gray-800 px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 active:bg-gray-600"
      >{{ preset.name }}</button>
    </div>
  </div>
</template>
