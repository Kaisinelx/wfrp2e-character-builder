import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
type StatKey = 'WS' | 'BS' | 'S' | 'T' | 'Ag' | 'Int' | 'WP' | 'Fel';

type Choice = { name: string; spec?: string };

interface Draft {
  id: string;
  name: string;
  raceId: string | null;
  careerId: string | null;
  stats: Record<StatKey, number>;
  derived: { 
    wounds: number; 
    fate: number; 
    move: number; 
    attacks: number; 
    strengthBonus: number; 
    toughnessBonus: number; 
    magic: number; 
    insanityPoints: number; 
  };
  skills: Choice[];
  talents: Choice[];
  careerEntryChoices?: {
    skillChoices: Record<string, Choice[]>; // ✅ Changed to string keys (groupId)
    talentChoices: Record<string, Choice[]>; // ✅ Changed to string keys (groupId)
  };
  flags?: {
    grantsAppliedAtCreation?: boolean; // ✅ Use standardized flag name
  };
  createdAt: number;
  updatedAt: number;
}

interface BuilderState {
  draft: Draft;
  hasRolled: boolean; // ✅ Keep at top level, not inside draft
  lastGeneration?: {
    rolls?: number[];
    at?: number;
    raceId?: string;
    careerId?: string;
    wounds?: { die: string; roll: number; result: number };
    fate?: { die: string; roll: number; result: number };
  };
  _magicStart: number;

  // Actions
  setRace: (raceId: string) => void;
  setCareer: (careerId: string, magicFloor?: number) => void;
  setStat: (key: StatKey, value: number) => void;
  setStats: (stats: Record<StatKey, number>) => void;
  rollStats: (raceId: string) => void;
  applyRolledDerived: (wounds: number, fate: number, rolls?: number[]) => void;
  finalizeDerived: () => void;
  setName: (name: string) => void;
  reset: () => void;
  setCareerEntryChoices: (choices: {
    skillChoices: Record<string, Choice[]>; // ✅ Use groupId as keys
    talentChoices: Record<string, Choice[]>; // ✅ Use groupId as keys
  }) => void;
  applyCareerEntryGrants: () => { ok: boolean; issues?: { code: string; message: string }[] };
}

// Helper functions
const generateId = (): string => Math.random().toString(36).substring(2, 9);

