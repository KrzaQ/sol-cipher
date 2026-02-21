import type { GameData } from './types';
import type { PasswordType } from './constants';
import {
  PasswordType as PT,
  SPECIAL_ITEM_IDS,
  QUANTITY_ITEM_IDS,
} from './constants';
import { createEmptyGameData } from './gamedata';

/**
 * Deserialize a byte buffer into game data. Direct port of PasswordObj_DeserializeGameData.
 */
export function deserializeGameData(buf: Uint8Array, pwType: PasswordType): GameData {
  const gd = createEmptyGameData();

  // --- Unpack levels: 28 bits from bytes 0-3 ---
  const levelsPacked =
    ((buf[3]! & 0xF0) << 20)
    | (buf[2]! << 16)
    | (buf[1]! << 8)
    | buf[0]!;
  for (let i = 0; i < 4; i++) {
    gd.characters[i]!.level = (levelsPacked >> (7 * i)) & 0x7F;
  }

  // --- Unpack djinn: 28 bits from bytes 3-6 ---
  const djinnPacked =
    (buf[6]! << 20)
    | (buf[5]! << 12)
    | (buf[4]! << 4)
    | (buf[3]! & 0x0F);
  for (let i = 0; i < 4; i++) {
    gd.djinn[i] = (djinnPacked >> (7 * i)) & 0x7F;
  }

  // --- Unpack flags: 6 bits from byte 7 ---
  gd.flags = buf[7]! & 0x3F;

  // --- Unpack special items (Silver/Bronze: byte 8) ---
  if (pwType === PT.Silver || pwType === PT.Bronze) {
    gd.specialItems = buf[8]!;
    let slotIdx = 0;
    for (let bit = 0; bit < 8; bit++) {
      if ((buf[8]! >> bit) & 1) {
        gd.items[0]![slotIdx]!.itemId = SPECIAL_ITEM_IDS[bit]!;
        slotIdx += 1;
      }
    }
  }

  if (pwType === PT.Bronze) {
    return gd;
  }

  // --- Unpack character stats (Silver/Gold): 2 pairs × 15 bytes ---
  let base = pwType === PT.Gold ? 8 : 9;
  for (let pair = 0; pair < 2; pair++) {
    // Character 1 of pair
    const w0 = (buf[base]! << 24) | (buf[base + 1]! << 16) | (buf[base + 2]! << 8) | buf[base + 3]!;
    const ch = pair * 2;
    gd.characters[ch]!.attack = w0 & 0x3FF;
    gd.characters[ch]!.ppMax = (w0 >> 10) & 0x7FF;
    gd.characters[ch]!.hpMax = (w0 >> 21) & 0x7FF;

    const w1 =
      (buf[base + 4]! << 24)
      | (buf[base + 5]! << 16)
      | (buf[base + 6]! << 8)
      | (buf[base + 7]! & 0xF0);
    gd.characters[ch]!.luck = (w1 >> 4) & 0x7F;
    gd.characters[ch]!.agility = (w1 >> 12) & 0x3FF;
    gd.characters[ch]!.defense = (w1 >> 22) & 0x3FF;

    // Character 2 of pair
    const w2 =
      ((buf[base + 7]! & 0x0F) << 28)
      | (buf[base + 8]! << 20)
      | (buf[base + 9]! << 12)
      | (buf[base + 10]! << 4)
      | (buf[base + 11]! >> 4);
    const ch2 = pair * 2 + 1;
    gd.characters[ch2]!.attack = w2 & 0x3FF;
    gd.characters[ch2]!.ppMax = (w2 >> 10) & 0x7FF;
    gd.characters[ch2]!.hpMax = (w2 >> 21) & 0x7FF;

    const w3 =
      ((buf[base + 11]! & 0x0F) << 28)
      | (buf[base + 12]! << 20)
      | (buf[base + 13]! << 12)
      | (buf[base + 14]! << 4);
    gd.characters[ch2]!.luck = (w3 >> 4) & 0x7F;
    gd.characters[ch2]!.agility = (w3 >> 12) & 0x3FF;
    gd.characters[ch2]!.defense = (w3 >> 22) & 0x3FF;

    base += 15;
  }

  if (pwType === PT.Silver) {
    return gd;
  }

  // --- Unpack item IDs (Gold: 4 chars × 15 slots × 9 bits) ---
  let bytePos = 39;
  let bitShift = 0;
  let mask = 0xFF80;
  for (let charIdx = 0; charIdx < 4; charIdx++) {
    for (let slot = 0; slot < 15; slot++) {
      const wordVal = (buf[bytePos]! << 8) | buf[bytePos + 1]!;
      const itemId = (mask & wordVal) >> (7 - bitShift);
      gd.items[charIdx]![slot]!.itemId = itemId;

      bytePos += 1;
      bitShift += 1;
      mask >>= 1;
      if (bitShift === 7) {
        bitShift = 0;
        mask = 0xFF80;
        bytePos += 1;
      }
    }
  }

  // --- Unpack item quantities (Gold: 4 × 23 × 5 bits) ---
  bytePos = 107;
  let bitAvail = 4;
  mask = 0x0F80;
  for (let charIdx = 0; charIdx < 4; charIdx++) {
    for (let qtyIdx = 0; qtyIdx < 23; qtyIdx++) {
      const qtyItemId = QUANTITY_ITEM_IDS[qtyIdx]!;

      // Find which inventory slot has this item
      let targetSlot: number | null = null;
      for (let slot = 0; slot < 15; slot++) {
        if (gd.items[charIdx]![slot]!.itemId === qtyItemId) {
          targetSlot = slot;
        }
      }

      // Read 5-bit quantity from bitstream
      const wordVal = (buf[bytePos]! << 8) | buf[bytePos + 1]!;
      const qty = (mask & wordVal) >> (11 - bitAvail);

      bitAvail += 5;
      mask >>= 5;
      if (bitAvail > 7) {
        bitAvail -= 8;
        mask <<= 8;
        if (mask === 0x0F00) {
          mask = 0x0F80;
        }
        bytePos += 1;
      }

      if (targetSlot !== null) {
        gd.items[charIdx]![targetSlot]!.quantity = qty + 1;
      }
    }
  }

  // --- Unpack coins (3 bytes big-endian) ---
  gd.coins = (buf[165]! << 16) | (buf[166]! << 8) | buf[167]!;

  return gd;
}
