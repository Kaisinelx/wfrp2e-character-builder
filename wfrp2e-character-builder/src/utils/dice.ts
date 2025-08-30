import { getRaceById } from '../data/races';
import type { CharacterStats } from '../types/wfrp';
import { resolveFromTable } from './tables';

export const rollD10 = (): number => Math.ceil(Math.random() * 10);
export const rollD100 = (): number => Math.floor(Math.random() * 100) + 1;
export const roll2D10 = (): number => rollD10() + rollD10();
export const calculateBonus = (stat: number): number => Math.floor(stat / 10);

// ——— Uniform API: all table-driven functions return { roll, value } ———

export function rollWoundsForRace(raceId: string): { roll: number; value: number } {
  const race = getRaceById(raceId);
  if (!race) throw new Error(`Unknown race: ${raceId}`);
  
  const roll = rollD10();
  const value = resolveFromTable(race.woundsTable, roll);
  return { roll, value };
}

export function rollFateForRace(raceId: string): { roll: number; value: number } {
  const race = getRaceById(raceId);
  if (!race) throw new Error(`Unknown race: ${raceId}`);
  
  const roll = rollD10();
  const value = resolveFromTable(race.fateTable, roll);
  return { roll, value };
}

// ——— Enhanced rollCharacteristicsByRace with uniform roll tracking ———

type ShortKey = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

export const rollCharacteristicsByRace = (raceId: string) => {
  const race = getRaceById(raceId);
  if (!race) throw new Error(`Unknown race: ${raceId}`);
  const base = race.startingCharacteristics as Record<ShortKey, number>;

  // Get wounds and fate results with roll tracking
  const woundsResult = rollWoundsForRace(raceId);
  const fateResult = rollFateForRace(raceId);

 return {
  // Characteristics (2d10 + base)
  weaponSkill:    base.WS  + roll2D10(),
  ballisticSkill: base.BS  + roll2D10(),
  strength:       base.S   + roll2D10(),
  toughness:      base.T   + roll2D10(),
  agility:        base.Ag  + roll2D10(),
  intelligence:   base.Int + roll2D10(),
  willPower:      base.WP  + roll2D10(),
  fellowship:     base.Fel + roll2D10(),
  
  // Table-driven results (d10 + table lookup)
  wounds: woundsResult.value,
  woundsRoll: woundsResult.roll,
  fate: fateResult.value,
  fateRoll: fateResult.roll,
  
  // Direct from race data
  movement: race.move,
  
  // Full result objects (for advanced usage)
  woundsResult,  // { roll: 7, value: 12 }
  fateResult,    // { roll: 4, value: 3 }
  
  // ADD THIS: Grouped rolls for context storage
  rolls: {
    wounds: { roll: woundsResult.roll, value: woundsResult.value },
    fate: { roll: fateResult.roll, value: fateResult.value }
  }
};
};

// ——— Display helpers (unchanged) ———

type CharKey =
  | 'weaponSkill' | 'ballisticSkill' | 'strength' | 'toughness'
  | 'agility' | 'intelligence' | 'willPower' | 'fellowship';

const LONG_TO_SHORT: Record<CharKey, ShortKey> = {
  weaponSkill: 'WS', ballisticSkill: 'BS', strength: 'S', toughness: 'T',
  agility: 'Ag', intelligence: 'Int', willPower: 'WP', fellowship: 'Fel',
};

const getRaceBase = (characteristic: CharKey, raceId: string): number => {
  const race = getRaceById(raceId);
  if (!race) return 0;
  const base = race.startingCharacteristics as Record<ShortKey, number>;
  return base[LONG_TO_SHORT[characteristic]];
};

export const formatCharacteristicsDisplay = (stats: CharacterStats, raceId: string): string => `
=== ${raceId.toUpperCase()} CHARACTER ===

=== MAIN CHARACTERISTICS ===
WS:  ${stats.weaponSkill} (${getRaceBase('weaponSkill', raceId)} + ${stats.weaponSkill - getRaceBase('weaponSkill', raceId)})
BS:  ${stats.ballisticSkill} (${getRaceBase('ballisticSkill', raceId)} + ${stats.ballisticSkill - getRaceBase('ballisticSkill', raceId)})
S:   ${stats.strength} (${getRaceBase('strength', raceId)} + ${stats.strength - getRaceBase('strength', raceId)})
T:   ${stats.toughness} (${getRaceBase('toughness', raceId)} + ${stats.toughness - getRaceBase('toughness', raceId)})
Ag:  ${stats.agility} (${getRaceBase('agility', raceId)} + ${stats.agility - getRaceBase('agility', raceId)})
Int: ${stats.intelligence} (${getRaceBase('intelligence', raceId)} + ${stats.intelligence - getRaceBase('intelligence', raceId)})
WP:  ${stats.willPower} (${getRaceBase('willPower', raceId)} + ${stats.willPower - getRaceBase('willPower', raceId)})
Fel: ${stats.fellowship} (${getRaceBase('fellowship', raceId)} + ${stats.fellowship - getRaceBase('fellowship', raceId)})

=== SECONDARY CHARACTERISTICS ===
A:   ${stats.attacks} (fixed at 1 for starting characters)
W:   ${stats.wounds} (rolled on d10 wounds table)
SB:  ${stats.strengthBonus} (calculated: first digit of S)
TB:  ${stats.toughnessBonus} (calculated: first digit of T)
M:   ${stats.movement} (race dependent)
Mag: ${stats.magic} (0 for non-spellcasters)
IP:  ${stats.insanityPoints} (starts at 0)
FP:  ${stats.fate} (rolled on d10 fate table)
`;