const createInitialDraft = (): Draft => ({
  id: generateId(),
  name: '',
  raceId: null,
  careerId: null,
  stats: { WS: 0, BS: 0, S: 0, T: 0, Ag: 0, Int: 0, WP: 0, Fel: 0 },
  derived: { 
    wounds: 0, 
    fate: 0, 
    move: 4, 
    attacks: 1, 
    strengthBonus: 0, 
    toughnessBonus: 0, 
    magic: 0, 
    insanityPoints: 0 
  },
  skills: [],
  talents: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const touch = (draft: Draft): Draft => ({
  ...draft,
  updatedAt: Date.now()
});

// Pure function to calculate derived stats
const calcDerived = (
  stats: Record<StatKey, number>, 
  magicFloor: number, 
  current: Draft['derived']
): Draft['derived'] => {
  // Preserve Wounds and Fate
  const { wounds, fate } = current;
  
  return {
    wounds,
    fate,
    move: current.move, // Will be set by race
    attacks: 1, // Base value
    
    strengthBonus: Math.floor(stats.S / 10),
    toughnessBonus: Math.floor(stats.T / 10),
    magic: Math.max(current.magic, magicFloor),
    insanityPoints: current.insanityPoints
  };
};

// Create the store
export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      draft: createInitialDraft(),
      hasRolled: false, // ✅ Top-level property
      _magicStart: 0,
      
      // Actions
      setRace: (raceId) => set((state) => {
        const newDerived = { ...state.draft.derived, wounds: 0, fate: 0 };
        return {
          draft: touch({ 
            ...state.draft, 
            raceId, 
            derived: newDerived,
          }),
          hasRolled: false  // ✅ Reset hasRolled at top level
        };
      }),
      
      setCareer: (careerId, magicFloor = 0) => set((state) => {
        const derived = calcDerived(
          state.draft.stats, 
          magicFloor, 
          state.draft.derived
        );
        
        return {
          draft: touch({ ...state.draft, careerId, derived }),
          _magicStart: magicFloor
        };
      }),
      
      setStat: (key, value) => set((state) => {
        const newStats = { ...state.draft.stats, [key]: value };
        return { 
          draft: touch({
            ...state.draft, 
            stats: newStats,
            derived: calcDerived(newStats, get()._magicStart, state.draft.derived)
          }) 
        };
      }),
      
      setStats: (stats) => set((state) => {
        return { 
          draft: touch({
            ...state.draft, 
            stats,
            derived: calcDerived(stats, get()._magicStart, state.draft.derived)
          }) 
        };
      }),

      rollStats: (raceId) => {
        // This would use your dice rolling utilities
        // For now just a placeholder that sets hasRolled
        set((state) => ({
          ...state,
          hasRolled: true // ✅ Set at top level
        }));
      },
      
      applyRolledDerived: (wounds, fate, rolls) => set((state) => {
        const newDerived = { ...state.draft.derived, wounds, fate };
        const lastGeneration = {
          rolls,
          at: Date.now(),
          raceId: state.draft.raceId || undefined,
          careerId: state.draft.careerId || undefined,
          wounds: { die: "d10", roll: 0, result: wounds },
          fate: { die: "d10", roll: 0, result: fate },
        };
        
        return {
          draft: touch({ 
            ...state.draft, 
            derived: newDerived,
          }),
          hasRolled: true, // ✅ Set at top level
          lastGeneration
        };
      }),
      
      finalizeDerived: () => set((state) => {
        const derived = calcDerived(
          state.draft.stats,
          get()._magicStart, 
          state.draft.derived
        );
        
        return { 
          draft: touch({ ...state.draft, derived }) 
        };
      }),
      
      setName: (name) => set((state) => ({
        draft: touch({ ...state.draft, name })
      })),
      
      reset: () => set({
        draft: createInitialDraft(),
        hasRolled: false, // ✅ Reset at top level
        _magicStart: 0,
        lastGeneration: undefined
      }),

      setCareerEntryChoices: (choices) => set((state) => ({
        draft: touch({ 
          ...state.draft, 
          careerEntryChoices: choices 
        })
      })),
      
      applyCareerEntryGrants: () => {
        const state = get();
        
        // ✅ Check standardized flag
        if (state.draft.flags?.grantsAppliedAtCreation) {
          return { 
            ok: false, 
            issues: [{ code: "ALREADY_APPLIED", message: "Career entry grants have already been applied" }] 
          };
        }

        if (!state.draft.careerEntryChoices) {
          return {
            ok: false,
            issues: [{ code: "NO_CHOICES", message: "No career entry choices have been made" }]
          };
        }

        // Collect skills and talents from career entry choices
        const newSkills: Choice[] = [...state.draft.skills];
        const newTalents: Choice[] = [...state.draft.talents];

        // Helper function to add choice with de-duplication
        const addWithDedupe = (list: Choice[], item: Choice) => {
          const exists = list.some(
            existing => existing.name === item.name && 
                       (existing.spec === item.spec || (!existing.spec && !item.spec))
          );
          
          if (!exists) {
            list.push(item);
          }
          
          return list;
        };

        // ✅ Process skill choices by groupId
        Object.values(state.draft.careerEntryChoices.skillChoices || {}).forEach(
          choices => choices.forEach(choice => addWithDedupe(newSkills, choice))
        );

        // ✅ Process talent choices by groupId
        Object.values(state.draft.careerEntryChoices.talentChoices || {}).forEach(
          choices => choices.forEach(choice => addWithDedupe(newTalents, choice))
        );
        
        // Update state
        set((state) => ({
          draft: touch({
            ...state.draft,
            skills: newSkills,
            talents: newTalents,
            flags: {
              ...state.draft.flags,
              grantsAppliedAtCreation: true // ✅ Set standardized flag
            }
          })
        }));
        
        return { ok: true };
      }
    }),
    {
      name: 'wfrp2e-character-draft-v1',
      partialize: (state) => ({
        draft: state.draft,
        hasRolled: state.hasRolled, // ✅ Include in persistence
        lastGeneration: state.lastGeneration,
        _magicStart: state._magicStart
      })
    }
  )
);

// Export as useDraft for API compatibility
export const useDraft = useBuilder;

// Selector helpers
export const useDraftValue = () => useBuilder(state => state.draft);
export const useHasRolled = () => useBuilder(state => state.hasRolled); // ✅ Read from top level
export const useGrantsApplied = () => useBuilder(state => state.draft.flags?.grantsAppliedAtCreation);