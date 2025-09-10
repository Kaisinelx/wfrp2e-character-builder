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
        OR("charm_or_scale_sheer_surface", [SKILL("Charm"), SKILL("Scale Sheer Surface")], 1),
        OR("evaluate_or_disguise", [SKILL("Evaluate"), SKILL("Disguise")], 1),
        OR("gamble_or_pick_lock", [SKILL("Gamble"), SKILL("Pick Lock")], 1),
        OR("read_write_or_sleight_of_hand", [SKILL("Read/Write"), SKILL("Sleight of Hand")], 1),
        OR("secret_language_or_secret_signs", [SKILL("Secret Language", "Thieves' Tongue"), SKILL("Secret Signs", "Thief")], 1),
      ],
    },
    talentAdvances: {
      required: [],
      groups: [
        OR("alley_cat_or_streetwise", [TALENT("Alley Cat"), TALENT("Streetwise")], 1),
        OR("super_numerate_or_trapfinder", [TALENT("Super Numerate"), TALENT("Trapfinder")], 1),
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
        OR("gossip_or_secret_language", [SKILL("Gossip"), SKILL("Secret Language", "Thieves' Tongue")], 1),
        OR("speak_language_or_secret_signs", [SKILL("Speak Language", "Breton"), SKILL("Speak Language", "Kislevian"), SKILL("Secret Signs", "Thief")], 1),
      ],
    },
    talentAdvances: {
      required: [],
      groups: [
        OR("dealmaker_or_streetwise", [TALENT("Dealmaker"), TALENT("Streetwise")], 1),
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
        OR("gossip_or_haggle", [SKILL("Gossip"), SKILL("Haggle")], 1),
      ],
    },
    talentAdvances: {
      required: [
        TALENT("Flee!"),
        TALENT("Resistance to Disease"),
      ],
      groups: [
        OR("streetwise_or_strongminded", [TALENT("Streetwise"), TALENT("Strongminded")], 1),
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