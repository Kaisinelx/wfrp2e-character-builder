// src/data/careers/class.academic.ts
import type { Career } from "./_types";
import { SKILL, TALENT, OR } from "./_fragments";

export const CLASS_ACADEMIC: Career[] = [
  {
    id: "mediator",
    name: "Mediator",
    type: "basic",
    careerClass: "Academic",
    description: "Negotiator skilled in de‑escalation and deal‑making.",
    skillAdvances: {
      required: [
        SKILL("Common Knowledge", "Bretonnia"),
        SKILL("Evaluate"),
        SKILL("Gossip"),
        SKILL("Haggle"),
        SKILL("Intimidate"),
        SKILL("Perception"),
      ],
      groups: [
        OR("animal_care_or_charm", [SKILL("Animal Care"), SKILL("Charm")], 1), // your example
      ],
    },
    talentAdvances: {
      required: [
        TALENT("Dealmaker"),
        TALENT("Public Speaking"),
      ],
      groups: [
        OR("seasoned_traveller_or_suave", [TALENT("Seasoned Traveller"), TALENT("Suave")], 1), // pick one
      ],
    },
  },
];
