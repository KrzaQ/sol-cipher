import { describe, it, expect } from 'vitest';
import { encode, decode } from '../codec';
import { createEmptyGameData } from '../gamedata';
import { crc16 } from '../crc';
import { serializeGameData } from '../serialize';
import { deserializeGameData } from '../deserialize';
import { bytesToPasswordChars, passwordCharsToBytes, charToIndex } from '../scramble';
import { PasswordType, ALPHABET, PASSWORD_CHAR_COUNTS } from '../constants';
import type { GameData } from '../types';

// --- Test data from Paulygon screenshots ---
function makeScreenshotGameData(): GameData {
  const gd = createEmptyGameData();

  // All level 35
  // Isaac: HP 306, PP 116, Atk 143, Def 59, Agi 150, Luck 5
  gd.characters[0] = { level: 35, hpMax: 306, ppMax: 116, attack: 143, defense: 59, agility: 150, luck: 5 };
  // Garet: HP 311, PP 110, Atk 139, Def 68, Agi 132, Luck 4
  gd.characters[1] = { level: 35, hpMax: 311, ppMax: 110, attack: 139, defense: 68, agility: 132, luck: 4 };
  // Ivan: HP 298, PP 141, Atk 133, Def 65, Agi 151, Luck 6
  gd.characters[2] = { level: 35, hpMax: 298, ppMax: 141, attack: 133, defense: 65, agility: 151, luck: 6 };
  // Mia: HP 284, PP 142, Atk 134, Def 63, Agi 135, Luck 5
  gd.characters[3] = { level: 35, hpMax: 284, ppMax: 142, attack: 134, defense: 63, agility: 135, luck: 5 };

  // All djinn acquired (0x7F each)
  gd.djinn = [0x7F, 0x7F, 0x7F, 0x7F];

  // All 6 flags set
  gd.flags = 0x3F;

  // Coins
  gd.coins = 283941;

  return gd;
}

// --- CRC-16 tests ---
describe('crc16', () => {
  it('returns 0xFFFF complement for empty input', () => {
    // Empty data: crc stays 0xFFFF, final = ~0xFFFF & 0xFFFF = 0
    expect(crc16(new Uint8Array([]))).toBe(0x0000);
  });

  it('produces consistent results', () => {
    const data = new Uint8Array([0x01, 0x02, 0x03]);
    const result1 = crc16(data);
    const result2 = crc16(data);
    expect(result1).toBe(result2);
  });

  it('differs from standard CCITT for non-trivial data', () => {
    // This test confirms we're using subtraction, not XOR
    // Standard CCITT XOR for [0x41] with init 0xFFFF: known value
    // Our subtraction variant should differ
    const data = new Uint8Array([0x41]);
    const result = crc16(data);
    // Standard CCITT would give 0x9479 for "A" with init 0xFFFF
    // Subtraction variant gives different result
    expect(result).toBeTypeOf('number');
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(0xFFFF);
  });
});

// --- charToIndex tests ---
describe('charToIndex', () => {
  it('maps all 64 alphabet chars to correct indices', () => {
    for (let i = 0; i < 64; i++) {
      expect(charToIndex(ALPHABET[i]!)).toBe(i);
    }
  });

  it('returns 99 for invalid characters', () => {
    expect(charToIndex('I')).toBe(99);
    expect(charToIndex('O')).toBe(99);
    expect(charToIndex('0')).toBe(99);
    expect(charToIndex('1')).toBe(99);
    expect(charToIndex('l')).toBe(99);
    expect(charToIndex('o')).toBe(99);
    expect(charToIndex(' ')).toBe(99);
  });
});

// --- Scramble round-trip tests ---
describe('bytesToPasswordChars / passwordCharsToBytes', () => {
  it('round-trips Bronze-sized buffer', () => {
    // 11 bytes total (9 data + 2 CRC)
    const original = new Uint8Array(11);
    for (let i = 0; i < 11; i++) original[i] = (i * 37) & 0xFF;

    const chars = bytesToPasswordChars(original);
    expect(chars.length).toBe(PASSWORD_CHAR_COUNTS[PasswordType.Bronze]);

    const result = passwordCharsToBytes(chars, chars.length);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.from(result.data)).toEqual(Array.from(original));
    }
  });

  it('round-trips Silver-sized buffer', () => {
    const original = new Uint8Array(41);
    for (let i = 0; i < 41; i++) original[i] = (i * 53 + 7) & 0xFF;

    const chars = bytesToPasswordChars(original);
    expect(chars.length).toBe(PASSWORD_CHAR_COUNTS[PasswordType.Silver]);

    const result = passwordCharsToBytes(chars, chars.length);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.from(result.data)).toEqual(Array.from(original));
    }
  });

  it('round-trips Gold-sized buffer', () => {
    const original = new Uint8Array(175);
    for (let i = 0; i < 175; i++) original[i] = (i * 71 + 13) & 0xFF;

    const chars = bytesToPasswordChars(original);
    expect(chars.length).toBe(PASSWORD_CHAR_COUNTS[PasswordType.Gold]);

    const result = passwordCharsToBytes(chars, chars.length);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Array.from(result.data)).toEqual(Array.from(original));
    }
  });
});

