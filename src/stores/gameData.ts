import { defineStore } from 'pinia';
import {
  encode,
  decode,
  createEmptyGameData,
  PasswordType,
  ITEMS_PER_CHARACTER,
  QUANTITY_ITEM_IDS,
  type GameData,
  type CharacterStats,
} from '../codec';

const QUANTITY_SET = new Set(QUANTITY_ITEM_IDS);

interface GameDataState {
  gameData: GameData;
  passwordType: PasswordType;
  generatedPassword: string;
  lastValidPassword: string;
  decodeError: string;
  decodeErrorGroups: number[];
  selectedCharIndex: number | null;
}

export const useGameDataStore = defineStore('gameData', {
  state: (): GameDataState => ({
    gameData: createEmptyGameData(),
    passwordType: PasswordType.Gold,
    generatedPassword: '',
    lastValidPassword: '',
    decodeError: '',
    decodeErrorGroups: [],
    selectedCharIndex: null,
  }),

  getters: {
    djinnCount: (state) => (elementIndex: number): number => {
      const mask = state.gameData.djinn[elementIndex] ?? 0;
      let n = mask;
      let count = 0;
      while (n) {
        count += n & 1;
        n >>>= 1;
      }
      return count;
    },

    isFlagSet: (state) => (flagIndex: number): boolean => {
      return (state.gameData.flags & (1 << flagIndex)) !== 0;
    },

    isGold: (state): boolean => state.passwordType === PasswordType.Gold,
  },

  actions: {
    reset() {
      this.gameData = createEmptyGameData();
      this.generatedPassword = '';
      this.lastValidPassword = '';
      this.decodeError = '';
      this.selectedCharIndex = null;
    },

    generatePassword() {
      this.decodeError = '';
      this.decodeErrorGroups = [];
      this.generatedPassword = encode(this.gameData, this.passwordType);
      this.lastValidPassword = this.generatedPassword;
    },

    decodePassword(input: string) {
      const stripped = input.replace(/\s/g, '');
      if (stripped === this.lastValidPassword) return;
      const result = decode(stripped);
      if (result.ok) {
        this.lastValidPassword = encode(result.data, result.passwordType);
        this.gameData = result.data;
        this.passwordType = result.passwordType;
        this.decodeError = '';
        this.decodeErrorGroups = [];
        this.selectedCharIndex = null;
      } else {
        this.decodeError = result.error;
        this.decodeErrorGroups = result.errorGroups ?? [];
      }
    },

    setCharacterStat(charIndex: number, stat: keyof CharacterStats, value: number) {
      this.gameData.characters[charIndex]![stat] = value;
    },

    setDjinn(elementIndex: number, bitmask: number) {
      this.gameData.djinn[elementIndex] = bitmask;
    },

    setFlag(flagIndex: number, value: boolean) {
      if (value) {
        this.gameData.flags |= (1 << flagIndex);
      } else {
        this.gameData.flags &= ~(1 << flagIndex);
      }
    },

    setItem(charIndex: number, slotIndex: number, itemId: number, quantity: number) {
      this.gameData.items[charIndex]![slotIndex] = { itemId, quantity };
    },

    setAllItems(items: { itemId: number; quantity: number }[][]) {
      for (let ci = 0; ci < items.length; ci++) {
        this.gameData.items[ci] = items[ci]!.slice();
      }
    },

    removeItem(charIndex: number, slotIndex: number) {
      const charItems = this.gameData.items[charIndex]!;
      charItems.splice(slotIndex, 1);
      charItems.push({ itemId: 0, quantity: 0 });
    },

    selectChar(charIndex: number) {
      this.selectedCharIndex = charIndex;
    },

    clearSelection() {
      this.selectedCharIndex = null;
    },

    /** Assigns item to first empty slot. Returns [charIndex, slotIndex] or null if full/no selection. */
    assignItem(itemId: number): [number, number] | null {
      if (this.selectedCharIndex === null) return null;
      const charItems = this.gameData.items[this.selectedCharIndex]!;

      // Find first empty slot from top
      let emptyIndex = -1;
      for (let i = 0; i < ITEMS_PER_CHARACTER; i++) {
        if (charItems[i]!.itemId === 0) {
          emptyIndex = i;
          break;
        }
      }
      if (emptyIndex === -1) return null; // inventory full

      const qty = QUANTITY_SET.has(itemId) ? 1 : 0;
      charItems[emptyIndex] = { itemId, quantity: qty };
      return [this.selectedCharIndex, emptyIndex];
    },

    setCoins(value: number) {
      this.gameData.coins = value;
    },
  },
});
