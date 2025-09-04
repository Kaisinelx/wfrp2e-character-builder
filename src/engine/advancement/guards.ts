/**
 * Purchase guards adapted to your existing type system
 */
import type { 
  GuardResult,
  MainCharacteristic,
  SecondaryCharacteristic,
  CareerTemplate
} from '../../types/wfrp';
import { ADV_COSTS, isSecondary } from '../../data/tables/advancementCosts';

interface GuardContext {
  xpUnspent: number;
  currentCareer?: CareerTemplate;
  characteristicAdvances: Record<string, number>;
  skillLevels: Record<string, number>;
  acquiredTalents: Set<string>;
}

export function guardCharacteristic(
  ctx: GuardContext, 
  key: MainCharacteristic | SecondaryCharacteristic
): GuardResult {
  // Must have active career
  if (!ctx.currentCareer) {
    return {
      ok: false,
      reason: 'NO_ACTIVE_CAREER',
      message: 'No active career selected'
    };
  }

  // Use your existing cost system
  const cost = isSecondary(key) 
    ? ADV_COSTS.characteristicSecondaryPerStep 
    : ADV_COSTS.characteristicMainPerStep;
  
  // Check XP availability
  if (ctx.xpUnspent < cost) {
    return {
      ok: false,
      reason: 'INSUFFICIENT_XP',
      message: `Need ${cost} XP, have ${ctx.xpUnspent}`,
      cost
    };
  }

  // Check career cap (from characteristicAdvances)
  const advanceScheme = ctx.currentCareer.characteristicAdvances;
  const cap = advanceScheme?.[key] || 0;
  const currentAdvances = ctx.characteristicAdvances[key] || 0;
  
  if (currentAdvances >= cap) {
    return {
      ok: false,
      reason: 'AT_CAP_FOR_CAREER',
      message: `${key} is at career cap (${cap} advances)`,
      details: { cap, current: currentAdvances }
    };
  }

  return {
    ok: true,
    reason: 'OK',
    message: 'Purchase allowed',
    cost
  };
}

export function guardSkill(
  ctx: GuardContext, 
  skillId: string, 
  targetLevel: number
): GuardResult {
  if (!ctx.currentCareer) {
    return {
      ok: false,
      reason: 'NO_ACTIVE_CAREER',
      message: 'No active career selected'
    };
  }

  // Validate target level
  if (targetLevel < 1 || targetLevel > 3) {
    return {
      ok: false,
      reason: 'INVALID_TARGET',
      message: 'Skill level must be 1-3'
    };
  }

  const currentLevel = ctx.skillLevels[skillId] || 0;
  
  // Must advance one level at a time
  if (targetLevel !== currentLevel + 1) {
    return {
      ok: false,
      reason: 'MISSING_PREREQUISITE',
      message: `Must advance skills sequentially. Currently at level ${currentLevel}`
    };
  }

  // Use your cost system
  let cost: number;
  switch (targetLevel) {
    case 1: cost = ADV_COSTS.skillAcquire; break;
    case 2: cost = ADV_COSTS.skillImprove10; break;
    case 3: cost = ADV_COSTS.skillImprove20; break;
    default: throw new Error(`Invalid skill level: ${targetLevel}`);
  }
  
  if (ctx.xpUnspent < cost) {
    return {
      ok: false,
      reason: 'INSUFFICIENT_XP',
      message: `Need ${cost} XP, have ${ctx.xpUnspent}`,
      cost
    };
  }

  return {
    ok: true,
    reason: 'OK',
    message: 'Purchase allowed',
    cost
  };
}

export function guardTalent(
  ctx: GuardContext, 
  talentId: string
): GuardResult {
  if (!ctx.currentCareer) {
    return {
      ok: false,
      reason: 'NO_ACTIVE_CAREER',
      message: 'No active career selected'
    };
  }

  // Check if already acquired (assume non-stackable for now)
  if (ctx.acquiredTalents.has(talentId)) {
    return {
      ok: false,
      reason: 'TALENT_NOT_STACKABLE',
      message: 'Talent already acquired'
    };
  }

  const cost = ADV_COSTS.talentAcquire;
  
  if (ctx.xpUnspent < cost) {
    return {
      ok: false,
      reason: 'INSUFFICIENT_XP',
      message: `Need ${cost} XP, have ${ctx.xpUnspent}`,
      cost
    };
  }

  return {
    ok: true,
    reason: 'OK',
    message: 'Purchase allowed',
    cost
  };
}