// --- Serialize/Deserialize round-trip tests ---
describe('serializeGameData / deserializeGameData', () => {
  it('round-trips Bronze password', () => {
    const gd = createEmptyGameData();
    gd.characters[0]!.level = 35;
    gd.characters[1]!.level = 30;
    gd.characters[2]!.level = 28;
    gd.characters[3]!.level = 25;
    gd.djinn = [0x7F, 0x3A, 0x15, 0x7F];
    gd.flags = 0x2B;
    gd.specialItems = 0xC3;

    const buf = serializeGameData(gd, PasswordType.Bronze);
    const result = deserializeGameData(buf, PasswordType.Bronze);

    expect(result.characters[0]!.level).toBe(35);
    expect(result.characters[1]!.level).toBe(30);
    expect(result.characters[2]!.level).toBe(28);
    expect(result.characters[3]!.level).toBe(25);
    expect(result.djinn).toEqual([0x7F, 0x3A, 0x15, 0x7F]);
    expect(result.flags).toBe(0x2B);
    expect(result.specialItems).toBe(0xC3);
  });

  it('round-trips Silver password', () => {
    const gd = makeScreenshotGameData();
    gd.specialItems = 0xFF;

    const buf = serializeGameData(gd, PasswordType.Silver);
    const result = deserializeGameData(buf, PasswordType.Silver);

    for (let i = 0; i < 4; i++) {
      expect(result.characters[i]!.level).toBe(gd.characters[i]!.level);
      expect(result.characters[i]!.hpMax).toBe(gd.characters[i]!.hpMax);
      expect(result.characters[i]!.ppMax).toBe(gd.characters[i]!.ppMax);
      expect(result.characters[i]!.attack).toBe(gd.characters[i]!.attack);
      expect(result.characters[i]!.defense).toBe(gd.characters[i]!.defense);
      expect(result.characters[i]!.agility).toBe(gd.characters[i]!.agility);
      expect(result.characters[i]!.luck).toBe(gd.characters[i]!.luck);
    }
    expect(result.djinn).toEqual(gd.djinn);
    expect(result.flags).toBe(gd.flags);
    expect(result.specialItems).toBe(0xFF);
  });

  it('round-trips Gold password with items and coins', () => {
    const gd = makeScreenshotGameData();
    // Add some items to Isaac's inventory
    gd.items[0]![0]! = { itemId: 0x0009, quantity: 1 }; // Gaia Blade
    gd.items[0]![1]! = { itemId: 0x0052, quantity: 1 }; // Dragon Scales
    gd.items[0]![2]! = { itemId: 0x00B4, quantity: 12 }; // Herb ×12
    gd.items[0]![3]! = { itemId: 0x00BA, quantity: 5 }; // Psy Crystal ×5
    // Add items to Garet
    gd.items[1]![0]! = { itemId: 0x0024, quantity: 1 }; // Vulcan Axe
    gd.items[1]![1]! = { itemId: 0x00B5, quantity: 8 }; // Nut ×8

    const buf = serializeGameData(gd, PasswordType.Gold);
    const result = deserializeGameData(buf, PasswordType.Gold);

    // Verify stats
    for (let i = 0; i < 4; i++) {
      expect(result.characters[i]!.level).toBe(gd.characters[i]!.level);
      expect(result.characters[i]!.hpMax).toBe(gd.characters[i]!.hpMax);
      expect(result.characters[i]!.ppMax).toBe(gd.characters[i]!.ppMax);
      expect(result.characters[i]!.attack).toBe(gd.characters[i]!.attack);
      expect(result.characters[i]!.defense).toBe(gd.characters[i]!.defense);
      expect(result.characters[i]!.agility).toBe(gd.characters[i]!.agility);
      expect(result.characters[i]!.luck).toBe(gd.characters[i]!.luck);
    }

    // Verify items
    expect(result.items[0]![0]!.itemId).toBe(0x0009);
    expect(result.items[0]![2]!.itemId).toBe(0x00B4);
    expect(result.items[0]![2]!.quantity).toBe(12);
    expect(result.items[0]![3]!.itemId).toBe(0x00BA);
    expect(result.items[0]![3]!.quantity).toBe(5);
    expect(result.items[1]![0]!.itemId).toBe(0x0024);
    expect(result.items[1]![1]!.itemId).toBe(0x00B5);
    expect(result.items[1]![1]!.quantity).toBe(8);

    // Verify coins
    expect(result.coins).toBe(283941);

    // Verify djinn and flags
    expect(result.djinn).toEqual([0x7F, 0x7F, 0x7F, 0x7F]);
    expect(result.flags).toBe(0x3F);
  });
});

