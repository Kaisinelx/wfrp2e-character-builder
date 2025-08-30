/**
 * Ledger utilities adapted to your type system
 */
import { ulid } from 'ulid';
import type { LedgerEntry, AdvancementType, MainCharacteristic, SecondaryCharacteristic } from '../../types/wfrp';
import { STEP_SIZES, isSecondary } from '../../data/tables/advancementCosts';

export function createLedgerEntry(
  type: AdvancementType,
  target: string,
  amount: number,
  xpCost: number,
  notes?: string
): LedgerEntry {
  return {
    id: ulid(),
    timestamp: new Date().toISOString(),
    type,
    target,
    amount,
    xpCost,
    notes,
    schemaVersion: 1
  };
}

export function computeCharacteristicAdvances(
  ledger: LedgerEntry[]
): Record<string, number> {
  const advances: Record<string, number> = {};
  
  ledger
    .filter(entry => 
      entry.type === 'characteristic_main' || 
      entry.type === 'characteristic_secondary'
    )
    .forEach(entry => {
      advances[entry.target] = (advances[entry.target] || 0) + 1;
    });
    
  return advances;
}

export function computeSkillLevels(ledger: LedgerEntry[]): Record<string, number> {
  const levels: Record<string, number> = {};
  
  ledger
    .filter(entry => 
      entry.type === 'skill_acquire' || 
      entry.type === 'skill_improve'
    )
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .forEach(entry => {
      if (entry.type === 'skill_acquire') {
        levels[entry.target] = 1;
      } else if (entry.type === 'skill_improve') {
        levels[entry.target] = entry.amount === 10 ? 2 : 3;
      }
    });
    
  return levels;
}

export function computeAcquiredTalents(ledger: LedgerEntry[]): Set<string> {
  const talents = new Set<string>();
  
  ledger
    .filter(entry => entry.type === 'talent_acquire')
    .forEach(entry => talents.add(entry.target));
    
  return talents;
}

export function computeTotalXpSpent(ledger: LedgerEntry[]): number {
  return ledger.reduce((total, entry) => total + entry.xpCost, 0);
}

export function getCharacteristicStepSize(key: MainCharacteristic | SecondaryCharacteristic): number {
  return isSecondary(key) 
    ? STEP_SIZES.secondaryCharacteristic 
    : STEP_SIZES.mainCharacteristic;
}

export function formatCharacteristicAdvance(
  key: MainCharacteristic | SecondaryCharacteristic, 
  cost: number
): string {
  const stepSize = getCharacteristicStepSize(key);
  const suffix = isSecondary(key) ? '' : '%';
  return `+${stepSize}${suffix} (${cost} XP)`;
}