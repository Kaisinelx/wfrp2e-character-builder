// src/engine/advancement/costs.ts

export const ADV_COSTS = {
  characteristicMainPerStep: 100,   // +5% for WS, BS, S, T, Ag, Int, WP, Fel
  characteristicSecondaryPerStep: 100, // +1 for A, W, Mag
  skillAcquire: 100,
  skillImprove10: 100,
  skillImprove20: 200,              // ← your correction
  talentAcquire: 100,
} as const;

export const STEP_SIZES = {
  mainCharacteristic: 5, // percent
  secondaryCharacteristic: 1, // flat (A/W/Mag)
} as const;

export type MainCharKey = "WS" | "BS" | "S" | "T" | "Ag" | "Int" | "WP" | "Fel";
export type SecondaryKey = "A" | "W" | "Mag";

export function isSecondary(k: string): k is SecondaryKey {
  return k === "A" || k === "W" || k === "Mag";
}

export function costCharacteristicAdvance(stat: MainCharKey | SecondaryKey): number {
  return isSecondary(stat)
    ? ADV_COSTS.characteristicSecondaryPerStep
    : ADV_COSTS.characteristicMainPerStep;
}

export function stepSizeFor(stat: MainCharKey | SecondaryKey): number {
  return isSecondary(stat)
    ? STEP_SIZES.secondaryCharacteristic
    : STEP_SIZES.mainCharacteristic;
}

// Optional: guard skill progression (+20 requires +10 first)
export function costSkillImprove(amount: 10 | 20): number {
  return amount === 10 ? ADV_COSTS.skillImprove10 : ADV_COSTS.skillImprove20;
}
