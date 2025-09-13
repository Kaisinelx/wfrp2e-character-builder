import { create } from "zustand";
import { getCareerById } from "../data/Careers/basic_careers";
import { isBasicCareer, requiresMagicFloor } from "../data/Careers/_types";
import { getEntryGrants, flattenGrants } from "../utils/careerValidation";
import { calcDerived } from "../utils/derived";

// Import advancement system
import type { LedgerEntry, GuardResult } from "../types/wfrp";
import { guardCharacteristic, guardSkill, guardTalent } from "../engine/advancement/guards";
import { 
  createLedgerEntry, 
  computeCharacteristicAdvances,
  computeSkillLevels,
  computeAcquiredTalents,
  computeTotalXpSpent,
  getCharacteristicStepSize
} from "../engine/advancement/ledger";
// ✅ Use shared secondary logic
import { ADV_COSTS, isSecondary } from "../data/tables/advancementCosts";

// Update this interface to match your Draft.derived structure:
export interface Derived {
  wounds: number;
  move: number;
  fate: number;
  strengthBonus: number;
  toughnessBonus: number;
  attacks: number;
  magic: number;
  insanityPoints: number;
}

// ✅ Roll provenance tracking (matches your dice flow)
export interface LastGeneration {
  rolls: {
    wounds: { roll: number; value: number };
    fate: { roll: number; value: number };
  };
  at: string; // ISO timestamp
  raceId: string;
  careerId?: string;
}

// ---------- IDs ----------
const generateId = () => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      // @ts-ignore
      return crypto.randomUUID();
    }
  } catch {}
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// ---------- Types ----------
export type StatKey =
  | "weaponSkill" | "ballisticSkill" | "strength" | "toughness"
  | "agility" | "intelligence" | "willPower" | "fellowship";

export type StatBlock = Record<StatKey, number>;

export type Choice = { name: string; spec?: string };

// ✅ Extended Draft interface with roll provenance and advancement
export type Draft = {
  id: string;
  name: string;
  raceId: string | null;
  careerId: string | null;
  stats: StatBlock;
  derived: {
    wounds: number;
    move: number;
    fate: number;
    strengthBonus: number;
    toughnessBonus: number;
    attacks: number;
    magic: number;
    insanityPoints: number;
  };
  magicFloor: number; // ✅ Keep naming consistency
  skills: Choice[];
  talents: Choice[];
  xpTotal: number;
  xpSpent: number;
  createdAt: string;

  careerEntryChoices?: {
    skillChoices: Record<number, Choice[]>;
    talentChoices: Record<number, Choice[]>;
  };
  
  // ✅ Updated flag naming to match spec (removed old properties)
  flags?: {
    grantsAppliedAtCreation?: boolean;
  };

  // ✅ Roll provenance (for "d10 → 7 → 11 Wounds" display)
  lastGeneration?: LastGeneration;

  // ✅ Advancement tracking
  advancement: {
    ledger: LedgerEntry[];
    lastError: string | null;
  };
};

// Extended state interface with advancement actions
type DraftState = {
  draft: Draft;
  hasRolled: boolean; // ✅ Top-level property (not in draft)
  setRace: (id: string) => void;
  setCareer: (id: string) => void;
  setStat: (k: StatKey, v: number) => void;
  rollStats: (raceId: string) => void;
  finalizeDerived: () => void;
  setName: (n: string) => void;
  reset: () => void;
  exportJSON: () => string;
  setCareerEntryChoices: (cs: {
    skillChoices: Record<number, Choice[]>;
    talentChoices: Record<number, Choice[]>;
  }) => void;
  applyCareerEntryGrants: () => { ok: boolean; issues?: { code: string; message: string }[] };
  
  // ✅ Advancement actions
  purchaseCharacteristicAdvance: (key: StatKey | 'attacks' | 'wounds' | 'magic') => GuardResult;
  purchaseSkillAdvance: (skillId: string, targetLevel: number) => GuardResult;
  purchaseTalent: (talentId: string) => GuardResult;
  setXpTotal: (total: number) => void;
  clearAdvancementError: () => void;
  
  // ✅ Computed getters
  getAdvancementState: () => {
    characteristicAdvances: Record<string, number>;
    skillLevels: Record<string, number>;
    acquiredTalents: Set<string>;
    totalXpSpent: number;
  };
  getXpUnspent: () => number;
  canAffordCharacteristic: (key: StatKey | 'attacks' | 'wounds' | 'magic') => boolean;
};

