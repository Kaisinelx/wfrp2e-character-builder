// Types
export interface SkillChoice {
  name: string;
  spec?: string;
}

export interface TalentChoice {
  name: string;
  spec?: string;
}

export interface RangeValue {
  min: number;
  max: number;
  value: number;
}

export interface RaceData {
  id: string;
  name: string;
  description: string;
  move: number;
  startingCharacteristics: {
    WS: number;
    BS: number;
    S: number;
    T: number;
    Ag: number;
    Int: number;
    WP: number;
    Fel: number;
  };
  woundsTable: RangeValue[];
  fateTable: RangeValue[];
  skills: {
    required: SkillChoice[];
    choices?: Array<{ pick: number; options: SkillChoice[] }>;
  };
  talents: {
    required: TalentChoice[];
    choices?: Array<{ pick: number; options: TalentChoice[] }>;
    random?: { count: number; options: TalentChoice[] };
  };
  specialRules?: {
    required?: string[];
    choices?: Array<{ pick: number; options: string[] }>;
  };
}

export const WFRP_RACES: RaceData[] = [
  // HUMAN - RAW WFRP2e
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile, ambitious, and everywhere in the Old World.',
    move: 4,
    startingCharacteristics: {
      WS: 20, BS: 20, S: 20, T: 20,
      Ag: 20, Int: 20, WP: 20, Fel: 20
    },
    woundsTable: [
      { min: 1, max: 3, value: 10 },
      { min: 4, max: 6, value: 11 },
      { min: 7, max: 9, value: 12 },
      { min: 10, max: 10, value: 13 }
    ],
    fateTable: [
      { min: 1, max: 4, value: 2 },
      { min: 5, max: 7, value: 3 },
      { min: 8, max: 10, value: 3 }
    ],
    skills: {
      required: [
        { name: 'Common Knowledge', spec: 'the Empire' },
        { name: 'Gossip' },
        { name: 'Speak Language', spec: 'Reikspiel' }
      ]
    },
    talents: {
      required: [],
      random: {
        count: 2,
        options: [
          { name: 'Acute Hearing' }, { name: 'Ambidextrous' }, { name: 'Coolheaded' },
          { name: 'Excellent Vision' }, { name: 'Fleet Footed' }, { name: 'Hardy' },
          { name: 'Lightning Reflexes' }, { name: 'Luck' }, { name: 'Marksman' },
          { name: 'Mimic' }, { name: 'Night Vision' }, { name: 'Resistance to Disease' },
          { name: 'Resistance to Magic' }, { name: 'Resistance to Poison' }, { name: 'Savvy' },
          { name: 'Sixth Sense' }, { name: 'Strong-minded' }, { name: 'Sturdy' },
          { name: 'Suave' }, { name: 'Super Numerate' }, { name: 'Very Resilient' },
          { name: 'Very Strong' }, { name: 'Warrior Born' }
        ]
      }
    }
  },

  // DWARF - RAW WFRP2e  
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Hardy folk of the mountains; stubborn, skilled, and grim.',
    move: 3,
    startingCharacteristics: {
      WS: 30, BS: 20, S: 20, T: 30,
      Ag: 10, Int: 20, WP: 20, Fel: 10
    },
    woundsTable: [
      { min: 1, max: 3, value: 11 }, { min: 4, max: 6, value: 12 },
      { min: 7, max: 9, value: 13 }, { min: 10, max: 10, value: 14 }
    ],
    fateTable: [
      { min: 1, max: 4, value: 1 }, { min: 5, max: 7, value: 2 }, { min: 8, max: 10, value: 3 }
    ],
    skills: {
      required: [
        { name: 'Common Knowledge', spec: 'Dwarfs' },
        { name: 'Speak Language', spec: 'Khazalid' },
        { name: 'Speak Language', spec: 'Reikspiel' }
      ],
      choices: [{ pick: 1, options: [
        { name: 'Trade', spec: 'Miner' }, { name: 'Trade', spec: 'Smith' }, { name: 'Trade', spec: 'Stoneworker' }
      ]}]
    },
    talents: {
      required: [
        { name: 'Dwarfcraft' }, { name: 'Grudge-born Fury' }, { name: 'Night Vision' },
        { name: 'Resistance to Magic' }, { name: 'Stout-hearted' }, { name: 'Sturdy' }
      ]
    }
  },

  // ELF - RAW WFRP2e
  {
    id: 'elf',
    name: 'Elf', 
    description: 'Graceful, long-lived, with keen senses and a touch of the arcane.',
    move: 5,
    startingCharacteristics: {
      WS: 20, BS: 30, S: 20, T: 20,
      Ag: 30, Int: 20, WP: 20, Fel: 20
    },
    woundsTable: [
      { min: 1, max: 3, value: 9 }, { min: 4, max: 6, value: 10 },
      { min: 7, max: 9, value: 11 }, { min: 10, max: 10, value: 12 }
    ],
    fateTable: [
      { min: 1, max: 4, value: 1 }, { min: 5, max: 7, value: 2 }, { min: 8, max: 10, value: 2 }
    ],
    skills: {
      required: [
        { name: 'Common Knowledge', spec: 'Elves' },
        { name: 'Speak Language', spec: 'Eltharin' },
        { name: 'Speak Language', spec: 'Reikspiel' }
      ]
    },
    talents: {
      required: [{ name: 'Excellent Vision' }, { name: 'Night Vision' }],
      choices: [
        { pick: 1, options: [
          { name: 'Aethyric Attunement' }, { name: 'Specialist Weapon Group', spec: 'Longbow' }
        ]},
        { pick: 1, options: [{ name: 'Coolheaded' }, { name: 'Savvy' }]}
      ]
    }
  },

  // HALFLING - RAW WFRP2e
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small, cheerful, resilient, and surprisingly lucky.',
    move: 4,
    startingCharacteristics: {
      WS: 10, BS: 30, S: 10, T: 10,
      Ag: 30, Int: 20, WP: 20, Fel: 30
    },
    woundsTable: [
      { min: 1, max: 3, value: 8 }, { min: 4, max: 6, value: 9 },
      { min: 7, max: 9, value: 10 }, { min: 10, max: 10, value: 11 }
    ],
    fateTable: [
      { min: 1, max: 4, value: 2 }, { min: 5, max: 7, value: 2 }, { min: 8, max: 10, value: 3 }
    ],
    skills: {
      required: [
        { name: 'Academic Knowledge', spec: 'Genealogy/Heraldry' },
        { name: 'Common Knowledge', spec: 'Halflings' }, { name: 'Gossip' },
        { name: 'Speak Language', spec: 'Halfling' }, { name: 'Speak Language', spec: 'Reikspiel' }
      ],
      choices: [{ pick: 1, options: [{ name: 'Trade', spec: 'Cook' }, { name: 'Trade', spec: 'Farmer' }]}]
    },
    talents: {
      required: [
        { name: 'Night Vision' }, { name: 'Resistance to Chaos' }, 
        { name: 'Specialist Weapon Group', spec: 'Sling' }
      ],
      random: { count: 1, options: [
        { name: 'Acute Hearing' }, { name: 'Ambidextrous' }, { name: 'Coolheaded' },
        { name: 'Excellent Vision' }, { name: 'Fleet Footed' }, { name: 'Hardy' },
        { name: 'Lightning Reflexes' }, { name: 'Luck' }, { name: 'Marksman' },
        { name: 'Mimic' }, { name: 'Resistance to Disease' }, { name: 'Resistance to Magic' },
        { name: 'Resistance to Poison' }, { name: 'Savvy' }, { name: 'Sixth Sense' },
        { name: 'Strong-minded' }, { name: 'Sturdy' }, { name: 'Suave' },
        { name: 'Super Numerate' }, { name: 'Very Resilient' }, { name: 'Very Strong' },
        { name: 'Warrior Born' }
      ]}
    }
  },

  // VORYN - Custom Race
  {
    id: 'voryn',
    name: 'Voryn',
    description: 'Forest-dwelling people with one foot in the spirit world. Graceful, wary, and deeply tied to the wilds.',
    move: 4,
    startingCharacteristics: {
      WS: 20, BS: 20, S: 15, T: 20,
      Ag: 25, Int: 20, WP: 25, Fel: 15
    },
    woundsTable: [
      { min: 1, max: 3, value: 8 }, { min: 4, max: 6, value: 9 },
      { min: 7, max: 9, value: 10 }, { min: 10, max: 10, value: 11 }
    ],
    fateTable: [
      { min: 1, max: 4, value: 1 }, { min: 5, max: 7, value: 2 }, { min: 8, max: 10, value: 3 }
    ],
    skills: {
      required: [
        { name: 'Common Knowledge', spec: 'Voryn' },
        { name: 'Speak Language', spec: 'Albion' },
        { name: 'Speak Language', spec: 'Common' }
      ]
    },
    talents: {
      required: [{ name: 'Wraithskin' }, { name: 'Otherworldly' }, { name: 'Sixth Sense' }],
      choices: [{ pick: 1, options: [{ name: 'Suave' }, { name: 'Savvy' }]}]
    },
    specialRules: {
      choices: [{ pick: 1, options: [
        'Forest Harmony: Move through forests without penalty; +10% Stealth tests in forests.',
        'Spirit Kin: +10% Fel vs forest creatures/spirits, and +10% WP tests vs Fear/Terror caused by Spirits.'
      ]}]
    }
  }
];

// Helper functions - Updated to use unified rollFromTable
export function getRaceById(id: string): RaceData | undefined {
  return WFRP_RACES.find(race => race.id === id);
}

export function rollRandomTalentsForRace(raceId: string): TalentChoice[] {
  const race = getRaceById(raceId);
  if (!race?.talents.random) return [];
  
  const { count, options } = race.talents.random;
  const picks: TalentChoice[] = [];
  const pool = [...options];
  
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  
  return picks;
}

// Utility function for manual table resolution (if needed)
export function resolveFromTable(table: RangeValue[], roll: number): number {
  const row = table.find(r => roll >= r.min && roll <= r.max);
  return row ? row.value : table[table.length - 1].value;
}