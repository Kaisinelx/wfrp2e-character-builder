// src/data/careers/class.academic.ts
import type { Career } from "./_types";
import { SKILL, TALENT} from "./_fragments";

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
        { groupId: "acad-01", requiredCount: 1, options: [SKILL("Animal Care"), SKILL("Charm")] }, // ✅ Updated from OR helper
      ],
    },
    talentAdvances: {
      required: [
        TALENT("Dealmaker"),
        TALENT("Public Speaking"),
      ],
      groups: [
        { groupId: "acad-02", requiredCount: 1, options: [TALENT("Seasoned Traveller"), TALENT("Suave")] }, // ✅ Updated from OR helper
      ],
    },
  },
];