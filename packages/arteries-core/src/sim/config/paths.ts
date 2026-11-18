/** Paths: costs, unique units, tier perks and the ultimate cooldown. */
import type {
  PathId,
  PathSpec,
  PerkId,
  PerkSpec,
} from '@kingmap-rts/arteries-types';

// Chosen in the match with mana crystals. Tier 1 (3💎): trait + unique unit. Tiers 2-4: pick one of two.
export const PATH_COST: number[] = [3, 4, 6, 9];

export const ULT_COOLDOWN = 180;

export const PATHS: Record<PathId, PathSpec> = {
  guild: {
    unit: 'builder',
    perks: [
      ['carav', 'cheap'],
      ['repair', 'reach'],
      ['ward', 'road'],
    ],
  },
  shadow: {
    unit: 'arsonist',
    perks: [
      ['burn60', 'tough'],
      ['bag', 'scorch'],
      ['panic', 'night'],
    ],
  },
  forge: {
    unit: 'golem',
    perks: [
      ['cheapsiege', 'deploy'],
      ['ammo', 'walls'],
      ['rain', 'rally'],
    ],
  },
  land: {
    unit: 'militia',
    perks: [
      ['bread', 'growth'],
      ['labor', 'granary'],
      ['pitch', 'charter'],
    ],
  },
};

export const PERKS: Record<PerkId, PerkSpec> = {
  carav: {},
  cheap: {},
  repair: {},
  reach: {},
  ward: {
    ult: 1,
  },
  road: {
    ult: 1,
  },
  burn60: {},
  tough: {},
  bag: {},
  scorch: {},
  panic: { ult: 1 },
  night: { ult: 1 },
  cheapsiege: {},
  deploy: {},
  ammo: {},
  walls: {},
  rain: {
    ult: 1,
  },
  rally: {
    ult: 1,
  },
  bread: {},
  growth: {},
  labor: {},
  granary: {},
  pitch: { ult: 1 },
  charter: {
    ult: 1,
  },
};