// ---------- Helpers ----------
const createEmptyDraft = (): Draft => ({
  id: generateId(),
  name: "Unnamed Character",
  raceId: null,
  careerId: null,
  stats: {
    weaponSkill: 20,
    ballisticSkill: 20,
    strength: 20,
    toughness: 20,
    agility: 20,
    intelligence: 20,
    willPower: 20,
    fellowship: 20,
  },
  derived: {
    wounds: 0,
    move: 0,
    fate: 0,
    strengthBonus: 0,
    toughnessBonus: 0,
    attacks: 1,
    magic: 0,
    insanityPoints: 0,
  },
  magicFloor: 0,
  skills: [],
  talents: [],
  xpTotal: 0,
  xpSpent: 0,
  createdAt: new Date().toISOString(),
  // ✅ Initialize advancement and provenance
  advancement: {
    ledger: [],
    lastError: null,
  },
  lastGeneration: undefined,
});

function mergeChoices(current: Choice[] = [], add: Choice[] = []) {
  const key = (c: Choice) => `${c.name.toLowerCase()}|${c.spec ?? ""}`;
  const map = new Map(current.map((c) => [key(c), c]));
  for (const c of add) map.set(key(c), c);
  return Array.from(map.values());
}

// Helper to map StatKey to advancement-compatible key
const mapToAdvancementKey = (key: StatKey | 'attacks' | 'wounds' | 'magic'): string => {
  return key; // Your keys already match!
};

