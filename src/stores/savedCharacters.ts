import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the types directly since they're not in wfrp.ts
interface CharacterStats {
  WS: number;
  BS: number;
  S: number;
  T: number;
  Ag: number;
  Int: number;
  WP: number;
  Fel: number;
  attacks: number;
  wounds: number;
  strengthBonus: number;
  toughnessBonus: number;
  movement: number;
  magic: number;
  insanityPoints: number;
  fate: number;
}

interface Character {
  id: string;
  name: string;
  race: string;
  currentCareer: string;
  stats: CharacterStats;
  skills: string[];
  talents: string[];
  trappings: string[];
  experience: {
    total: number;
    spent: number;
    available: number;
  };
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CharacterState {
  currentCharacter: Partial<Character>;
  savedCharacters: Character[];
  
  // Actions
  setCharacterField: <K extends keyof Character>(field: K, value: Character[K]) => void;
  setStats: (stats: Partial<CharacterStats>) => void;
  setStat: (stat: keyof CharacterStats, value: number) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  addTalent: (talent: string) => void;
  removeTalent: (talent: string) => void;
  saveCharacter: () => void;
  loadCharacter: (id: string) => void;
  createNewCharacter: () => void;
  deleteCharacter: (id: string) => void;
  resetCurrentCharacter: () => void;
}

// Simple ID generator (replaces uuid dependency)
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const initialCharacter = (): Partial<Character> => ({
  id: generateId(),
  name: '',
  race: '',
  currentCareer: '',
  stats: {
    WS: 0,
    BS: 0,
    S: 0,
    T: 0,
    Ag: 0,
    Int: 0,
    WP: 0,
    Fel: 0,
    attacks: 1,
    wounds: 0,
    strengthBonus: 0,
    toughnessBonus: 0,
    movement: 4,
    magic: 0,
    insanityPoints: 0,
    fate: 0,
  },
  skills: [],
  talents: [],
  trappings: [],
  experience: {
    total: 0,
    spent: 0,
    available: 0,
  },
  description: '',
});

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set, get) => ({
      currentCharacter: initialCharacter(),
      savedCharacters: [],

      setCharacterField: (field, value) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            [field]: value,
            updatedAt: new Date().toISOString(),
          },
        })),

      setStats: (newStats) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            stats: {
              ...state.currentCharacter.stats!,
              ...newStats,
            },
            updatedAt: new Date().toISOString(),
          },
        })),

      setStat: (stat, value) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            stats: {
              ...state.currentCharacter.stats!,
              [stat]: value,
              // Auto-calculate bonuses
              strengthBonus: stat === 'S' ? Math.floor(value / 10) : state.currentCharacter.stats!.strengthBonus,
              toughnessBonus: stat === 'T' ? Math.floor(value / 10) : state.currentCharacter.stats!.toughnessBonus,
            },
            updatedAt: new Date().toISOString(),
          },
        })),

      addSkill: (skill) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            skills: [...(state.currentCharacter.skills || []), skill],
            updatedAt: new Date().toISOString(),
          },
        })),

      removeSkill: (skill) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            skills: (state.currentCharacter.skills || []).filter((s: string) => s !== skill),
            updatedAt: new Date().toISOString(),
          },
        })),

      addTalent: (talent) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            talents: [...(state.currentCharacter.talents || []), talent],
            updatedAt: new Date().toISOString(),
          },
        })),

      removeTalent: (talent) =>
        set((state) => ({
          currentCharacter: {
            ...state.currentCharacter,
            talents: (state.currentCharacter.talents || []).filter((t: string) => t !== talent),
            updatedAt: new Date().toISOString(),
          },
        })),

      saveCharacter: () => {
        const { currentCharacter, savedCharacters } = get();
        if (currentCharacter.name && currentCharacter.race) {
          const completeCharacter: Character = {
            ...currentCharacter,
            createdAt: currentCharacter.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as Character;

          const existingIndex = savedCharacters.findIndex(c => c.id === completeCharacter.id);
          
          set((state) => ({
            savedCharacters: existingIndex >= 0 
              ? state.savedCharacters.map((char, i) => i === existingIndex ? completeCharacter : char)
              : [...state.savedCharacters, completeCharacter],
          }));
        }
      },

      loadCharacter: (id) => {
        const character = get().savedCharacters.find(c => c.id === id);
        if (character) {
          set({ currentCharacter: { ...character } });
        }
      },

      createNewCharacter: () =>
        set({ currentCharacter: initialCharacter() }),

      deleteCharacter: (id) =>
        set((state) => ({
          savedCharacters: state.savedCharacters.filter(c => c.id !== id),
        })),

      resetCurrentCharacter: () =>
        set({ currentCharacter: initialCharacter() }),
    }),
    {
      name: 'wfrp-characters',
      partialize: (state) => ({ savedCharacters: state.savedCharacters }),
    }
  )
);