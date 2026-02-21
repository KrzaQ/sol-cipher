import { defineStore } from 'pinia';
import {
  encode,
  decode,
  createEmptyGameData,
  PasswordType,
  type GameData,
  type CharacterStats,
} from '../codec';

interface GameDataState {
  gameData: GameData;
  passwordType: PasswordType;
  generatedPassword: string;
  decodeError: string;
}

export const useGameDataStore = defineStore('gameData', {
  state: (): GameDataState => ({
    gameData: createEmptyGameData(),
    passwordType: PasswordType.Gold,
    generatedPassword: '',
    decodeError: '',
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

    setCoins(value: number) {
      this.gameData.coins = value;
    },
  },
});
