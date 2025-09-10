// src/data/careers/_types.ts
export type CareerType = "basic" | "advanced";

// keep your preferred class buckets; this uses your 5
export type CareerClass = "Academic" | "Ranger" | "Warrior" | "Criminal" | "Commoner";
// If you later want the RAW eight, swap to a strict union.

// ✅ ADD: Characteristic keys for advancement
export type CharKey = "WS"|"BS"|"S"|"T"|"Ag"|"Int"|"WP"|"Fel";

export interface Choice { name: string; spec?: string }

// ✅ NEW: Updated PickGroup schema with groupId and requiredCount
export interface PickGroup<TRef = Choice> {
  groupId: string;           // NEW stable id
  requiredCount: number;     // NEW, replaces pick
  options: TRef[];
}

export interface SkillBlock {
  required: Choice[];      // granted automatically at career entry
  groups?: PickGroup[];    // choices player must make now, rest purchasable with XP
}

export interface TalentBlock {
  required: Choice[];
  groups?: PickGroup[];
}

export interface CareerRequirements {
  previousCareer?: string[];
  characteristics?: Record<string, number>; // e.g., { WS: 40 }
  skills?: Choice[];
}

// ✅ ADD: Advancement scheme for XP spending (M3+)
export interface AdvanceScheme {
  advances: CharKey[];              // which characteristics can be advanced in this career
  caps: Partial<Record<CharKey, number>>; // absolute maxima while in this career
}

export interface BaseCareer {
  id: string;
  name: string;
  careerClass: CareerClass;   // RAW bucket
  description: string;
  group?: string;             // optional sub‑grouping text you already show
  isMagicalCareer?: boolean;  // true for Apprentice Wizard, Witch, etc.
  magicFloor?: number;        // usually 1 for magical careers
  skillAdvances: SkillBlock;
  talentAdvances: TalentBlock;
  advanceScheme?: AdvanceScheme;    // ✅ ADD: optional until M3 (advancement phase)
}

export interface BasicCareer extends BaseCareer {
  type: "basic";              // ✅ Basic careers have NO tier
}

export interface AdvancedCareer extends BaseCareer {
  type: "advanced";
  tier: 1 | 2 | 3;            // ✅ Only Advanced are tiered
  requirements?: CareerRequirements; // ✅ Fixed: moved here from duplicate interface
}

export type Career = BasicCareer | AdvancedCareer;

// --- convenience type guards (keep near the bottom) ---
export type MagicalCareer = Career & { isMagicalCareer: true; magicFloor: number };
export type NonMagicalCareer = Career & { isMagicalCareer?: false };

export const isBasicCareer = (c: Career): c is BasicCareer => c.type === "basic";
export const isAdvancedCareer = (c: Career): c is AdvancedCareer => c.type === "advanced";
export const requiresMagicFloor = (c: Career): c is MagicalCareer =>
  !!c.isMagicalCareer && typeof c.magicFloor === "number";