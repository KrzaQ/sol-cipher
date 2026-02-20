import type { GameData } from './types';
import { CHARACTER_COUNT, ITEMS_PER_CHARACTER, ELEMENTS_COUNT } from './constants';

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function createEmptyGameData(): GameData {
  const characters = Array.from({ length: CHARACTER_COUNT }, () => ({
    level: 1,
    hpMax: 0,
    ppMax: 0,
    attack: 0,
    defense: 0,
    agility: 0,
    luck: 0,
  }));

  const items = Array.from({ length: CHARACTER_COUNT }, () =>
    Array.from({ length: ITEMS_PER_CHARACTER }, () => ({
      itemId: 0,
      quantity: 0,
    })),
  );

  const djinn = new Array<number>(ELEMENTS_COUNT).fill(0);

  return {
    characters,
    items,
    djinn,
    flags: 0,
    specialItems: 0,
    coins: 0,
  };
}