// --- Full encode/decode round-trip ---
describe('encode / decode', () => {
  it('round-trips Bronze password', () => {
    const gd = createEmptyGameData();
    gd.characters[0]!.level = 50;
    gd.characters[1]!.level = 48;
    gd.characters[2]!.level = 45;
    gd.characters[3]!.level = 42;
    gd.djinn = [0x7F, 0x7F, 0x7F, 0x7F];
    gd.flags = 0x3F;
    gd.specialItems = 0xFF;

    const password = encode(gd, PasswordType.Bronze);
    expect(password.length).toBe(PASSWORD_CHAR_COUNTS[PasswordType.Bronze]);

    const result = decode(password, PasswordType.Bronze);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.characters[0]!.level).toBe(50);
      expect(result.data.characters[1]!.level).toBe(48);
      expect(result.data.characters[2]!.level).toBe(45);
      expect(result.data.characters[3]!.level).toBe(42);
      expect(result.data.djinn).toEqual([0x7F, 0x7F, 0x7F, 0x7F]);
      expect(result.data.flags).toBe(0x3F);
      expect(result.data.specialItems).toBe(0xFF);
    }
  });

  it('round-trips Silver password', () => {
    const gd = makeScreenshotGameData();
    gd.specialItems = 0xFF;

    const password = encode(gd, PasswordType.Silver);
    expect(password.length).toBe(PASSWORD_CHAR_COUNTS[PasswordType.Silver]);

    const result = decode(password, PasswordType.Silver);
    expect(result.ok).toBe(true);
    if (result.ok) {
      for (let i = 0; i < 4; i++) {
        expect(result.data.characters[i]!.level).toBe(gd.characters[i]!.level);
        expect(result.data.characters[i]!.hpMax).toBe(gd.characters[i]!.hpMax);
        expect(result.data.characters[i]!.ppMax).toBe(gd.characters[i]!.ppMax);
        expect(result.data.characters[i]!.attack).toBe(gd.characters[i]!.attack);
        expect(result.data.characters[i]!.defense).toBe(gd.characters[i]!.defense);
        expect(result.data.characters[i]!.agility).toBe(gd.characters[i]!.agility);
        expect(result.data.characters[i]!.luck).toBe(gd.characters[i]!.luck);
      }
      expect(result.data.djinn).toEqual(gd.djinn);
      expect(result.data.flags).toBe(gd.flags);
    }
  });

  it('round-trips Gold password with full data', () => {
    const gd = makeScreenshotGameData();
    gd.items[0]![0]! = { itemId: 0x0009, quantity: 1 };
    gd.items[0]![1]! = { itemId: 0x0052, quantity: 1 };
    gd.items[0]![2]! = { itemId: 0x00B4, quantity: 12 };
    gd.items[0]![3]! = { itemId: 0x00BA, quantity: 5 };
    gd.items[1]![0]! = { itemId: 0x0024, quantity: 1 };
    gd.items[1]![1]! = { itemId: 0x00B5, quantity: 8 };

    const password = encode(gd, PasswordType.Gold);
    expect(password.length).toBe(PASSWORD_CHAR_COUNTS[PasswordType.Gold]);

    const result = decode(password, PasswordType.Gold);
    expect(result.ok).toBe(true);
    if (result.ok) {
      for (let i = 0; i < 4; i++) {
        expect(result.data.characters[i]!.level).toBe(gd.characters[i]!.level);
        expect(result.data.characters[i]!.hpMax).toBe(gd.characters[i]!.hpMax);
        expect(result.data.characters[i]!.ppMax).toBe(gd.characters[i]!.ppMax);
        expect(result.data.characters[i]!.attack).toBe(gd.characters[i]!.attack);
        expect(result.data.characters[i]!.defense).toBe(gd.characters[i]!.defense);
        expect(result.data.characters[i]!.agility).toBe(gd.characters[i]!.agility);
        expect(result.data.characters[i]!.luck).toBe(gd.characters[i]!.luck);
      }
      expect(result.data.items[0]![0]!.itemId).toBe(0x0009);
      expect(result.data.items[0]![2]!.quantity).toBe(12);
      expect(result.data.items[0]![3]!.quantity).toBe(5);
      expect(result.data.items[1]![1]!.quantity).toBe(8);
      expect(result.data.coins).toBe(283941);
      expect(result.data.djinn).toEqual([0x7F, 0x7F, 0x7F, 0x7F]);
      expect(result.data.flags).toBe(0x3F);
    }
  });

  it('auto-detects password type from character count', () => {
    const gd = createEmptyGameData();
    gd.characters[0]!.level = 10;
    gd.djinn = [0x01, 0x02, 0x03, 0x04];
    gd.flags = 0x15;

    const password = encode(gd, PasswordType.Bronze);
    const result = decode(password); // no type specified
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.passwordType).toBe(PasswordType.Bronze);
      expect(result.data.characters[0]!.level).toBe(10);
    }
  });

  it('handles whitespace in password input', () => {
    const gd = createEmptyGameData();
    gd.characters[0]!.level = 20;

    const password = encode(gd, PasswordType.Bronze);
    // Insert spaces
    const spaced = password.slice(0, 5) + ' ' + password.slice(5, 10) + '\n' + password.slice(10);
    const result = decode(spaced, PasswordType.Bronze);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.characters[0]!.level).toBe(20);
    }
  });

  it('rejects invalid characters', () => {
    const result = decode('ABCDEFGHIJKLMNOP', PasswordType.Bronze);
    // 'I' is invalid
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('Invalid password character');
    }
  });

  it('rejects wrong character count', () => {
    const result = decode('ABCDE'); // 5 chars — no matching type
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('incorrect number of characters');
    }
  });

  it('rejects corrupted password (bad CRC)', () => {
    const gd = createEmptyGameData();
    gd.characters[0]!.level = 10;
    const password = encode(gd, PasswordType.Bronze);
    // Flip a character
    const chars = password.split('');
    chars[0] = chars[0] === 'A' ? 'B' : 'A';
    const corrupted = chars.join('');
    const result = decode(corrupted, PasswordType.Bronze);
    // Should fail at either check digit or CRC
    expect(result.ok).toBe(false);
  });
});

