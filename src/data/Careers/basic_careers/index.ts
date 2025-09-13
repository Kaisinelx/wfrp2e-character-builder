import type { Career, CareerClass } from "../_types";

import { CLASS_ACADEMIC } from "./class.academic";
import { CLASS_WARRIOR } from "./class.warrior"; 
import { CLASS_CRIMINAL } from "./class.criminal";
import { CLASS_RANGER } from "./class.ranger";
import { CLASS_COMMONER } from "./class.commoner";

const ALL_BASIC: Career[] = [
  ...CLASS_ACADEMIC,
  ...CLASS_WARRIOR,
  ...CLASS_CRIMINAL,
  ...CLASS_RANGER,
  ...CLASS_COMMONER,
];

// ✅ Fix the exports that characterDraft.ts expects
export const BASIC_CAREERS = ALL_BASIC;
export const ADVANCED_CAREERS: Career[] = []; // Empty for now

export function getCareerById(id: string): Career | undefined {
  return [...BASIC_CAREERS, ...ADVANCED_CAREERS].find(c => c.id === id);
}

// Keep your existing helpful exports
export const CAREERS: Record<string, Career> = Object.fromEntries(
  [...BASIC_CAREERS, ...ADVANCED_CAREERS].map(c => [c.id, c])
);

export const byClass = (klass: CareerClass) => 
  [...BASIC_CAREERS, ...ADVANCED_CAREERS].filter(c => c.careerClass === klass);

export const getMagicalCareers = () => 
  [...BASIC_CAREERS, ...ADVANCED_CAREERS].filter(c => c.isMagicalCareer);

export const getCareersByTier = (tier: 1 | 2 | 3) => 
  ADVANCED_CAREERS.filter(c => c.type === "advanced" && c.tier === tier);

export type { Career, CareerClass } from "../_types";