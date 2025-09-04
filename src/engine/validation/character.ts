import type { Draft } from '../../state/characterDraft';

export function validateCharacter(d: Draft): string[] {
  const errs: string[] = [];
  if (!d.raceId) errs.push("Race not selected.");
  if (!d.careerId) errs.push("Career not selected.");
  if (!d.hasRolled) errs.push("Characteristics not rolled.");
  return errs;
}