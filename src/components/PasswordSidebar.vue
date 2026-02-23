<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { useGameDataStore } from '../stores/gameData';
import { PasswordType, ALPHABET, passwordToUrl, urlToPassword, validateChecksums } from '../codec';

const store = useGameDataStore();

const TOTAL_PAGES = 6;
const CHARS_PER_ROW = 10;
const ROWS_PER_PAGE = 5;
const CHARS_PER_PAGE = CHARS_PER_ROW * ROWS_PER_PAGE;

const VALID_CHARS = new Set(ALPHABET);

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

// --- Edit mode ---
const editMode = ref(false);
const editText = ref('');
const textareaRef = ref<HTMLTextAreaElement | null>(null);

/** Format raw password chars into rows with spaces and newlines.
 *  Blank line between pages (every 5 rows). Trailing whitespace at boundaries
 *  so cursor can skip over them. */
function formatRaw(raw: string): string {
  const rows: string[] = [];
  for (let i = 0; i < raw.length; i += CHARS_PER_ROW) {
    const row = raw.slice(i, i + CHARS_PER_ROW);
    if (row.length <= 5) {
      rows.push(row + (row.length === 5 ? ' ' : ''));
    } else {
      rows.push(row.slice(0, 5) + ' ' + row.slice(5));
    }
  }
  // Join rows with newlines, inserting blank line between pages
  const parts: string[] = [];
  for (let i = 0; i < rows.length; i++) {
    if (i > 0 && i % ROWS_PER_PAGE === 0) parts.push('');
    parts.push(rows[i]!);
  }
  let result = parts.join('\n');
  // Trailing newline when last row is complete, so cursor advances
  if (raw.length > 0 && raw.length % CHARS_PER_ROW === 0) {
    result += '\n';
  }
  return result;
}

/** Map a line index in formatted text to a checksum group index.
 *  Returns -1 for blank separator lines or trailing empty lines. */
function lineToGroup(lineIndex: number, lines: string[]): number {
  if (!lines[lineIndex]?.trim()) return -1; // blank or empty line
  let group = 0;
  for (let i = 0; i < lineIndex; i++) {
    if (lines[i]?.trim()) group++;
  }
  return group;
}

/** Strip formatting (spaces, newlines) to get raw password chars. */
function stripFormat(text: string): string {
  return text.replace(/[\s]/g, '');
}

/** Filter to only valid alphabet chars. */
function filterChars(raw: string): string {
  return [...raw].filter(ch => VALID_CHARS.has(ch)).join('');
}

function toggleEdit() {
  editMode.value = !editMode.value;
  if (editMode.value) {
    const formatted = formatRaw(store.generatedPassword);
    editText.value = formatted;
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.value = formatted;
        textareaRef.value.focus();
      }
    });
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Backspace') return;
  const ta = textareaRef.value;
  if (!ta || ta.selectionStart !== ta.selectionEnd) return; // let selection delete work normally
  const pos = ta.selectionStart;
  if (pos === 0) return;
  // If the char before cursor is whitespace, skip back to the real char and delete it
  const ch = ta.value[pos - 1]!;
  if (ch === ' ' || ch === '\n') {
    e.preventDefault();
    // Find the last raw char before this whitespace
    let deletePos = pos - 1;
    while (deletePos > 0 && (ta.value[deletePos - 1] === ' ' || ta.value[deletePos - 1] === '\n')) {
      deletePos--;
    }
    if (deletePos === 0) return;
    // Remove the real char at deletePos-1
    ta.value = ta.value.slice(0, deletePos - 1) + ta.value.slice(pos);
    ta.selectionStart = deletePos - 1;
    ta.selectionEnd = deletePos - 1;
    // Trigger the same reformat logic
    ta.dispatchEvent(new Event('input'));
  }
}

function onEditInput() {
  const ta = textareaRef.value;
  if (!ta) return;

  // Save cursor position relative to raw chars
  const selStart = ta.selectionStart;
  const beforeCursor = ta.value.slice(0, selStart);
  const rawBeforeCursor = filterChars(stripFormat(beforeCursor));
  const cursorRawPos = rawBeforeCursor.length;

  // Filter and reformat
  const raw = filterChars(stripFormat(ta.value));
  const formatted = formatRaw(raw);

  // Write directly to DOM (no v-model) so we can set cursor synchronously
  ta.value = formatted;
  editText.value = formatted; // keep ref in sync for backdrop + row count

  // Compute new cursor position: after the Nth raw char, skip trailing whitespace
  let rawCount = 0;
  let newCursorPos = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i]!;
    if (ch !== ' ' && ch !== '\n') {
      rawCount++;
      if (rawCount === cursorRawPos) {
        newCursorPos = i + 1;
        while (newCursorPos < formatted.length && (formatted[newCursorPos] === ' ' || formatted[newCursorPos] === '\n')) {
          newCursorPos++;
        }
        break;
      }
    }
  }
  ta.selectionStart = newCursorPos;
  ta.selectionEnd = newCursorPos;

  // Only attempt full decode when length matches a valid password type
  if (raw.length === 260 || raw.length === 61 || raw.length === 16) {
    store.decodePassword(raw);
  } else {
    store.decodeError = '';
    store.decodeErrorGroups = [];
  }
}

