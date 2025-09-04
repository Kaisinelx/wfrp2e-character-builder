import type { Derived } from '../state/characterDraft';

export function preserveWF(prev: Derived, next: Derived, hasRolled?: boolean): Derived {
  return hasRolled ? { ...next, wounds: prev.wounds, fate: prev.fate } : next;
}

export function calcDerived(
  stats: Record<string, number>,
 _raceId: string | null,
  magicFloor: number,
  current?: Derived
): Derived {
  const strength = stats.strength || 0;
  const toughness = stats.toughness || 0;
  
  return {
    wounds: current?.wounds || 0,
    move: 4,     // ✅ Use 'move' not 'movement'
    fate: current?.fate || 0,
    strengthBonus: Math.floor(strength / 10),
    toughnessBonus: Math.floor(toughness / 10),
    attacks: 1,
    magic: Math.max(0, magicFloor),
    insanityPoints: current?.insanityPoints || 0,
  };
}