// ---------- Store ----------
export const useDraft = create<DraftState>()((set, get) => ({
  draft: createEmptyDraft(),
  hasRolled: false, // ✅ Initialize at top level

  // ✅ Clear roll provenance on race change
  setRace: (raceId) => {
    set((s) => {
      const nextDerived = calcDerived(s.draft.stats, raceId, s.draft.magicFloor, s.draft.derived);
      return {
        draft: {
          ...s.draft,
          raceId,
          // Clear wounds/fate and roll provenance
          derived: { ...nextDerived, wounds: 0, fate: 0 },
          lastGeneration: undefined, // ✅ Clear provenance
        },
        hasRolled: false, // ✅ Reset at top level
      };
    });
  },

  setCareer: (careerId) => {
    set((s) => {
      const c = getCareerById(careerId); // ✅ Uses careers barrel
      const magicFloor = c && requiresMagicFloor(c) ? c.magicFloor : 0;
      const nextDerived = calcDerived(s.draft.stats, s.draft.raceId, magicFloor, s.draft.derived);
      const preserved = s.hasRolled // ✅ Read from top-level
        ? { ...nextDerived, wounds: s.draft.derived.wounds, fate: s.draft.derived.fate }
        : nextDerived;

      return {
        draft: {
          ...s.draft,
          careerId,
          magicFloor, // ✅ Keep naming consistency
          derived: preserved,
          careerEntryChoices: { skillChoices: {}, talentChoices: {} },
        },
      };
    });
  },

  setCareerEntryChoices: (cs) =>
    set((s) => ({ draft: { ...s.draft, careerEntryChoices: cs } })),

  applyCareerEntryGrants: () => {
    const s = get();
    const { careerId, careerEntryChoices } = s.draft;
    
    // Check if already applied using new flag structure
    const alreadyApplied = s.draft.flags?.grantsAppliedAtCreation ?? false;
    
    if (!careerId) {
      return { ok: false, issues: [{ code: "NO_CAREER", message: "No career selected" }] };
    }
    
    const career = getCareerById(careerId); // ✅ Uses careers barrel
    if (!career) {
      return { ok: false, issues: [{ code: "INVALID_CAREER", message: "Invalid career ID" }] };
    }

    if (!isBasicCareer(career) || alreadyApplied) {
      return { ok: false, issues: [{ code: "ALREADY_APPLIED", message: "Grants already applied or not a basic career" }] };
    }

    const { grantSkills, grantTalents } = flattenGrants(
      getEntryGrants(career),
      careerEntryChoices ?? { skillChoices: {}, talentChoices: {} }
    );

    set((state) => ({
      draft: {
        ...state.draft,
        skills: mergeChoices(state.draft.skills, grantSkills),
        talents: mergeChoices(state.draft.talents, grantTalents),
        flags: {
          ...state.draft.flags,
          grantsAppliedAtCreation: true, // ✅ Use new flag name
        },
      },
    }));

    return { ok: true };
  },

  setStat: (k, v) => {
    set((s) => {
      const stats: StatBlock = { ...s.draft.stats, [k]: v };
      const nextDerived = calcDerived(stats, s.draft.raceId, s.draft.magicFloor, s.draft.derived);
      const preserved = s.hasRolled // ✅ Read from top-level
        ? { ...nextDerived, wounds: s.draft.derived.wounds, fate: s.draft.derived.fate }
        : nextDerived;

      return { draft: { ...s.draft, stats, derived: preserved } };
    });
  },

  // ✅ Enhanced rollStats with roll provenance tracking (keep your detailed version)
  rollStats: (raceId: string) => {
    import("../utils/dice")
      .then(({ rollCharacteristicsByRace }) => {
        const rolled = rollCharacteristicsByRace(raceId);

        set((s) => {
          const stats: StatBlock = {
            weaponSkill: rolled.weaponSkill,
            ballisticSkill: rolled.ballisticSkill,
            strength: rolled.strength,
            toughness: rolled.toughness,
            agility: rolled.agility,
            intelligence: rolled.intelligence,
            willPower: rolled.willPower,
            fellowship: rolled.fellowship,
          };

          const nextDerived = calcDerived(stats, raceId, s.draft.magicFloor, s.draft.derived);

          const lastGeneration: LastGeneration | undefined = rolled.rolls ? {
            rolls: {
              wounds: rolled.rolls.wounds,
              fate: rolled.rolls.fate
            },
            at: new Date().toISOString(),
            raceId,
            careerId: s.draft.careerId || undefined
          } : undefined;

          return {
            draft: {
              ...s.draft,
              stats,
              derived: { ...nextDerived, wounds: rolled.wounds, fate: rolled.fate },
              lastGeneration,
            },
            hasRolled: true, // ✅ Set at top level
          };
        });
      })
      .catch((e) => {
        console.error("rollStats failed:", e);
      });
  },

  finalizeDerived: () => {
    const s = get();
    const d = s.draft;
    const nextDerived = calcDerived(d.stats, d.raceId, d.magicFloor, d.derived);
    const preserved = s.hasRolled // ✅ Read from top-level
      ? { ...nextDerived, wounds: d.derived.wounds, fate: d.derived.fate }
      : nextDerived;

    set((state) => ({ draft: { ...state.draft, derived: preserved } }));
  },

  setName: (name) => set((s) => ({ draft: { ...s.draft, name } })),

  // ✅ Clear provenance on reset
  reset: () => set({ draft: createEmptyDraft(), hasRolled: false }),

  // ✅ Export JSON (could exclude lastGeneration for reproducible exports)
  exportJSON: () => {
    const { lastGeneration, ...exportDraft } = get().draft;
    return JSON.stringify(exportDraft, null, 2);
  },

  // ✅ Advancement system implementation
  purchaseCharacteristicAdvance: (key) => {
    const state = get();
    const advState = get().getAdvancementState();
    
    // Build guard context
    const context = {
      xpUnspent: state.getXpUnspent(),
      currentCareer: state.draft.careerId ? getCareerById(state.draft.careerId) : undefined, // ✅ Uses careers barrel
      characteristicAdvances: advState.characteristicAdvances,
      skillLevels: advState.skillLevels,
      acquiredTalents: advState.acquiredTalents
    };

    const mappedKey = mapToAdvancementKey(key);
    const guard = guardCharacteristic(context, mappedKey as any);
    
    if (!guard.ok) {
      set(state => ({
        draft: {
          ...state.draft,
          advancement: {
            ...state.draft.advancement,
            lastError: guard.message
          }
        }
      }));
      return guard;
    }

    // Execute purchase
    const cost = guard.cost!;
    const stepSize = getCharacteristicStepSize(mappedKey as any);
    const type = isSecondary(mappedKey) ? 'characteristic_secondary' : 'characteristic_main'; // ✅ Use shared logic
    const suffix = isSecondary(mappedKey) ? '' : '%';
    
    const entry = createLedgerEntry(
      type,
      mappedKey,
      stepSize,
      cost,
      `${mappedKey} +${stepSize}${suffix}` // ✅ Human-readable description
    );

    set(state => ({
      draft: {
        ...state.draft,
        advancement: {
          ledger: [...state.draft.advancement.ledger, entry],
          lastError: null
        }
      }
    }));

    return guard;
  },

  purchaseSkillAdvance: (skillId, targetLevel) => {
    const state = get();
    const advState = get().getAdvancementState();
    
    const context = {
      xpUnspent: state.getXpUnspent(),
      currentCareer: state.draft.careerId ? getCareerById(state.draft.careerId) : undefined, // ✅ Uses careers barrel
      characteristicAdvances: advState.characteristicAdvances,
      skillLevels: advState.skillLevels,
      acquiredTalents: advState.acquiredTalents
    };

    const guard = guardSkill(context, skillId, targetLevel);
    
    if (!guard.ok) {
      set(state => ({
        draft: {
          ...state.draft,
          advancement: {
            ...state.draft.advancement,
            lastError: guard.message
          }
        }
      }));
      return guard;
    }

    const cost = guard.cost!;
    const amount = targetLevel === 1 ? 0 : (targetLevel === 2 ? 10 : 20);
    const type = targetLevel === 1 ? 'skill_acquire' : 'skill_improve';
    const description = targetLevel === 1 ? 'acquired' : `+${amount}%`;
    
    const entry = createLedgerEntry(
      type,
      skillId,
      amount,
      cost,
      `${skillId} ${description}` // ✅ Human-readable description
    );

    set(state => ({
      draft: {
        ...state.draft,
        advancement: {
          ledger: [...state.draft.advancement.ledger, entry],
          lastError: null
        }
      }
    }));

    return guard;
  },

  purchaseTalent: (talentId) => {
    const state = get();
    const advState = get().getAdvancementState();
    
    const context = {
      xpUnspent: state.getXpUnspent(),
      currentCareer: state.draft.careerId ? getCareerById(state.draft.careerId) : undefined, // ✅ Uses careers barrel
      characteristicAdvances: advState.characteristicAdvances,
      skillLevels: advState.skillLevels,
      acquiredTalents: advState.acquiredTalents
    };

    const guard = guardTalent(context, talentId);
    
    if (!guard.ok) {
      set(state => ({
        draft: {
          ...state.draft,
          advancement: {
            ...state.draft.advancement,
            lastError: guard.message
          }
        }
      }));
      return guard;
    }

    const cost = guard.cost!;
    
    const entry = createLedgerEntry(
      'talent_acquire',
      talentId,
      1,
      cost,
      `${talentId} acquired` // ✅ Human-readable description
    );

    set(state => ({
      draft: {
        ...state.draft,
        advancement: {
          ledger: [...state.draft.advancement.ledger, entry],
          lastError: null
        }
      }
    }));

    return guard;
  },

  setXpTotal: (total) => {
    set(state => ({
      draft: { ...state.draft, xpTotal: total }
    }));
  },

  clearAdvancementError: () => set(state => ({
    draft: {
      ...state.draft,
      advancement: { ...state.draft.advancement, lastError: null }
    }
  })),

  // ✅ Computed getters
  getAdvancementState: () => {
    const ledger = get().draft.advancement.ledger;
    return {
      characteristicAdvances: computeCharacteristicAdvances(ledger),
      skillLevels: computeSkillLevels(ledger),
      acquiredTalents: computeAcquiredTalents(ledger),
      totalXpSpent: computeTotalXpSpent(ledger)
    };
  },

  getXpUnspent: () => {
    const draft = get().draft;
    const totalSpent = computeTotalXpSpent(draft.advancement.ledger);
    return draft.xpTotal - totalSpent;
  },

  canAffordCharacteristic: (key) => {
    const state = get();
    const mappedKey = mapToAdvancementKey(key);
    const cost = isSecondary(mappedKey) // ✅ Use shared logic
      ? ADV_COSTS.characteristicSecondaryPerStep 
      : ADV_COSTS.characteristicMainPerStep;
    return state.getXpUnspent() >= cost;
  }
}));