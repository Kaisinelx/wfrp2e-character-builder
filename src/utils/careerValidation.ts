import type { Career, Choice, PickGroup } from '../data/basic_careers/_types';

export type CareerChoices = {
  skillChoices: Record<string, Choice[]>;  // ✅ Changed from number to string (groupId)
  talentChoices: Record<string, Choice[]>; // ✅ Changed from number to string (groupId)
};

export type EntryGrant = {
  requiredSkills: Choice[];
  requiredTalents: Choice[];
  skillChoiceGroups: PickGroup[];
  talentChoiceGroups: PickGroup[];
};

// Structured error for better UI feedback
export type ValidationIssue = {
  code: 'WRONG_COUNT' | 'INVALID_CHOICE' | 'DUPLICATE_IN_GROUP' | 'DUPLICATE_CROSS_GROUP' | 'NON_STACKABLE';
  groupId: string; // ✅ Always use groupId now
  groupType: 'skill' | 'talent';
  message: string;
  expected?: number;
  actual?: number;
  invalidChoice?: string;
  availableChoices?: string[];
};

// Improved result type with ok/error pattern
export type ValidationResult = 
  | { ok: true; grants: { grantSkills: Choice[]; grantTalents: Choice[] } }
  | { ok: false; issues: ValidationIssue[] };

// Create normalized reference key for consistent comparison
export function refKey(choice: Choice): string {
  const normName = choice.name.trim().toLowerCase().replace(/\s+/g, ' ');
  const normSpec = choice.spec ? choice.spec.trim().toLowerCase().replace(/\s+/g, ' ') : '';
  return `${normName}|${normSpec}`;
}

// Normalize a choice for consistent comparison
export function normalizeChoice(choice: Choice): Choice {
  return {
    name: choice.name.trim(),
    spec: choice.spec?.trim() || undefined
  };
}

// Check if two choices are equivalent after normalization
export function choicesEqual(a: Choice, b: Choice): boolean {
  return refKey(a) === refKey(b);
}

// Check for duplicates within a single group
function checkGroupDuplicates(
  choices: Choice[], 
  groupType: 'skill' | 'talent', 
  groupId: string // ✅ Use groupId instead of index
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  
  choices.forEach(choice => {
    const key = refKey(choice);
    if (seen.has(key)) {
      issues.push({
        code: 'DUPLICATE_IN_GROUP',
        groupId, // ✅ Use actual groupId
        groupType,
        message: `Duplicate ${groupType} selection: ${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`,
        invalidChoice: `${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`
      });
    }
    seen.add(key);
  });
  
  return issues;
}

// Check for duplicates across all groups
export function checkCrossGroupDuplicates(cs: CareerChoices): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const skillMap = new Map<string, { groupId: string; choice: Choice }[]>();
  const talentMap = new Map<string, { groupId: string; choice: Choice }[]>();
  
  // Collect all skill choices
  Object.entries(cs.skillChoices).forEach(([groupId, choices]) => {
    choices.forEach(choice => {
      const choiceKey = refKey(choice);
      if (!skillMap.has(choiceKey)) skillMap.set(choiceKey, []);
      skillMap.get(choiceKey)!.push({ groupId, choice });
    });
  });
  
  // Collect all talent choices
  Object.entries(cs.talentChoices).forEach(([groupId, choices]) => {
    choices.forEach(choice => {
      const choiceKey = refKey(choice);
      if (!talentMap.has(choiceKey)) talentMap.set(choiceKey, []);
      talentMap.get(choiceKey)!.push({ groupId, choice });
    });
  });
  
  // Report cross-group duplicates
  skillMap.forEach((occurrences) => {
    if (occurrences.length > 1) {
      const choice = occurrences[0].choice;
      const groups = occurrences.map(o => o.groupId).join(', ');
      issues.push({
        code: 'DUPLICATE_CROSS_GROUP',
        groupId: 'cross_group_skills',
        groupType: 'skill',
        message: `Skill "${choice.name}${choice.spec ? ` (${choice.spec})` : ''}" selected in multiple groups: ${groups}`,
        invalidChoice: `${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`
      });
    }
  });
  
  talentMap.forEach((occurrences) => {
    if (occurrences.length > 1) {
      const choice = occurrences[0].choice;
      const groups = occurrences.map(o => o.groupId).join(', ');
      issues.push({
        code: 'DUPLICATE_CROSS_GROUP',
        groupId: 'cross_group_talents',
        groupType: 'talent',
        message: `Talent "${choice.name}${choice.spec ? ` (${choice.spec})` : ''}" selected in multiple groups: ${groups}`,
        invalidChoice: `${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`
      });
    }
  });
  
  return issues;
}

export function getEntryGrants(career: Career): EntryGrant {
  return {
    requiredSkills: career.skillAdvances.required ?? [],
    requiredTalents: career.talentAdvances.required ?? [],
    skillChoiceGroups: career.skillAdvances.groups ?? [],
    talentChoiceGroups: career.talentAdvances.groups ?? [],
  };
}

