import type { CharacterStats } from './types';

// --- A. Pseudo-enums ---

export const PasswordType = { Gold: 0, Silver: 1, Bronze: 2 } as const;
export type PasswordType = (typeof PasswordType)[keyof typeof PasswordType];

export const Element = { Venus: 0, Mercury: 1, Mars: 2, Jupiter: 3 } as const;
export type Element = (typeof Element)[keyof typeof Element];

// --- B. Alphabet ---

export const ALPHABET =
  'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz!?#&$%+=';

export const INVALID_CHAR_INDEX = 99;

// --- C. Password sizes ---

export const PASSWORD_DATA_SIZES: Record<PasswordType, number> = {
  [PasswordType.Gold]: 173,
  [PasswordType.Silver]: 39,
  [PasswordType.Bronze]: 9,
};

export const PASSWORD_CHAR_COUNTS: Record<PasswordType, number> = {
  [PasswordType.Gold]: 260,
  [PasswordType.Silver]: 61,
  [PasswordType.Bronze]: 16,
};

export const PASSWORD_TOTAL_BYTES: Record<PasswordType, number> = {
  [PasswordType.Gold]: 175,
  [PasswordType.Silver]: 41,
  [PasswordType.Bronze]: 11,
};

export const CHAR_COUNT_TO_TYPE: ReadonlyMap<number, PasswordType> = new Map([
  [PASSWORD_CHAR_COUNTS[PasswordType.Bronze], PasswordType.Bronze],
  [PASSWORD_CHAR_COUNTS[PasswordType.Silver], PasswordType.Silver],
  [PASSWORD_CHAR_COUNTS[PasswordType.Gold], PasswordType.Gold],
]);

// --- D. Characters ---

export const CHARACTER_NAMES = ['Isaac', 'Garet', 'Ivan', 'Mia'] as const;
export const CHARACTER_COUNT = 4;

// --- E. Djinn ---

export const ELEMENTS_COUNT = 4;
export const DJINN_PER_ELEMENT = 7;

export const DJINN_NAMES: Record<Element, readonly string[]> = {
  [Element.Venus]: ['Flint', 'Granite', 'Quartz', 'Vine', 'Sap', 'Ground', 'Bane'],
  [Element.Mercury]: ['Fizz', 'Sleet', 'Mist', 'Spritz', 'Hail', 'Tonic', 'Dew'],
  [Element.Mars]: ['Forge', 'Fever', 'Corona', 'Scorch', 'Ember', 'Flash', 'Torch'],
  [Element.Jupiter]: ['Gust', 'Breeze', 'Zephyr', 'Smog', 'Kite', 'Squall', 'Luff'],
};

// --- F. Event flags ---

export interface EventFlag {
  readonly name: string;
  readonly description: string;
}

export const EVENT_FLAGS: readonly EventFlag[] = [
  { name: 'Save Hammet', description: 'Free Hammet from Lunpa Fortress' },
  { name: 'Beat Colosso', description: 'Win the Colosso tournament' },
  { name: 'Hsu Died', description: 'Failed to save Hsu (flag set = negative outcome)' },
  { name: 'Beat Deadbeard', description: 'Defeat Deadbeard boss on Crossbone Isle' },
  { name: 'Return to Vale', description: 'Return to Vale after Lighthouse events' },
  { name: 'Return to Vault', description: 'Return to Vault after Lighthouse events' },
];

// --- G. Item constants ---

// 8 psynergy-granting items tracked as a bitfield in Bronze/Silver passwords
export const SPECIAL_ITEM_IDS: readonly number[] = [
  0xC8, // Orb of Force
  0xC9, // Douse Drop
  0xCA, // Frost Jewel
  0xCB, // Lifting Gem
  0xCC, // Halt Gem
  0xCD, // Cloak Ball
  0xCE, // Carry Stone
  0xCF, // Catch Beads
];

// 23 consumable items whose quantities are tracked in Gold passwords (5 bits each)
export const QUANTITY_ITEM_IDS: readonly number[] = [
  0xB4, // Herb
  0xB5, // Nut
  0xB6, // Vial
  0xB7, // Potion
  0xBA, // Psy Crystal
  0xBB, // Antidote
  0xBC, // Elixir
  0xBD, // Water of Life
  0xBF, // Power Bread
  0xC0, // Cookie
  0xC1, // Apple
  0xC2, // Hard Nut
  0xC3, // Mint
  0xC4, // Lucky Pepper
  0xE2, // Smoke Bomb
  0xE3, // Sleep Bomb
  0xE4, // Game Ticket
  0xE5, // Lucky Medal
  0xEC, // Sacred Feather
  0xEE, // Oil Drop
  0xEF, // Weasel's Claw
  0xF0, // Bramble Seed
  0xF1, // Crystal Powder
];

// --- H. Stat definitions ---

export interface StatDefinition {
  readonly key: keyof CharacterStats;
  readonly bits: number;
  readonly min: number;
  readonly max: number;
}

export const STAT_DEFINITIONS: readonly StatDefinition[] = [
  { key: 'level', bits: 7, min: 1, max: 99 },
  { key: 'hpMax', bits: 11, min: 0, max: 1999 },
  { key: 'ppMax', bits: 11, min: 0, max: 1999 },
  { key: 'attack', bits: 10, min: 0, max: 999 },
  { key: 'defense', bits: 10, min: 0, max: 999 },
  { key: 'agility', bits: 10, min: 0, max: 999 },
  { key: 'luck', bits: 7, min: 0, max: 99 },
];

// --- I. Codec constants ---

export const ITEMS_PER_CHARACTER = 15;
export const ITEM_ID_BITS = 9;
export const ITEM_QUANTITY_BITS = 5;
export const MAX_COINS = 999999;
export const CRC_POLYNOMIAL = 0x1021;
export const CRC_INIT = 0xFFFF;
export const CHECK_CHAR_INTERVAL = 9;
export const BITS_PER_CHAR = 6;
export const STATS_BYTES_PER_PAIR = 15;

// --- J. Cross-game differences ---

export interface CrossGameDifference {
  readonly id: number;
  readonly gs1Name: string;
  readonly tlaName: string;
  readonly notes: string;
}

export const CROSS_GAME_DIFFERENCES: readonly CrossGameDifference[] = [
  { id: 0x0007, gs1Name: 'Masamune', tlaName: 'Fire Brand', notes: 'GS1 debug weapon, becomes Fire Brand on transfer' },
  { id: 0x001A, gs1Name: 'Kusanagi', tlaName: 'Masamune', notes: 'The "real" Masamune; GS1 names it Kusanagi' },
  { id: 0x00DE, gs1Name: 'Mars Star', tlaName: 'Mythril Bag', notes: 'Story items reshuffled' },
  { id: 0x00DF, gs1Name: 'Jupiter Star', tlaName: 'Mythril Bag', notes: 'Stars moved to 0xF6-0xF7 in TLA' },
  { id: 0x00F2, gs1Name: 'Black Orb', tlaName: 'Black Crystal', notes: 'Renamed' },
];
