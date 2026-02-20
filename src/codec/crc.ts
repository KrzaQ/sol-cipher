/**
 * CRC-16 subtraction variant used by Golden Sun.
 *
 * NOT standard CRC-16-CCITT. Uses subtraction instead of XOR with the
 * polynomial: ((crc << 1) - 0x1021) rather than ((crc << 1) ^ 0x1021).
 */
export function crc16(data: Uint8Array): number {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]! << 8;
    for (let bit = 0; bit < 8; bit++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) - 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return (~crc) & 0xFFFF;
}
