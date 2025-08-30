import type { BasicCareer, AdvancedCareer } from "./_types";
import { SKILL, TALENT, OR } from "./_fragments";

export const CLASS_RANGER: (BasicCareer | AdvancedCareer)[] = [
  {
    id: "hunter",
    name: "Hunter",
    type: "basic",
    careerClass: "Ranger",
    description: "Wilderness tracker and game hunter.",
    skillAdvances: {
      required: [
        SKILL("Follow Trail"),
        SKILL("Outdoor Survival"),
        SKILL("Perception"),
        SKILL("Search"),
      ],
      groups: [
        OR([SKILL("Concealment"), SKILL("Set Trap")], 1),
        OR([SKILL("Animal Care"), SKILL("Navigation")], 1),
      ],
    },
    talentAdvances: {
      required: [],
      groups: [
        OR([TALENT("Excellent Vision"), TALENT("Marksman")], 1),
        OR([TALENT("Orientation"), TALENT("Very Resilient")], 1),
      ],
    },
  },
];