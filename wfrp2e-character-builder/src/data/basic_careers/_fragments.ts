// src/data/careers/_fragments.ts
import type { Choice, PickGroup } from "./_types";

export const SKILL = (name: string, spec?: string): Choice => ({ name, spec });
export const TALENT = (name: string, spec?: string): Choice => ({ name, spec });

export const OR = (options: Choice[], pick = 1): PickGroup => ({ options, pick });

// You can define tiny "snippets" to reuse, but don't compose them invisibly.
// For example, a frequently reused OR:
export const OR_AnimalCare_or_Charm = OR([SKILL("Animal Care"), SKILL("Charm")], 1);

// ✅ Added validation helpers
export const validatePickGroup = (g: PickGroup): boolean =>
  g.pick > 0 && g.pick <= g.options.length;

// ✅ Added common WFRP patterns
export const COMMON_KNOWLEDGE = (region: string) => SKILL("Common Knowledge", region);
export const ACADEMIC_KNOWLEDGE = (field: string) => SKILL("Academic Knowledge", field);
export const MELEE = (spec: string) => SKILL("Melee", spec);
export const SPEAK_LANGUAGE = (language: string) => SKILL("Speak Language", language);
export const SECRET_LANGUAGE = (language: string) => SKILL("Secret Language", language);
export const SECRET_SIGNS = (signs: string) => SKILL("Secret Signs", signs);

// ✅ Frequently reused OR patterns
export const OR_Charm_or_Intimidate = OR([SKILL("Charm"), SKILL("Intimidate")]);
export const OR_Academic_or_Common = (field: string) => 
  OR([ACADEMIC_KNOWLEDGE(field), COMMON_KNOWLEDGE(field)]);