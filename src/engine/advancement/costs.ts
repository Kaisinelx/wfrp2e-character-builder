import { costCharacteristicAdvance, type MainCharKey, type SecondaryKey } from '../../data/tables/advancementCosts';

// Updated to work with your flat-rate system
export function nextCharCost(stat: MainCharKey | SecondaryKey): number {
  return costCharacteristicAdvance(stat);
}

// If you need the old signature (currentSteps parameter), here's a compatibility version:
export function nextCharCostBySteps(_currentSteps: number, stat: MainCharKey | SecondaryKey = 'WS'): number {
  // In your system, cost is flat regardless of current steps
  return costCharacteristicAdvance(stat);
}

// Alternative: if you want escalating costs based on steps (more realistic for RPGs)
export function nextCharCostProgressive(currentSteps: number, stat: MainCharKey | SecondaryKey): number {
  const baseCost = costCharacteristicAdvance(stat);
  
  // Example escalation: +50% cost every 4 advances
  const escalation = Math.floor(currentSteps / 4) * 0.5;
  return Math.round(baseCost * (1 + escalation));
}