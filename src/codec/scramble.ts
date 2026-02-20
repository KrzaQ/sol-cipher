import {
  ALPHABET,
  INVALID_CHAR_INDEX,
  CHAR_COUNT_TO_TYPE,
  PASSWORD_TOTAL_BYTES,
} from './constants';

/**
 * Reverse alphabet lookup: password character → 6-bit index.
 * Returns 99 (INVALID_CHAR_INDEX) for invalid characters.
 */
export function charToIndex(ch: string): number {
  const idx = ALPHABET.indexOf(ch);
  return idx >= 0 ? idx : INVALID_CHAR_INDEX;
}

/**
 * Convert raw byte buffer into array of 6-bit password character indices.
 * Port of PasswordObj_BytesToChars. Does NOT mutate the input buffer.
 */
export function bytesToPasswordChars(buf: Uint8Array): number[] {
  // Work on a copy — Step 1 XOR scrambles the bytes
  const data = new Uint8Array(buf);

  // Step 1: XOR scramble — last byte is the key
  const xorKey = data[data.length - 1]!;
  for (let i = 0; i < data.length - 1; i++) {
    data[i] = data[i]! ^ xorKey;
  }

  // Step 2: Extract 6-bit values from bit stream (MSB first)
  const chars: number[] = [];
  let checkSum = 0;
  let checkCount = 0;
  let bitPos = 0;
  const totalBits = data.length * 8;

  while (bitPos < totalBits) {
    let value = 0;
    let bitsRead = 0;
    for (let b = 0; b < 6; b++) {
      if (bitPos >= totalBits) break;
      const byteIdx = bitPos >> 3;
      const bitIdx = 7 - (bitPos & 7);
      value |= ((data[byteIdx]! >> bitIdx) & 1) << (5 - bitsRead);
      bitsRead++;
      bitPos++;
    }

    chars.push(value);
    checkSum += value;
    checkCount++;

    // Every 9 chars, insert a check byte
    if (checkCount === 9) {
      chars.push(checkSum & 0x3F);
      checkSum = 0;
      checkCount = 0;
    }
  }

  // Step 3: Position offset scramble
  for (let i = 0; i < chars.length; i++) {
    chars[i] = (i + chars[i]!) & 0x3F;
  }

  return chars;
}

export type CharsToByteResult =
  | { ok: true; data: Uint8Array }
  | { ok: false; error: string };

/**
 * Convert array of 6-bit password character indices back to byte buffer.
 * Port of PasswordObj_CharsToBytes. Does NOT mutate the input array.
 */
export function passwordCharsToBytes(inputChars: number[], charCount: number): CharsToByteResult {
  // Work on a copy
  const chars = inputChars.slice(0, charCount);

  // Step 1: Reverse position offset
  for (let i = 0; i < charCount; i++) {
    let v = chars[i]! - (i & 0x3F);
    if (v < 0) v += 0x40;
    chars[i] = v & 0x3F;
  }

  // Step 2: Verify check bytes (every 10th char is checksum of preceding 9)
  const errors: string[] = [];
  const groupCount = Math.floor(charCount / 10) + 1;
  for (let group = 0; group < groupCount; group++) {
    const start = group * 10;
    let checkSum = 0;
    let pos = start;
    let count = 0;
    while (count < 9) {
      if (pos >= charCount) break;
      checkSum += chars[pos]!;
      pos++;
      count++;
    }
    if (pos >= charCount) break;
    if (chars[start + 9] !== (checkSum & 0x3F)) {
      errors.push(`page ${group + 1}, row ${count + 1}`);
    }
  }

  if (errors.length > 0) {
    const detail = errors.join(', ');
    return {
      ok: false,
      error: `There is at least one mistake in each of the following:\n${detail}`,
    };
  }

  // Step 3: Pack 6-bit values → 8-bit bytes (skipping every 10th check char)
  const buf: number[] = [];
  let bitOut = 0;
  let bitIn = 0;
  let charIdx = 0;
  let byteVal = 0;

  while (charIdx < charCount) {
    byteVal |= ((chars[charIdx]! >> (5 - bitOut)) & 1) << (7 - bitIn);
    bitOut++;
    bitIn++;

    if (bitOut === 6) {
      bitOut = 0;
      charIdx++;
    }

    if (charIdx % 10 === 9) {
      charIdx++;
    }

    if (bitIn === 8 || charIdx >= charCount) {
      bitIn = 0;
      buf.push(byteVal);
      byteVal = 0;
    }
  }

  // Step 4: Determine expected byte count from char count
  const pwType = CHAR_COUNT_TO_TYPE.get(charCount);
  if (pwType === undefined) {
    return { ok: false, error: 'Password has an incorrect number of characters.' };
  }
  const byteCount = PASSWORD_TOTAL_BYTES[pwType];

  // Step 5: XOR unscramble (all bytes except last XOR'd with last byte)
  const result = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    result[i] = buf[i]!;
  }
  const xorKey = result[byteCount - 1]!;
  for (let i = 0; i < byteCount - 1; i++) {
    result[i] = result[i]! ^ xorKey;
  }

  return { ok: true, data: result };
}
