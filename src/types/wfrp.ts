// Add these advancement types to your existing wfrp.ts file

// Map your full property names to advancement keys
export type MainCharacteristic = 
  | 'weaponSkill' | 'ballisticSkill' | 'strength' | 'toughness'
  | 'agility' | 'intelligence' | 'willPower' | 'fellowship';

export type SecondaryCharacteristic = 'attacks' | 'wounds' | 'magic';

export type CharacteristicKey = MainCharacteristic | SecondaryCharacteristic;

export type AdvancementType = 
  | 'characteristic_main'
  | 'characteristic_secondary'  
  | 'skill_acquire'
  | 'skill_improve'
  | 'talent_acquire';

export interface LedgerEntry {
  id: string;                    // ULID for stable ordering
  timestamp: string;             // ISO timestamp
  type: AdvancementType;
  target: string;                // characteristic key, skill id, or talent id
  amount: number;                // +5, +1, +10, +20, etc.
  xpCost: number;               // XP spent
  notes?: string;               // Optional metadata
  schemaVersion: number;        // For future migrations
}

export type GuardReason = 
  | 'OK'
  | 'INSUFFICIENT_XP'
  | 'NO_ACTIVE_CAREER'
  | 'AT_CAP_FOR_CAREER'
  | 'MISSING_PREREQUISITE'
  | 'TALENT_NOT_STACKABLE'
  | 'ALREADY_AT_MAX'
  | 'INVALID_TARGET';

export interface GuardResult {
  ok: boolean;
  reason: GuardReason;
  message: string;
  cost?: number;
  details?: Record<string, any>;
}

// Add advancement state to your Character interface
export interface AdvancementState {
  ledger: LedgerEntry[];
  characteristicAdvances: Record<string, number>;
  skillLevels: Record<string, number>; // 0=none, 1=acquired, 2=+10%, 3=+20%
  acquiredTalents: Set<string>;
}