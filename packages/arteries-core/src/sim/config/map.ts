/** Map size, terrain and deposit codes, realm colours and names. */
import { MAX_PLAYERS } from '@caspen13/arteries-protocol';

/** seats on the ring of start positions (people + bots) */
export const SEATS = MAX_PLAYERS;

export const TILE_PX = 20;

export const MAP_W = 120;

export const MAP_H = 80;

export const TILES = MAP_W * MAP_H;

/** what a tile is made of; soldiers walk and posts stand on plains and forests */
export const Terrain = { Water: 0, Plain: 1, Forest: 2, Mountain: 3 } as const;
export type TerrainCode = (typeof Terrain)[keyof typeof Terrain];

/** what lies in a tile and feeds the post whose land covers it */
export const Deposit = { None: 0, Ore: 1, Grain: 2, Crystal: 3 } as const;
export type DepositCode = (typeof Deposit)[keyof typeof Deposit];

// bright, clearly distinct realm colours (no green: it would vanish on grass)
export const COLORS = [
  '#1f6fe0',
  '#e0302a',
  '#f2c230',
  '#8e44d6',
  '#f07a1a',
  '#12b5c8',
  '#e8489a',
  '#f4f1e8',
  '#2b2f3a',
  '#8b5a2b',
];

export const NAMES = [
  'Ти',
  'Королівство Ельмор',
  'Князівство Варн',
  'Гномячий Кряж',
  'Ельфійський Доль',
  'Орден Ворона',
  'Вільні Міста',
  'Степові Хани',
  'Морська Гільдія',
  'Болотяні Клани',
];

export const CENTRE_OVAL = 0.34;
