export interface CharacterStats {
  level: number;
  hpMax: number;
  ppMax: number;
  attack: number;
  defense: number;
  agility: number;
  luck: number;
}

export interface ItemSlot {
  itemId: number;
  quantity: number;
}

export interface GameData {
  characters: CharacterStats[];
  items: ItemSlot[][];
  djinn: number[];
  flags: number;
  specialItems: number;
  coins: number;
}
