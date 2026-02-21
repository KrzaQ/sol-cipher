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
  decodeError: string;
  selectedCharIndex: number | null;
}

export const useGameDataStore = defineStore('gameData', {
  state: (): GameDataState => ({
    gameData: createEmptyGameData(),
    passwordType: PasswordType.Gold,
    generatedPassword: '',
    decodeError: '',
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
      this.decodeError = '';
      this.selectedCharIndex = null;
    },

    generatePassword() {
      this.decodeError = '';
      this.generatedPassword = encode(this.gameData, this.passwordType);
    },

    decodePassword(input: string) {
      const result = decode(input);
      if (result.ok) {
        this.gameData = result.data;
        this.passwordType = result.passwordType;
        this.decodeError = '';
        this.selectedCharIndex = null;
      } else {
        this.decodeError = result.error;
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

    selectChar(charIndex: number) {
      this.selectedCharIndex = charIndex;
    },

    clearSelection() {
      this.selectedCharIndex = null;
    },

    assignItem(itemId: number) {
      if (this.selectedCharIndex === null) return;
      const charItems = this.gameData.items[this.selectedCharIndex]!;

      // Find first empty slot from top
      let emptyIndex = -1;
      for (let i = 0; i < ITEMS_PER_CHARACTER; i++) {
        if (charItems[i]!.itemId === 0) {
          emptyIndex = i;
          break;
        }
      }
      if (emptyIndex === -1) return; // inventory full

      const qty = QUANTITY_SET.has(itemId) ? 1 : 0;
      charItems[emptyIndex] = { itemId, quantity: qty };
    },

    setCoins(value: number) {
      this.gameData.coins = value;
    },
  },
});
