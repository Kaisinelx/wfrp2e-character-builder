// src/data/careers/class.warrior.ts
import type { Career } from "./_types";
import { SKILL, TALENT } from "./_fragments";

export const CLASS_WARRIOR: Career[] = [
  {
    id: "militiaman",
    name: "Militiaman",
    type: "basic",
    careerClass: "Warrior",
    description: "Local levy/watch fighter.",
    group: "Soldier",
    skillAdvances: {
      required: [
        SKILL("Dodge Blow"),
        SKILL("Melee", "Basic"),
        SKILL("Perception"),
        SKILL("Search"),
      ],
    },
    talentAdvances: {
      required: [
        TALENT("Strike Mighty Blow"),
      ],
    },
  },
];
