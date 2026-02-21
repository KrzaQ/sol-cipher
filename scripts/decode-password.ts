#!/usr/bin/env npx tsx
/**
 * Decode a Golden Sun password and display all fields in human-readable format.
 *
 * Usage:
 *   npx tsx scripts/decode-password.ts <password>
 *   npx tsx scripts/decode-password.ts --type gold <password>
 *   echo "<password>" | npx tsx scripts/decode-password.ts
 */

import { decode } from '../src/codec/codec';
import { PasswordType, CHARACTER_NAMES, DJINN_NAMES, Element, EVENT_FLAGS, DJINN_PER_ELEMENT } from '../src/codec/constants';
import { GS1_ITEMS, TLA_ITEMS } from '../src/codec/items';

function itemName(id: number): string {
  const gs1 = GS1_ITEMS.get(id);
  const tla = TLA_ITEMS.get(id);
  if (gs1 && tla && gs1 !== tla) return `${gs1} (TLA: ${tla})`;
  if (gs1) return gs1;
  if (tla) return `${tla} [TLA]`;
  return `Unknown(0x${id.toString(16).padStart(4, '0')})`;
}

const ELEMENT_NAMES: Record<number, string> = {
  [Element.Venus]: 'Venus',
  [Element.Mercury]: 'Mercury',
  [Element.Mars]: 'Mars',
  [Element.Jupiter]: 'Jupiter',
};

const TYPE_NAMES: Record<number, string> = {
  [PasswordType.Gold]: 'Gold',
  [PasswordType.Silver]: 'Silver',
  [PasswordType.Bronze]: 'Bronze',
};

function formatPassword(pw: string, charsPerGroup: number = 5, groupsPerLine: number = 2): string {
  const lines: string[] = [];
  let pos = 0;
  while (pos < pw.length) {
    const groups: string[] = [];
    for (let g = 0; g < groupsPerLine && pos < pw.length; g++) {
      groups.push(pw.slice(pos, pos + charsPerGroup));
      pos += charsPerGroup;
    }
    lines.push(groups.join(' '));
  }
  return lines.join('\n');
}

// --- Parse args ---
let passwordInput = '';
let forceType: PasswordType | undefined;

const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  const arg = args[i]!;
  if (arg === '--type' || arg === '-t') {
    const typeStr = args[++i]?.toLowerCase();
    if (typeStr === 'gold') forceType = PasswordType.Gold;
    else if (typeStr === 'silver') forceType = PasswordType.Silver;
    else if (typeStr === 'bronze') forceType = PasswordType.Bronze;
    else { console.error(`Unknown type: ${typeStr}`); process.exit(1); }
  } else {
    passwordInput += arg;
  }
}

// Read from stdin if no password arg
if (!passwordInput) {
  const fs = await import('fs');
  passwordInput = fs.readFileSync('/dev/stdin', 'utf-8').trim();
}

if (!passwordInput) {
  console.error('Usage: npx tsx scripts/decode-password.ts [--type gold|silver|bronze] <password>');
  process.exit(1);
}

// Strip whitespace
const cleaned = passwordInput.replace(/\s/g, '');

// --- Decode ---
const result = decode(cleaned, forceType);

if (!result.ok) {
  console.error(`Decode failed: ${result.error}`);
  process.exit(1);
}

const { data: gd, passwordType: pwType } = result;

// --- Display ---
console.log(`\n${'='.repeat(60)}`);
console.log(`  Password Type: ${TYPE_NAMES[pwType]} (${cleaned.length} characters)`);
console.log(`${'='.repeat(60)}`);

console.log(`\nPassword:\n${formatPassword(cleaned)}`);

// Characters
console.log(`\n--- Characters ---`);
for (let i = 0; i < 4; i++) {
  const ch = gd.characters[i]!;
  const name = CHARACTER_NAMES[i]!;
  console.log(`\n  ${name} (Level ${ch.level})`);
  if (pwType !== PasswordType.Bronze) {
    console.log(`    HP: ${ch.hpMax}  PP: ${ch.ppMax}`);
    console.log(`    Attack: ${ch.attack}  Defense: ${ch.defense}  Agility: ${ch.agility}  Luck: ${ch.luck}`);
  }
}

// Djinn
console.log(`\n--- Djinn ---`);
for (let e = 0; e < 4; e++) {
  const bits = gd.djinn[e]!;
  const elemName = ELEMENT_NAMES[e]!;
  const names = DJINN_NAMES[e as Element]!;
  const collected: string[] = [];
  const missing: string[] = [];
  for (let j = 0; j < DJINN_PER_ELEMENT; j++) {
    if ((bits >> j) & 1) {
      collected.push(names[j]!);
    } else {
      missing.push(names[j]!);
    }
  }
  const countStr = `${collected.length}/${DJINN_PER_ELEMENT}`;
  if (missing.length === 0) {
    console.log(`  ${elemName} (${countStr}): ALL`);
  } else {
    console.log(`  ${elemName} (${countStr}): ${collected.join(', ')}`);
    console.log(`    Missing: ${missing.join(', ')}`);
  }
}

// Event Flags
console.log(`\n--- Event Flags (0x${gd.flags.toString(16).padStart(2, '0')}) ---`);
for (let f = 0; f < EVENT_FLAGS.length; f++) {
  const flag = EVENT_FLAGS[f]!;
  const set = (gd.flags >> f) & 1;
  console.log(`  [${set ? 'X' : ' '}] ${flag.name} — ${flag.description}`);
}

// Special Items (Silver/Bronze only)
if (pwType !== PasswordType.Gold) {
  console.log(`\n--- Special Items (0x${gd.specialItems.toString(16).padStart(2, '0')}) ---`);
  const SPECIAL_IDS = [0xC8, 0xC9, 0xCA, 0xCB, 0xCC, 0xCD, 0xCE, 0xCF];
  for (let b = 0; b < 8; b++) {
    const set = (gd.specialItems >> b) & 1;
    console.log(`  [${set ? 'X' : ' '}] ${itemName(SPECIAL_IDS[b]!)}`);
  }
}

// Items (Gold only)
if (pwType === PasswordType.Gold) {
  console.log(`\n--- Items ---`);
  for (let ci = 0; ci < 4; ci++) {
    const name = CHARACTER_NAMES[ci]!;
    const slots = gd.items[ci]!;
    console.log(`\n  ${name}:`);
    for (let s = 0; s < 15; s++) {
      const slot = slots[s]!;
      if (slot.itemId === 0) {
        console.log(`    ${(s + 1).toString().padStart(2)}. (empty)`);
      } else {
        const qtyStr = slot.quantity > 1 ? ` x${slot.quantity}` : '';
        console.log(`    ${(s + 1).toString().padStart(2)}. ${itemName(slot.itemId)}${qtyStr}`);
      }
    }
  }

  console.log(`\n--- Coins ---`);
  console.log(`  ${gd.coins.toLocaleString()}`);
}

console.log('');
