import type { BasicCareer, AdvancedCareer } from "./_types";
import { SKILL, TALENT, OR } from "./_fragments";

export const CLASS_CRIMINAL: (BasicCareer | AdvancedCareer)[] = [
  {
    id: "thief",
    name: "Thief",
    type: "basic",
    careerClass: "Criminal",
    description: "Sneaky burglar and pickpocket.",
    skillAdvances: {
      required: [
        SKILL("Concealment"),
        SKILL("Perception"),
        SKILL("Search"),
        SKILL("Silent Move"),
      ],
      groups: [
        OR([SKILL("Charm"), SKILL("Scale Sheer Surface")], 1),
        OR([SKILL("Evaluate"), SKILL("Disguise")], 1),
        OR([SKILL("Gamble"), SKILL("Pick Lock")], 1),
        OR([SKILL("Read/Write"), SKILL("Sleight of Hand")], 1),
        OR([SKILL("Secret Language", "Thieves' Tongue"), SKILL("Secret Signs", "Thief")], 1),
      ],
    },
    talentAdvances: {
      required: [],
      groups: [
        OR([TALENT("Alley Cat"), TALENT("Streetwise")], 1),
        OR([TALENT("Super Numerate"), TALENT("Trapfinder")], 1),
      ],
    },
  },
  {
    id: "smuggler",
    name: "Smuggler",
    type: "basic",
    careerClass: "Criminal",
    description: "Illicit goods transporter.",
    skillAdvances: {
      required: [
        SKILL("Drive"),
        SKILL("Evaluate"),
        SKILL("Haggle"),
        SKILL("Perception"),
        SKILL("Row"),
        SKILL("Search"),
        SKILL("Silent Move"),
        SKILL("Swim"),
      ],
      groups: [
        OR([SKILL("Gossip"), SKILL("Secret Language", "Thieves' Tongue")], 1),
        OR([SKILL("Speak Language", "Breton"), SKILL("Speak Language", "Kislevian"), SKILL("Secret Signs", "Thief")], 1),
      ],
    },
    talentAdvances: {
      required: [],
      groups: [
        OR([TALENT("Dealmaker"), TALENT("Streetwise")], 1),
      ],
    },
  },
  {
    id: "grave-robber",
    name: "Grave Robber",
    type: "basic",
    careerClass: "Criminal",
    description: "Tomb-delving scoundrel.",
    skillAdvances: {
      required: [
        SKILL("Drive"),
        SKILL("Perception"),
        SKILL("Scale Sheer Surface"),
        SKILL("Search"),
        SKILL("Secret Signs", "Thief"),
        SKILL("Silent Move"),
      ],
      groups: [
        OR([SKILL("Gossip"), SKILL("Haggle")], 1),
      ],
    },
    talentAdvances: {
      required: [
        TALENT("Flee!"),
        TALENT("Resistance to Disease"),
      ],
      groups: [
        OR([TALENT("Streetwise"), TALENT("Strongminded")], 1),
      ],
    },
  },
  // Advanced Criminal Careers
  {
    id: "master-thief",
    name: "Master Thief",
    type: "advanced",
    tier: 2,
    careerClass: "Criminal",
    description: "Elite burglar and gang leader.",
    skillAdvances: {
      required: [
        SKILL("Charm"),
        SKILL("Command"),
        SKILL("Evaluate"),
        SKILL("Intimidate"),
        SKILL("Leadership"),
      ],
    },
    talentAdvances: {
      required: [
        TALENT("Ambidextrous"),
        TALENT("Cat-like Balance"),
      ],
    },
  },
];