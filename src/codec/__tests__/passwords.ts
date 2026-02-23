/**
 * Shared real-world password test vectors from Golden Sun Wiki.
 * Source: https://goldensunwiki.net/wiki/User:RaileysXerilyas/Golden_Sun_Transfer_Passwords
 */
import { expect } from 'vitest';
import type { GameData } from '../types';

// --- Level 36 save (GAME-MINE by RaileysXerilyas) ---
// All 28 djinn, all 6 quests completed, 679028 coins
export const LEVEL_36 = {
  gold:   'n389#mrtcQwF$LXdxuZLH4HK+httqmDejh3A6K?dQUeabkwahRDFx$9BP7Pf%C#MyZnDip6T!kF&zi#7nkikf+Pq2Dv?jZi8xG&%##MA++REG3pVRcK2vD74fQdMPYWWfy533j9NzubAicZ&DL8S#YGrWFUpdvvMF#!!K+$$PaDBBV?XFSM5LL5SQQ9WUfVe3ZZi755qpcaatUeexwmjj#rpp+vGuuD!y$h$&wMNB==SFDDgXSJJ5t727!VTTcZWhgUy',
  silver: 'Yz??SPJHi!Q7NdrKrEJcQMbKR6vg#Gnu947#%4KDgAm9DackGLfUuRxJs!TD!',
  bronze: '5YtDFsa%xTtXChuv',
  stats: {
    isaac: { level: 36, hpMax: 299, ppMax: 120, attack: 176, defense: 71, agility: 149, luck: 5 },
    garet: { level: 36, hpMax: 350, ppMax: 111, attack: 143, defense: 76, agility: 129, luck: 4 },
    ivan:  { level: 36, hpMax: 279, ppMax: 135, attack: 134, defense: 60, agility: 178, luck: 4 },
    mia:   { level: 36, hpMax: 290, ppMax: 145, attack: 136, defense: 69, agility: 139, luck: 7 },
  },
  coins: 679028,
};

// --- Level 48 save (GAME-MINE by RaileysXerilyas) ---
// All 28 djinn, all 6 quests completed, 916969 coins
export const LEVEL_48 = {
  gold:   'r#aG$NHze8X7L!kN=z4RdePggG&9W3jiJRE8xbG5Rjsk9ENVb4%qRE+3HyfNPSG5fAnrdgLU$7Kpm9Dpss6HkZJFH%WghP23dDQi2&Z=euY$xMU?VS76Tt7&956HcxgY#R+&WF7sp7#!Le2WJ3zMgiS7yDZYG77JD3auH7eyM6cj&PA%=Lk2uE3ryJhV#xPc!=Tg$D2jmBJ4LRN8vjLTd!QXh$UdNNBZ8cf5bYPLah?Qem%gVsaCW6=75tu?May%+euu',
  silver: 'i?scDMzvdvWn!x?YdpLmgwLV5JGw%YseVM?UVjjZztkJWkv48i=XYgi?N=vEJ',
  bronze: 'i3iaDm=xdvww#=HV',
  stats: {
    isaac: { level: 48, hpMax: 393, ppMax: 144, attack: 224, defense: 92, agility: 196, luck: 5 },
    garet: { level: 48, hpMax: 446, ppMax: 136, attack: 188, defense: 97, agility: 169, luck: 4 },
    ivan:  { level: 48, hpMax: 363, ppMax: 164, attack: 175, defense: 78, agility: 227, luck: 4 },
    mia:   { level: 48, hpMax: 380, ppMax: 173, attack: 179, defense: 85, agility: 179, luck: 7 },
  },
  coins: 916969,
};

// --- "Ultimate" password (source: Iron Knuckle's FAQ) ---
// All level 54, 999999 coins, all djinn, all quests, maxed stats
export const ULTIMATE = {
  gold: 'uHYyiXLJJBg=VPk5TteF27Gp6gcmA$b9?XjdAthhJ&qv6Du$!QCZzxRqyzz&5jADYeWb94Wr?Lv!Zz#qF!eB?=B8NkFQyzBiw52fw2KJdrVfS$Ap=JjT%i%Fs7utcHFRP9Vrm3mj%$AiQgBTrCJVMcFxb2iEMtn$9S7bdWbfhy3gkn7kqsbsrvxgvz?kzG$+r$ACvAEVH!FKM$KPBSeV7fXU7eK=Z57Q59bU9q9J#jvC5indraptsSj!zkjy#$p#TAcE',
  coins: 999999,
};

// --- krzaq's original save ---
// Level 35/34/34/34, all 28 djinn, 527690 coins
export const KRZAQ_ORIGINAL = {
  gold: 'VsuiNqS3nTqeWsFYFj$sfUXHPLVsUEreY8m+5?yrAM#2zevb3LFjPr$2fVYbV#JDnZ2Us#QUq8zgcC&7mhH+6xyC8dq7D7A8P$!93UB%7YFBfNxtABLsE6XMM%X!ZVvn582!tappRecfD&D#SzaCKuDuqQHyuUMu&zZS=&5WDkAa3JEe7NJrjcTPpgXTt2m4Yyr7U#vTd9=!hdD$mUiJBsnNFwsZTL?x7Q%?3JVC+8ZGCc5CMHhaPMy8V%Ssj2Wxh6Uw',
  stats: {
    isaac: { level: 35, hpMax: 303, ppMax: 135, attack: 152, defense: 63, agility: 145, luck: 9 },
    garet: { level: 34, hpMax: 304, ppMax: 114, attack: 131, defense: 63, agility: 122, luck: 2 },
    ivan:  { level: 34, hpMax: 288, ppMax: 134, attack: 125, defense: 61, agility: 148, luck: 4 },
    mia:   { level: 34, hpMax: 270, ppMax: 127, attack: 133, defense: 61, agility: 133, luck: 5 },
  },
  coins: 527690,
};

/** All real-world password strings for bulk testing. */
export const ALL_PASSWORDS: string[] = [
  LEVEL_36.gold, LEVEL_36.silver, LEVEL_36.bronze,
  LEVEL_48.gold, LEVEL_48.silver, LEVEL_48.bronze,
  ULTIMATE.gold,
  KRZAQ_ORIGINAL.gold,
];

export function verifyStats(result: GameData, expected: typeof LEVEL_36.stats) {
  const names = ['isaac', 'garet', 'ivan', 'mia'] as const;
  for (let i = 0; i < 4; i++) {
    const ch = result.characters[i]!;
    const exp = expected[names[i]!];
    expect(ch.level, `${names[i]!} level`).toBe(exp.level);
    expect(ch.hpMax, `${names[i]!} hpMax`).toBe(exp.hpMax);
    expect(ch.ppMax, `${names[i]!} ppMax`).toBe(exp.ppMax);
    expect(ch.attack, `${names[i]!} attack`).toBe(exp.attack);
    expect(ch.defense, `${names[i]!} defense`).toBe(exp.defense);
    expect(ch.agility, `${names[i]!} agility`).toBe(exp.agility);
    expect(ch.luck, `${names[i]!} luck`).toBe(exp.luck);
  }
}