// Sync generated password → edit text when not in edit mode
watch(() => store.generatedPassword, (pw) => {
  if (!editMode.value) {
    history.replaceState(null, '', '#' + passwordToUrl(pw));
  }
});

// Also update URL when edit mode produces a successful decode
watch(() => store.lastValidPassword, (pw) => {
  if (editMode.value && pw) {
    history.replaceState(null, '', '#' + passwordToUrl(pw));
  }
});

// On mount: decode password from URL hash, or load Story Clear as default
onMounted(() => {
  const hash = window.location.hash.slice(1);
  store.decodePassword(hash ? urlToPassword(hash) : presets[0]!.password);
});

// --- Display mode (read-only) ---
// 5 rows of "XXXXX XXXXX" as a placeholder for consistent page height
const EMPTY_PAGE = Array(ROWS_PER_PAGE).fill('\u00A0'.repeat(11)).join('\n');

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

watch(() => store.generatedPassword, (pw) => {
  pages.value = formatPages(pw);
});

function onPaste(e: ClipboardEvent) {
  e.preventDefault();
  const text = e.clipboardData?.getData('text') ?? '';
  if (editMode.value) {
    const formatted = formatRaw(filterChars(text));
    editText.value = formatted;
    if (textareaRef.value) textareaRef.value.value = formatted;
    store.decodePassword(filterChars(text));
  } else {
    store.decodePassword(text);
  }
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
    if (editMode.value) {
      const raw = filterChars(stripFormat(text));
      const formatted = formatRaw(raw);
      editText.value = formatted;
      if (textareaRef.value) textareaRef.value.value = formatted;
      store.decodePassword(raw);
    } else {
      store.decodePassword(text);
    }
  } catch {
    store.decodeError = 'Paste failed — clipboard access requires HTTPS. Use Ctrl+V instead.';
  }
}

// --- Error row highlighting ---
// In edit mode: validate checksums live on partial input
// In display mode: use store errors from full decode
const errorLineSet = computed(() => {
  if (editMode.value) {
    const raw = stripFormat(editText.value);
    return new Set(validateChecksums(raw));
  }
  return new Set(store.decodeErrorGroups);
});

/** Build the backdrop HTML with error highlighting for edit mode. */
const editBackdropHtml = computed(() => {
  const lines = editText.value.split('\n');
  return lines.map((line, i) => {
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const content = escaped || '\u00A0'; // preserve empty line height
    const group = lineToGroup(i, lines);
    if (group >= 0 && errorLineSet.value.has(group)) {
      return `<span class="bg-red-900/50">${content}</span>`;
    }
    return `<span>${content}</span>`;
  }).join('\n');
});

/** Number of rows for the textarea to show (including blank separators). */
const textareaRows = computed(() => {
  const raw = stripFormat(editText.value);
  const dataRows = Math.ceil(raw.length / CHARS_PER_ROW) || 1;
  const pages = Math.ceil(dataRows / ROWS_PER_PAGE);
  const separators = Math.max(pages - 1, 0);
  // Round up to full page worth of data rows
  const totalDataRows = Math.max(pages * ROWS_PER_PAGE, ROWS_PER_PAGE);
  return totalDataRows + separators;
});
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

    <!-- Edit mode: single textarea with backdrop highlighting -->
    <div v-if="editMode" class="relative rounded border border-gray-700 bg-gray-900 p-2" @paste="onPaste">
      <!-- Backdrop layer for error highlighting -->
      <div
        class="absolute inset-0 p-2 text-xs font-mono leading-relaxed whitespace-pre text-transparent pointer-events-none overflow-hidden"
        v-html="editBackdropHtml"
      />
      <!-- Editable textarea (unbound — managed via DOM ref to control cursor) -->
      <textarea
        ref="textareaRef"
        @keydown="onKeydown"
        @input="onEditInput"
        :rows="textareaRows"
        class="relative w-full bg-transparent text-xs font-mono leading-relaxed whitespace-pre text-amber-50 outline-none resize-none caret-amber-400"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
      />
    </div>

    <!-- Display mode: 6-page grid (read-only) -->
    <div
      v-else
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
      <button
        @click="toggleEdit"
        class="rounded border px-3 py-1.5 text-sm transition-colors"
        :class="editMode
          ? 'border-amber-500 bg-amber-900/40 text-amber-200'
          : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'"
      >Edit</button>
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
