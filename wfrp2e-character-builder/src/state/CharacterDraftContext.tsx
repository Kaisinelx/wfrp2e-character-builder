import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { getRaceById } from '../data/races';

type StatKey = 'weaponSkill'|'ballisticSkill'|'strength'|'toughness'|'agility'|'intelligence'|'willPower'|'fellowship';
type StatBlock = Record<StatKey, number>;

const baseStats: StatBlock = {
  weaponSkill: 20,
  ballisticSkill: 20,
  strength: 20,
  toughness: 20,
  agility: 20,
  intelligence: 20,
  willPower: 20,
  fellowship: 20
};

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
  skills: Array<{ name: string; spec?: string }>;
  talents: Array<{ name: string; spec?: string }>;
  xpTotal: number;
  xpSpent: number;
  createdAt: string;
  updatedAt: string;
};

type Action =
  | { type: 'SET_RACE'; raceId: string }
  | { type: 'SET_CAREER'; careerId: string; magicFloor?: number }
  | { type: 'SET_STAT'; key: StatKey; value: number }
  | { type: 'SET_STATS'; stats: StatBlock }
  | { type: 'APPLY_ROLLED_DERIVED'; wounds: number; fate: number; rolls?: { wounds: { roll: number; value: number }; fate: { roll: number; value: number } } }
  | { type: 'SET_SKILLS'; skills: Array<{ name: string; spec?: string }> }
  | { type: 'SET_TALENTS'; talents: Array<{ name: string; spec?: string }> }
  | { type: 'SET_NAME'; name: string }
  | { type: 'FINALIZE_DERIVED' }
  | { type: 'RESET' };

export function calcDerived(
  stats: StatBlock,
  raceId: string | null,
  magicFloor: number,
  prev?: Draft['derived']
) {
  const sb = Math.floor(stats.strength / 10);
  const tb = Math.floor(stats.toughness / 10);
  const race = raceId ? getRaceById(raceId) : undefined;

  return {
    // preserve rolled values (0 means "not rolled yet")
    wounds: prev?.wounds ?? 0,
    fate: prev?.fate ?? 0,
    move: race?.move ?? 4,
    strengthBonus: sb,
    toughnessBonus: tb,
    attacks: 1,
    magic: Math.max(prev?.magic ?? 0, magicFloor),
    insanityPoints: prev?.insanityPoints ?? 0,
  };
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const touch = () => ({ updatedAt: new Date().toISOString() });

const createInitialDraft = (): Draft => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: 'Unnamed Character',
    raceId: null,
    careerId: null,
    stats: { ...baseStats },
    derived: {
      wounds: 0,
      move: 0,
      fate: 0,
      strengthBonus: 0,
      toughnessBonus: 0,
      attacks: 1,
      magic: 0,
      insanityPoints: 0
    },
    skills: [],
    talents: [],
    xpTotal: 0,
    xpSpent: 0,
    createdAt: now,
    updatedAt: now
  };
};

type InternalState = Draft & { 
  _hasRolled: boolean;
  _magicStart: number;
  lastGeneration?: {
    rolls: {
      wounds: { roll: number; value: number };
      fate: { roll: number; value: number };
    };
    seed?: string;        // Future: seedable RNG
    at?: string;          // ISO timestamp
    raceId?: string;      // Debugging: which race
    careerId?: string;    // Debugging: which career
  };
};

const initialState: InternalState = { 
  ...createInitialDraft(), 
  _hasRolled: false,
  _magicStart: 0,
  lastGeneration: undefined
};