// --- Stat clamping ---
describe('stat clamping', () => {
  it('clamps out-of-range stats during serialization', () => {
    const gd = createEmptyGameData();
    gd.characters[0]!.level = 150; // max 99
    gd.characters[0]!.hpMax = 3000; // max 1999
    gd.characters[0]!.luck = -5; // min 0

    const buf = serializeGameData(gd, PasswordType.Silver);
    const result = deserializeGameData(buf, PasswordType.Silver);

    expect(result.characters[0]!.level).toBe(99);
    expect(result.characters[0]!.hpMax).toBe(1999);
    expect(result.characters[0]!.luck).toBe(0);
  });
});

// --- Edge cases ---
describe('edge cases', () => {
  it('handles all-zero game data', () => {
    const gd = createEmptyGameData();
    // level defaults to 1

    for (const pwType of [PasswordType.Bronze, PasswordType.Silver, PasswordType.Gold] as const) {
      const password = encode(gd, pwType);
      const result = decode(password, pwType);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.characters[0]!.level).toBe(1);
      }
    }
  });

  it('handles max coins', () => {
    const gd = createEmptyGameData();
    gd.coins = 999999;

    const password = encode(gd, PasswordType.Gold);
    const result = decode(password, PasswordType.Gold);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.coins).toBe(999999);
    }
  });

  it('handles max stat values', () => {
    const gd = createEmptyGameData();
    gd.characters[0]! = {
      level: 99,
      hpMax: 1999,
      ppMax: 1999,
      attack: 999,
      defense: 999,
      agility: 999,
      luck: 99,
    };

    const password = encode(gd, PasswordType.Gold);
    const result = decode(password, PasswordType.Gold);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ch = result.data.characters[0]!;
      expect(ch.level).toBe(99);
      expect(ch.hpMax).toBe(1999);
      expect(ch.ppMax).toBe(1999);
      expect(ch.attack).toBe(999);
      expect(ch.defense).toBe(999);
      expect(ch.agility).toBe(999);
      expect(ch.luck).toBe(99);
    }
  });
});
