import type { GameData } from './types';
import type { PasswordType } from './constants';
import { ALPHABET, CHAR_COUNT_TO_TYPE, PASSWORD_TOTAL_BYTES } from './constants';
import { serializeGameData } from './serialize';
import { deserializeGameData } from './deserialize';
import { crc16 } from './crc';
import { charToIndex, bytesToPasswordChars, passwordCharsToBytes } from './scramble';

export type DecodeResult =
  | { ok: true; data: GameData; passwordType: PasswordType }
  | { ok: false; error: string; errorGroups?: number[] };

/**
 * Encode game data into a password string.
 */
export function encode(gameData: GameData, passwordType: PasswordType): string {
  // Step 1: Serialize game state to byte buffer
  const dataBuf = serializeGameData(gameData, passwordType);

  // Step 2: Append CRC-16 (big-endian)
  const crc = crc16(dataBuf);
  const totalBytes = PASSWORD_TOTAL_BYTES[passwordType];
  const buf = new Uint8Array(totalBytes);
  buf.set(dataBuf);
  buf[totalBytes - 2] = (crc >> 8) & 0xFF;
  buf[totalBytes - 1] = crc & 0xFF;

  // Step 3: Convert to 6-bit char indices
  const charIndices = bytesToPasswordChars(buf);

  // Step 4: Map through alphabet
  let result = '';
  for (const idx of charIndices) {
    result += ALPHABET[idx]!;
  }
  return result;
}

/**
 * Decode a password string into game data.
 * If passwordType is omitted, auto-detects from character count.
 */
export function decode(password: string, passwordType?: PasswordType): DecodeResult {
  // Strip whitespace
  const cleaned = password.replace(/\s/g, '');

  // Step 1: Convert password characters to 6-bit indices
  const chars: number[] = [];
  for (const ch of cleaned) {
    const idx = charToIndex(ch);
    if (idx === 99) {
      return { ok: false, error: `Cannot import password: Invalid password character "${ch}" found.` };
    }
    chars.push(idx);
  }

  const charCount = chars.length;

  // Auto-detect type from char count if not provided
  let pwType = passwordType;
  if (pwType === undefined) {
    const detected = CHAR_COUNT_TO_TYPE.get(charCount);
    if (detected === undefined) {
      return { ok: false, error: 'Password has an incorrect number of characters.' };
    }
    pwType = detected;
  }

  // Step 2: Reverse scramble → byte buffer
  const unscrambleResult = passwordCharsToBytes(chars, charCount);
  if (!unscrambleResult.ok) {
    return { ok: false, error: unscrambleResult.error, errorGroups: unscrambleResult.errorGroups };
  }
  const buf = unscrambleResult.data;
  const byteCount = buf.length;

  // Step 3: Verify CRC-16
  const storedCrc = (buf[byteCount - 2]! << 8) | buf[byteCount - 1]!;
  const dataBuf = buf.slice(0, byteCount - 2);
  const computedCrc = crc16(dataBuf);

  if (storedCrc !== computedCrc) {
    return { ok: false, error: 'Cannot import password: Password is invalid.' };
  }

  // Step 4: Deserialize game data
  const data = deserializeGameData(dataBuf, pwType);

  return { ok: true, data, passwordType: pwType };
}
