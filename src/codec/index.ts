// Public API
export { encode, decode } from './codec';
export type { DecodeResult } from './codec';
export { createEmptyGameData, clamp } from './gamedata';

// Re-export types and constants needed by UI
export type { GameData, CharacterStats, ItemSlot } from './types';
export {
  PasswordType,
  Element,
  ALPHABET,
  CHARACTER_NAMES,
  CHARACTER_COUNT,
  ELEMENTS_COUNT,
  DJINN_PER_ELEMENT,
  DJINN_NAMES,
  EVENT_FLAGS,
  ITEMS_PER_CHARACTER,
  MAX_COINS,
  STAT_DEFINITIONS,
  SPECIAL_ITEM_IDS,
  QUANTITY_ITEM_IDS,
  PSYNERGY_ITEM_IDS,
  KEY_ITEM_IDS,
  REQUIRED_ITEM_IDS,
  QUEST_ITEM_IDS,
  MAX_GS1_ITEM_ID,
  UNOBTAINABLE_ITEM_IDS,
  CROSS_GAME_DIFFERENCES,
  RUSTY_FORGE_MAP,
  PASSWORD_CHAR_COUNTS,
} from './constants';
export type { EventFlag, StatDefinition, CrossGameDifference } from './constants';
export { GS1_ITEMS, TLA_ITEMS } from './items';
export { passwordToUrl, urlToPassword } from './urlEncoding';
export { validateChecksums } from './scramble';
