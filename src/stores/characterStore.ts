import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Character, CharacterStats } from '../types/wfrp';
import { v4 as uuidv4 } from 'uuid';

interface CharacterState {
  // Current character being built/edited
  currentCharacter: Partial<Character>;
  // List of saved characters
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

const initialCharacter = (): Partial<Character> => ({
  id: uuidv4(),
  name: '',
  race: '',
  currentCareer: '',
  stats: {
    weaponSkill: 0,
    ballisticSkill: 0,
    strength: 0,
    toughness: 0,
    agility: 0,
    intelligence: 0,
    willPower: 0,
    fellowship: 0,
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
              strengthBonus: stat === 'strength' ? Math.floor((value - 10) / 10) : state.currentCharacter.stats!.strengthBonus,
              toughnessBonus: stat === 'toughness' ? Math.floor((value - 10) / 10) : state.currentCharacter.stats!.toughnessBonus,
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
            skills: (state.currentCharacter.skills || []).filter(s => s !== skill),
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
            talents: (state.currentCharacter.talents || []).filter(t => t !== talent),
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