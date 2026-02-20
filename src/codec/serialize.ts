import type { GameData } from './types';
import type { PasswordType } from './constants';
import {
  PasswordType as PT,
  PASSWORD_DATA_SIZES,
  QUANTITY_ITEM_IDS,
} from './constants';
import { clamp } from './gamedata';

/**
 * Serialize game data into a byte buffer. Direct port of PasswordObj_SerializeGameData.
 * Does NOT mutate the input GameData — clamps on internal copies.
 */
export function serializeGameData(gd: GameData, pwType: PasswordType): Uint8Array {
  const bufLen = PASSWORD_DATA_SIZES[pwType];
  const buf = new Uint8Array(bufLen);

  // --- Clamp values on copies ---
  const chars = gd.characters.map(ch => ({
    level: clamp(ch.level, 1, 99),
    hpMax: clamp(ch.hpMax, 0, 1999),
    ppMax: clamp(ch.ppMax, 0, 1999),
    attack: clamp(ch.attack, 0, 999),
    defense: clamp(ch.defense, 0, 999),
    agility: clamp(ch.agility, 0, 999),
    luck: clamp(ch.luck, 0, 99),
  }));

  // --- Pack per-character stats into 32-bit words ---
  // 4 characters × 2 DWORDs each = 8 DWORDs
  const statWords: number[] = [];
  for (const ch of chars) {
    // DWORD 0: attack(10) | pp_max(11) << 10 | hp_max(11) << 21
    const w0 = (ch.attack | (ch.ppMax << 10) | (ch.hpMax << 21)) >>> 0;
    // DWORD 1: luck(7) << 4 | agility(10) << 12 | defense(10) << 22
    const w1 = ((ch.luck << 4) | (ch.agility << 12) | (ch.defense << 22)) >>> 0;
    statWords.push(w0, w1);
  }

  // --- Pack levels: 4 × 7 bits ---
  let levelsPacked = 0;
  for (let j = 0; j < 4; j++) {
    levelsPacked |= chars[j]!.level << (7 * j);
  }

  // --- Pack djinn: 4 × 7 bits ---
  let djinnPacked = 0;
  for (let k = 0; k < 4; k++) {
    djinnPacked |= (gd.djinn[k]! & 0x7F) << (7 * k);
  }

  // --- Pack flags: 6 bits ---
  const flags = gd.flags & 0x3F;

  // --- Pack special item presence: 8 bits ---
  const specialItems = gd.specialItems & 0xFF;

  // ===== GOLD ONLY (type 0): Full item data =====
  if (pwType === PT.Gold) {
    // Pack all item IDs: 4 chars × 15 slots × 9 bits
    let bytePos = 39;
    let bitShift = 0;
    for (let charIdx = 0; charIdx < 4; charIdx++) {
      for (let slot = 0; slot < 15; slot++) {
        const itemId = gd.items[charIdx]![slot]!.itemId & 0x1FF;
        buf[bytePos]! += itemId >> (bitShift + 1);
        buf[bytePos + 1]! += (itemId << (7 - bitShift)) & 0xFF;
        bytePos += 1;
        bitShift += 1;
        if (bitShift === 7) {
          bitShift = 0;
          bytePos += 1;
        }
      }
    }

    // Pack item quantities for 23 consumables: 5 bits each
    bytePos = 107;
    let bitAvail = -1;
    for (let charIdx = 0; charIdx < 4; charIdx++) {
      for (const qtyItemId of QUANTITY_ITEM_IDS) {
        // Find quantity of this item in character's inventory
        let qty = 0;
        for (let slot = 0; slot < 15; slot++) {
          if ((gd.items[charIdx]![slot]!.itemId & 0x1FF) === qtyItemId) {
            qty = gd.items[charIdx]![slot]!.quantity & 0x1F;
          }
        }
        // Pack 5-bit quantity into bitstream
        if (bitAvail < 0) {
          buf[bytePos] = buf[bytePos]! + (qty >> (-bitAvail));
          bytePos += 1;
          bitAvail += 8;
        }
        buf[bytePos] = ((qty << bitAvail) + buf[bytePos]!) & 0xFF;
        bitAvail -= 5;
        if (bitAvail === -5) {
          bytePos += 1;
          bitAvail = 3;
        }
      }
    }

    // Coins (3 bytes big-endian)
    buf[165] = (gd.coins >> 16) & 0xFF;
    buf[166] = (gd.coins >> 8) & 0xFF;
    buf[167] = gd.coins & 0xFF;
  }

  // ===== GOLD + SILVER (types 0, 1): Character stats =====
  if (pwType !== PT.Bronze) {
    let base = pwType === PT.Gold ? 8 : 9;
    for (let pair = 0; pair < 2; pair++) {
      const w = statWords.slice(pair * 4, pair * 4 + 4);
      // Write w[0] as 4 bytes big-endian
      buf[base + 0] = (w[0]! >>> 24) & 0xFF;
      buf[base + 1] = (w[0]! >>> 16) & 0xFF;
      buf[base + 2] = (w[0]! >>> 8) & 0xFF;
      buf[base + 3] = w[0]! & 0xFF;
      // Write w[1] as 4 bytes big-endian
      buf[base + 4] = (w[1]! >>> 24) & 0xFF;
      buf[base + 5] = (w[1]! >>> 16) & 0xFF;
      buf[base + 6] = (w[1]! >>> 8) & 0xFF;
      buf[base + 7] = w[1]! & 0xFF;
      // Write w[2] — packed with overlap into w[1]'s last byte
      buf[base + 7] = (buf[base + 7]! & 0xFF) | ((w[2]! >>> 28) & 0x0F);
      buf[base + 8] = (w[2]! >>> 20) & 0xFF;
      buf[base + 9] = (w[2]! >>> 12) & 0xFF;
      buf[base + 10] = (w[2]! >>> 4) & 0xFF;
      buf[base + 11] = (w[2]! << 4) & 0xF0;
      // Write w[3] — packed with overlap
      buf[base + 11] = (buf[base + 11]! & 0xF0) | ((w[3]! >>> 28) & 0x0F);
      buf[base + 12] = (w[3]! >>> 20) & 0xFF;
      buf[base + 13] = (w[3]! >>> 12) & 0xFF;
      buf[base + 14] = (w[3]! >>> 4) & 0xFF;
      base += 15;
    }
  }

  // ===== HEADER (all types): bytes 0-8 =====
  // Levels: 28 bits across bytes 0-3
  buf[0] = levelsPacked & 0xFF;
  buf[1] = (levelsPacked >> 8) & 0xFF;
  buf[2] = (levelsPacked >> 16) & 0xFF;
  buf[3] = ((levelsPacked >> 20) & 0xF0) | (djinnPacked & 0x0F);
  // Djinn: 28 bits across bytes 3-6
  buf[4] = (djinnPacked >> 4) & 0xFF;
  buf[5] = (djinnPacked >> 12) & 0xFF;
  buf[6] = (djinnPacked >> 20) & 0xFF;
  // Flags
  buf[7] = flags;
  // Special items (Silver/Bronze only — Gold has full item list)
  if (pwType !== PT.Gold) {
    buf[8] = specialItems;
  }

  return buf;
}