export function validateChoices(career: Career, cs: CareerChoices): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  // ✅ Validate skill groups using groupId
  (career.skillAdvances.groups ?? []).forEach((g: PickGroup) => {
    const chosen = cs.skillChoices[g.groupId] ?? [];
    
    // Check pick count
    if (chosen.length !== g.requiredCount) { // ✅ Use requiredCount
      const availableChoices = g.options.map(opt => `${opt.name}${opt.spec ? ` (${opt.spec})` : ''}`);
      issues.push({
        code: 'WRONG_COUNT',
        groupId: g.groupId, // ✅ Use actual groupId
        groupType: 'skill',
        message: `Skills Group ${g.groupId}: Pick exactly ${g.requiredCount} skill(s). Currently selected: ${chosen.length}`,
        expected: g.requiredCount,
        actual: chosen.length,
        availableChoices
      });
    }
    
    // Check for duplicates within this group
    issues.push(...checkGroupDuplicates(chosen, 'skill', g.groupId));
    
    // Validate each choice exists in options (with normalization)
    chosen.forEach(choice => {
      const exists = g.options.some((opt: Choice) => choicesEqual(opt, choice));
      if (!exists) {
        const availableChoices = g.options.map(opt => `${opt.name}${opt.spec ? ` (${opt.spec})` : ''}`);
        issues.push({
          code: 'INVALID_CHOICE',
          groupId: g.groupId, // ✅ Use actual groupId
          groupType: 'skill',
          message: `Skills Group ${g.groupId}: Invalid choice "${choice.name}${choice.spec ? ` (${choice.spec})` : ''}"`,
          invalidChoice: `${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`,
          availableChoices
        });
      }
    });
  });
  
  // ✅ Validate talent groups using groupId
  (career.talentAdvances.groups ?? []).forEach((g: PickGroup) => {
    const chosen = cs.talentChoices[g.groupId] ?? [];
    
    // Check pick count
    if (chosen.length !== g.requiredCount) { // ✅ Use requiredCount
      const availableChoices = g.options.map(opt => `${opt.name}${opt.spec ? ` (${opt.spec})` : ''}`);
      issues.push({
        code: 'WRONG_COUNT',
        groupId: g.groupId, // ✅ Use actual groupId
        groupType: 'talent',
        message: `Talents Group ${g.groupId}: Pick exactly ${g.requiredCount} talent(s). Currently selected: ${chosen.length}`,
        expected: g.requiredCount,
        actual: chosen.length,
        availableChoices
      });
    }
    
    // Check for duplicates within this group
    issues.push(...checkGroupDuplicates(chosen, 'talent', g.groupId));
    
    // Validate each choice exists in options (with normalization)
    chosen.forEach(choice => {
      const exists = g.options.some((opt: Choice) => choicesEqual(opt, choice));
      if (!exists) {
        const availableChoices = g.options.map(opt => `${opt.name}${opt.spec ? ` (${opt.spec})` : ''}`);
        issues.push({
          code: 'INVALID_CHOICE',
          groupId: g.groupId, // ✅ Use actual groupId
          groupType: 'talent',
          message: `Talents Group ${g.groupId}: Invalid choice "${choice.name}${choice.spec ? ` (${choice.spec})` : ''}"`,
          invalidChoice: `${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`,
          availableChoices
        });
      }
    });
  });
  
  // Check for cross-group duplicates (enable if you want this rule)
  // issues.push(...checkCrossGroupDuplicates(cs));
  
  return issues;
}

export function flattenGrants(gr: EntryGrant, cs: CareerChoices) {
  return {
    grantSkills: [
      ...(gr.requiredSkills ?? []),
      ...Object.values(cs.skillChoices).flat(),
    ],
    grantTalents: [
      ...(gr.requiredTalents ?? []),
      ...Object.values(cs.talentChoices).flat(),
    ],
  };
}

// ✅ Returns true only if every group has exactly its requiredCount selected
export function areEntryChoicesComplete(career: Career, cs: CareerChoices): boolean {
  const skillOk = (career.skillAdvances.groups ?? []).every((g) =>
    (cs.skillChoices[g.groupId]?.length || 0) === g.requiredCount
  );
  const talentOk = (career.talentAdvances.groups ?? []).every((g) =>
    (cs.talentChoices[g.groupId]?.length || 0) === g.requiredCount
  );
  return skillOk && talentOk;
}

// Main validation function with improved ok/error pattern
export function safeFlattenIfValid(career: Career, cs: CareerChoices): ValidationResult {
  const issues = validateChoices(career, cs);
  
  if (issues.length > 0) {
    return { ok: false, issues };
  }
  
  const grants = getEntryGrants(career);
  const flattened = flattenGrants(grants, cs);
  return { 
    ok: true, 
    grants: { 
      grantSkills: flattened.grantSkills, 
      grantTalents: flattened.grantTalents 
    } 
  };
}

