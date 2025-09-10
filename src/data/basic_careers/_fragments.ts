// src/data/careers/_fragments.ts
import type { Choice, PickGroup } from "./_types";

export const SKILL = (name: string, spec?: string): Choice => ({ name, spec });
export const TALENT = (name: string, spec?: string): Choice => ({ name, spec });

export const OR = (groupId: string, options: Choice[], requiredCount = 1): PickGroup => ({ groupId, options, requiredCount });

// You can define tiny "snippets" to reuse, but don't compose them invisibly.
// For example, a frequently reused OR:
export const OR_AnimalCare_or_Charm = OR("animal_care_or_charm", [SKILL("Animal Care"), SKILL("Charm")], 1);

// ✅ Added validation helpers
export const validatePickGroup = (g: PickGroup): boolean =>
  g.requiredCount > 0 && g.requiredCount <= g.options.length;

// ✅ Added common WFRP patterns
export const COMMON_KNOWLEDGE = (region: string) => SKILL("Common Knowledge", region);
export const ACADEMIC_KNOWLEDGE = (field: string) => SKILL("Academic Knowledge", field);
export const MELEE = (spec: string) => SKILL("Melee", spec);
export const SPEAK_LANGUAGE = (language: string) => SKILL("Speak Language", language);
export const SECRET_LANGUAGE = (language: string) => SKILL("Secret Language", language);
export const SECRET_SIGNS = (signs: string) => SKILL("Secret Signs", signs);

// ✅ Frequently reused OR patterns
export const OR_Charm_or_Intimidate = OR("charm_or_intimidate", [SKILL("Charm"), SKILL("Intimidate")]);
export const OR_Academic_or_Common = (field: string) => 
  OR(`academic_or_common_${field.toLowerCase().replace(/\s+/g, '_')}`, [ACADEMIC_KNOWLEDGE(field), COMMON_KNOWLEDGE(field)]);