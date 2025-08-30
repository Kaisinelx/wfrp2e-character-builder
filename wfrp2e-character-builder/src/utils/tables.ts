// src/utils/tables.ts (or wherever this lives)

import type { RaceData } from '../data/races';

// ---------- Types ----------
export type RangeTuple = [min: number, max: number, value: number];

export interface RangeValue {
  min: number;
  max: number;
  value: number;
}

// ---------- Core: resolve (no hidden roll) ----------
export function resolveFromTable(
  table: ReadonlyArray<RangeValue | RangeTuple>,
  roll: number
): number {
  if (!table.length) throw new Error("resolveFromTable: empty table");

  const getMin = (e: RangeValue | RangeTuple) => Array.isArray(e) ? e[0] : e.min;
  const getMax = (e: RangeValue | RangeTuple) => Array.isArray(e) ? e[1] : e.max;
  const getVal = (e: RangeValue | RangeTuple) => Array.isArray(e) ? e[2] : e.value;

  for (const entry of table) {
    if (roll >= getMin(entry) && roll <= getMax(entry)) {
      return getVal(entry);
    }
  }
  // Guard for gaps: fall back to last row
  return getVal(table[table.length - 1]);
}

// (Optional convenience) Thin wrapper if you ever want it,
// but keep it calling resolveFromTable with an explicit roller:
export function rollFromTableWith(
  table: ReadonlyArray<RangeValue | RangeTuple>,
  roller: () => number
): { roll: number; value: number } {
  const roll = roller();
  return { roll, value: resolveFromTable(table, roll) };
}

// ---------- Local die helpers (keep explicit) ----------
const rollD10 = () => Math.ceil(Math.random() * 10);

// ---------- WFRP2e: Race table rolls (d10) ----------
export function rollFate(
  raceId: string,
  races: RaceData[]
): { roll: number; value: number } | null {
  const race = races.find(r => r.id === raceId);
  if (!race) return null;
  const roll = rollD10();
  return { roll, value: resolveFromTable(race.fateTable, roll) };
}

export function rollWounds(
  raceId: string,
  races: RaceData[]
): { roll: number; value: number } | null {
  const race = races.find(r => r.id === raceId);
  if (!race) return null;
  const roll = rollD10();
  return { roll, value: resolveFromTable(race.woundsTable, roll) };
}

// ---------- Random selection helpers ----------
export function rollRandomTalents(
  talents: Array<{ name: string; spec?: string }>,
  count: number
): Array<{ name: string; spec?: string }> {
  // Fisher–Yates (no Math.random sort bias)
  const pool = talents.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}

export function selectRandomChoices<T>(choices: T[], count: number): T[] {
  const pool = choices.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.max(0, Math.min(count, pool.length)));
}