// Non-stackable talent enforcement (add your non-stackable talent list here)
const NON_STACKABLE_TALENTS = new Set<string>([
  // Add talent names that should not be selected multiple times
  // Example: 'ambidextrous', 'fearless', etc.
]);

export function checkNonStackableTalents(
  requiredTalents: Choice[], 
  chosenTalents: Choice[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const allTalents = [...requiredTalents, ...chosenTalents];
  const talentCounts = new Map<string, number>();
  
  allTalents.forEach(talent => {
    const key = refKey(talent);
    talentCounts.set(key, (talentCounts.get(key) || 0) + 1);
  });
  
  talentCounts.forEach((count, key) => {
    if (count > 1) {
      const [name] = key.split('|');
      if (NON_STACKABLE_TALENTS.has(name.toLowerCase())) {
        issues.push({
          code: 'NON_STACKABLE',
          groupId: 'non_stackable_check',
          groupType: 'talent',
          message: `Talent "${name}" is non-stackable and appears ${count} times (required + chosen)`,
          invalidChoice: name
        });
      }
    }
  });
  
  return issues;
}

// Enhanced validation with non-stackable check
export function safeFlattenIfValidWithStackCheck(career: Career, cs: CareerChoices): ValidationResult {
  const issues = validateChoices(career, cs);
  
  if (issues.length === 0) {
    const grants = getEntryGrants(career);
    const flattened = flattenGrants(grants, cs);
    
    // Check for non-stackable talents
    const stackIssues = checkNonStackableTalents(grants.requiredTalents, flattened.grantTalents);
    if (stackIssues.length > 0) {
      return { ok: false, issues: stackIssues };
    }
    
    return { 
      ok: true, 
      grants: { 
        grantSkills: flattened.grantSkills, 
        grantTalents: flattened.grantTalents 
      } 
    };
  }
  
  return { ok: false, issues };
}

/* ---------- BALANCE & CONSISTENCY CHECKS (updated for new schema) ---------- */

export function validateCareerBalance(career: Career): string[] {
  const warnings: string[] = [];
  
  const requiredSkills = career.skillAdvances.required?.length || 0;
  const totalChoiceSkills = career.skillAdvances.groups?.reduce((sum: number, g: PickGroup) => sum + g.requiredCount, 0) ?? 0; // ✅ Use requiredCount
  const totalSkills = requiredSkills + totalChoiceSkills;
  
  const requiredTalents = career.talentAdvances.required?.length || 0;
  const totalChoiceTalents = career.talentAdvances.groups?.reduce((sum: number, g: PickGroup) => sum + g.requiredCount, 0) ?? 0; // ✅ Use requiredCount
  const totalTalents = requiredTalents + totalChoiceTalents;
  
  if (career.type === 'basic' && totalTalents > 6) {
    warnings.push(`${career.name}: Has ${totalTalents} total talents (Basic careers usually have 4-6)`);
  }
  if (career.type === 'basic' && totalSkills > 8) {
    warnings.push(`${career.name}: Has ${totalSkills} total skills (Basic careers usually have 6-8)`);
  }
  if (career.type === 'advanced' && totalTalents < 3) {
    warnings.push(`${career.name}: Has only ${totalTalents} talents (Advanced careers usually have 3+)`);
  }
  
  // Check for data integrity issues
  career.skillAdvances.groups?.forEach((group: PickGroup) => {
    if (group.options.length < group.requiredCount) { // ✅ Use requiredCount
      warnings.push(`${career.name}: Skill group ${group.groupId} requires ${group.requiredCount} picks but only has ${group.options.length} options`);
    }
  });
  career.talentAdvances.groups?.forEach((group: PickGroup) => {
    if (group.options.length < group.requiredCount) { // ✅ Use requiredCount
      warnings.push(`${career.name}: Talent group ${group.groupId} requires ${group.requiredCount} picks but only has ${group.options.length} options`);
    }
  });
  
  return warnings;
}

// Pre-flight audit for catching data issues during development
export function validateAllCareers(careers: Career[]): { career: string; errors: string[]; warnings: string[] }[] {
  return careers.map(career => {
    const errors: string[] = [];
    const warnings = validateCareerBalance(career);
    
    // Check for structural issues
    career.skillAdvances.groups?.forEach((group: PickGroup) => {
      if (group.requiredCount <= 0) { // ✅ Use requiredCount
        errors.push(`Skill group ${group.groupId} has invalid requiredCount: ${group.requiredCount}`);
      }
      if (group.options.length === 0) {
        errors.push(`Skill group ${group.groupId} has no options`);
      }
    });
    career.talentAdvances.groups?.forEach((group: PickGroup) => {
      if (group.requiredCount <= 0) { // ✅ Use requiredCount
        errors.push(`Talent group ${group.groupId} has invalid requiredCount: ${group.requiredCount}`);
      }
      if (group.options.length === 0) {
        errors.push(`Talent group ${group.groupId} has no options`);
      }
    });
    
    return {
      career: career.name,
      errors,
      warnings
    };
  });
}