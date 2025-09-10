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
        OR("concealment_or_set_trap", [SKILL("Concealment"), SKILL("Set Trap")], 1),
        OR("animal_care_or_navigation", [SKILL("Animal Care"), SKILL("Navigation")], 1),
      ],
    },
    talentAdvances: {
      required: [],
      groups: [
        OR("excellent_vision_or_marksman", [TALENT("Excellent Vision"), TALENT("Marksman")], 1),
        OR("orientation_or_very_resilient", [TALENT("Orientation"), TALENT("Very Resilient")], 1),
      ],
    },
  },
];