function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case 'SET_RACE':
      return {
        ...state,
        ...touch(),
        raceId: action.raceId,
        // zero W/F to signal "needs reroll", preserve everything else
        derived: calcDerived(state.stats, action.raceId, state._magicStart, { ...state.derived, wounds: 0, fate: 0 }),
        _hasRolled: false,
        lastGeneration: undefined, // Clear old generation data
      };
      
    case 'SET_CAREER': {
      const nextMagic = Math.max(state._magicStart ?? 0, action.magicFloor ?? 0);
      return {
        ...state,
        ...touch(),
        careerId: action.careerId,
        _magicStart: nextMagic,
        derived: { ...state.derived, magic: Math.max(state.derived.magic, nextMagic) },
      };
    }
      
    case 'SET_STAT': {
      const newStats = { ...state.stats, [action.key]: action.value };
      const sb = Math.floor(newStats.strength / 10);
      const tb = Math.floor(newStats.toughness / 10);
      const race = state.raceId ? getRaceById(state.raceId) : undefined;
      
      return { 
        ...state, 
        ...touch(),
        stats: newStats,
        derived: {
          ...state.derived,
          move: race?.move ?? 4,
          strengthBonus: sb,
          toughnessBonus: tb,
        }
      };
    }
      
    case 'SET_STATS': {
      const sb = Math.floor(action.stats.strength / 10);
      const tb = Math.floor(action.stats.toughness / 10);
      const move = state.raceId
        ? (getRaceById(state.raceId)?.move ?? 4)
        : 4;

      return {
        ...state,
        ...touch(),
        stats: action.stats,
        derived: {
          ...state.derived,
          move,
          strengthBonus: sb,
          toughnessBonus: tb,
          attacks: 1,
        },
        _hasRolled: true,
      };
    }

    case 'APPLY_ROLLED_DERIVED': {
      return {
        ...state,
        ...touch(),
        derived: {
          ...state.derived,
          wounds: action.wounds,
          fate: action.fate,
        },
        // Store generation metadata if rolls provided
        lastGeneration: action.rolls ? {
          rolls: action.rolls,
          at: new Date().toISOString(),
          raceId: state.raceId || undefined,
          careerId: state.careerId || undefined,
        } : state.lastGeneration,
        _hasRolled: true,
      };
    }

    case 'SET_SKILLS':
      return { ...state, ...touch(), skills: action.skills };

    case 'SET_TALENTS':
      return { ...state, ...touch(), talents: action.talents };
      
    case 'SET_NAME':
      return { 
        ...state, 
        ...touch(),
        name: action.name 
      };
      
    case 'FINALIZE_DERIVED': {
      const sb = Math.floor(state.stats.strength / 10);
      const tb = Math.floor(state.stats.toughness / 10);
      const race = state.raceId ? getRaceById(state.raceId) : undefined;
      
      return {
        ...state,
        ...touch(),
        derived: {
          ...state.derived,
          move: race?.move ?? 4,
          strengthBonus: sb,
          toughnessBonus: tb,
          attacks: 1,
        },
      };
    }
      
    case 'RESET':
      const newDraft = createInitialDraft();
      return { 
        ...newDraft, 
        _hasRolled: false,
        _magicStart: 0,
        lastGeneration: undefined
      };

    default:
      return state;
  }
}

const CharacterDraftContext = createContext<{
  draft: Draft;
  hasRolled: boolean;
  lastGeneration?: InternalState['lastGeneration'];
  dispatch: React.Dispatch<Action>;
}>({
  draft: createInitialDraft(),
  hasRolled: false,
  lastGeneration: undefined,
  dispatch: () => {}
});

export function CharacterDraftProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const value = useMemo(() => ({
    draft: (({ _hasRolled, _magicStart, lastGeneration, ...rest }) => rest)(state) as Draft,
    hasRolled: state._hasRolled,
    lastGeneration: state.lastGeneration,
    dispatch
  }), [state]);

  return (
    <CharacterDraftContext.Provider value={value}>
      {children}
    </CharacterDraftContext.Provider>
  );
}

export const useDraft = () => {
  const context = useContext(CharacterDraftContext);
  if (!context) {
    throw new Error('useDraft must be used within a CharacterDraftProvider');
  }
  return context;
};

export const draftActions = {
  setRace: (raceId: string): Action => ({ type: 'SET_RACE', raceId }),
  setCareer: (careerId: string, magicFloor?: number): Action => ({
    type: 'SET_CAREER',
    careerId,
    magicFloor,
  }),
  setStat: (key: StatKey, value: number): Action => ({ type: 'SET_STAT', key, value }),
  setStats: (stats: StatBlock): Action => ({ type: 'SET_STATS', stats }),
  applyRolledDerived: (wounds: number, fate: number, rolls?: { wounds: { roll: number; value: number }; fate: { roll: number; value: number } }): Action => ({
    type: 'APPLY_ROLLED_DERIVED',
    wounds,
    fate,
    rolls,
  }),
  setSkills: (skills: Array<{ name: string; spec?: string }>): Action => ({ type: 'SET_SKILLS', skills }),
  setTalents: (talents: Array<{ name: string; spec?: string }>): Action => ({ type: 'SET_TALENTS', talents }),
  setName: (name: string): Action => ({ type: 'SET_NAME', name }),
  finalize: (): Action => ({ type: 'FINALIZE_DERIVED' }),
  reset: (): Action => ({ type: 'RESET' }),
};