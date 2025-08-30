import type { Career, Choice, CareerClass, PickGroup } from '../data/basic_careers/_types';

export type CareerChoices = {
  skillChoices: Record<number, Choice[]>;  // index into skill groups
  talentChoices: Record<number, Choice[]>; // index into talent groups
};

export type EntryGrant = {
  requiredSkills: Choice[];
  requiredTalents: Choice[];
  skillChoiceGroups: PickGroup[];
  talentChoiceGroups: PickGroup[];
};

export function getEntryGrants(career: Career): EntryGrant {
  return {
    requiredSkills: career.skillAdvances.required ?? [],
    requiredTalents: career.talentAdvances.required ?? [],
    skillChoiceGroups: career.skillAdvances.groups ?? [],
    talentChoiceGroups: career.talentAdvances.groups ?? [],
  };
}

export function validateChoices(career: Career, cs: CareerChoices): string[] {
  const errs: string[] = [];
  
  career.skillAdvances.groups?.forEach((g: PickGroup, i: number) => {
    const chosen = cs.skillChoices[i] ?? [];
    if (chosen.length !== g.pick) {
      errs.push(`Pick exactly ${g.pick} skill(s) in group ${i + 1}.`);
    }
    
    // Validate chosen options exist in the group
    chosen.forEach(choice => {
      const exists = g.options.some((opt: Choice) => 
        opt.name === choice.name && opt.spec === choice.spec
      );
      if (!exists) {
        errs.push(`Invalid skill choice: ${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`);
      }
    });
  });
  
  career.talentAdvances.groups?.forEach((g: PickGroup, i: number) => {
    const chosen = cs.talentChoices[i] ?? [];
    if (chosen.length !== g.pick) {
      errs.push(`Pick exactly ${g.pick} talent(s) in group ${i + 1}.`);
    }
    
    // Validate chosen options exist in the group
    chosen.forEach(choice => {
      const exists = g.options.some((opt: Choice) => 
        opt.name === choice.name && opt.spec === choice.spec
      );
      if (!exists) {
        errs.push(`Invalid talent choice: ${choice.name}${choice.spec ? ` (${choice.spec})` : ''}`);
      }
    });
  });
  
  return errs;
}

export function flattenGrants(gr: EntryGrant, cs: CareerChoices) {
  return {
    grantSkills: [
      ...gr.requiredSkills,
      ...Object.values(cs.skillChoices).flat(),
    ],
    grantTalents: [
      ...gr.requiredTalents,
      ...Object.values(cs.talentChoices).flat(),
    ],
  };
}

export function validateCareerBalance(career: Career): string[] {
  const warnings: string[] = [];
  
  // Calculate total skills (required + all possible choices)
  const requiredSkills = career.skillAdvances.required.length;
  const totalChoiceSkills = career.skillAdvances.groups?.reduce((sum: number, g: PickGroup) => sum + g.pick, 0) ?? 0;
  const totalSkills = requiredSkills + totalChoiceSkills;
  
  // Calculate total talents
  const requiredTalents = career.talentAdvances.required.length;
  const totalChoiceTalents = career.talentAdvances.groups?.reduce((sum: number, g: PickGroup) => sum + g.pick, 0) ?? 0;
  const totalTalents = requiredTalents + totalChoiceTalents;
  
  // Check talent count (Basic careers usually have 4-6 core talents)
  if (career.type === 'basic' && totalTalents > 6) {
    warnings.push(`${career.name}: Has ${totalTalents} total talents (Basic careers usually have 4-6)`);
  }
  
  // Check skill count (Basic careers usually have 6-8 skills)
  if (career.type === 'basic' && totalSkills > 8) {
    warnings.push(`${career.name}: Has ${totalSkills} total skills (Basic careers usually have 6-8)`);
  }
  
  // Advanced careers typically have more
  if (career.type === 'advanced' && totalTalents < 3) {
    warnings.push(`${career.name}: Has only ${totalTalents} talents (Advanced careers usually have 3+)`);
  }
  
  // Check magic consistency
  if (career.isMagicalCareer && !career.magicFloor) {
    warnings.push(`${career.name}: Marked as magical but has no magicFloor`);
  }
  
  if (!career.isMagicalCareer && career.magicFloor) {
    warnings.push(`${career.name}: Has magicFloor but not marked as magical`);
  }
  
  // Check for empty choice groups
  career.skillAdvances.groups?.forEach((group: PickGroup, index: number) => {
    if (group.options.length < group.pick) {
      warnings.push(`${career.name}: Skill group ${index + 1} requires ${group.pick} picks but only has ${group.options.length} options`);
    }
  });
  
  career.talentAdvances.groups?.forEach((group: PickGroup, index: number) => {
    if (group.options.length < group.pick) {
      warnings.push(`${career.name}: Talent group ${index + 1} requires ${group.pick} picks but only has ${group.options.length} options`);
    }
  });
  
  return warnings;
}

export function checkCareerClassConsistency(careers: Career[]): string[] {
  const validClasses: CareerClass[] = ['Academic', 'Ranger', 'Warrior', 'Criminal', 'Commoner'];
  const warnings: string[] = [];
  
  careers.forEach(career => {
    if (!validClasses.includes(career.careerClass)) {
      warnings.push(`${career.name}: Invalid career class '${career.careerClass}'`);
    }
  });
  
  return warnings;
}

export function validateChoiceGroups(career: Career): string[] {
  const errors: string[] = [];
  
  // Check skill groups
  career.skillAdvances.groups?.forEach((group: PickGroup, index: number) => {
    if (group.pick <= 0) {
      errors.push(`${career.name}: Skill group ${index + 1} has invalid pick count: ${group.pick}`);
    }
    if (group.pick > group.options.length) {
      errors.push(`${career.name}: Skill group ${index + 1} requires ${group.pick} picks but only has ${group.options.length} options`);
    }
    if (group.options.length === 0) {
      errors.push(`${career.name}: Skill group ${index + 1} has no options`);
    }
  });
  
  // Check talent groups
  career.talentAdvances.groups?.forEach((group: PickGroup, index: number) => {
    if (group.pick <= 0) {
      errors.push(`${career.name}: Talent group ${index + 1} has invalid pick count: ${group.pick}`);
    }
    if (group.pick > group.options.length) {
      errors.push(`${career.name}: Talent group ${index + 1} requires ${group.pick} picks but only has ${group.options.length} options`);
    }
    if (group.options.length === 0) {
      errors.push(`${career.name}: Talent group ${index + 1} has no options`);
    }
  });
  
  return errors;
}

export function validateAllCareers(careers: Career[]): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  careers.forEach(career => {
    errors.push(...validateChoiceGroups(career));
    warnings.push(...validateCareerBalance(career));
  });
  
  warnings.push(...checkCareerClassConsistency(careers));
  
  return { errors, warnings };
}