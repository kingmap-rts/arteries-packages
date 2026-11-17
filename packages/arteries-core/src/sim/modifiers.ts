/** Numbers changed by paths and perks (radii, costs, speeds, capacities). */
import type {
  Building,
  BuildingType,
  Convoy,
  PerkId,
  Player,
  Resource,
  Unit,
  UnitType,
} from './world/types';
import { BUILDINGS, SITE_WORKERS } from './config/buildings';
import { CONVOY_CAP } from './config/economy';
import { POST_RADIUS, ROAD_LEN, BURN_TIME, ARSON_TIME } from './config/network';
import { UNITS } from './config/units';
import { G } from './state';

export const hasPerk = (p: Player | null | undefined, id: PerkId) =>
  !!p && p.perks && p.perks.includes(id);

export const ultimateOf = (p: Player) => (p && p.perks && p.perks.length >= 3 ? p.perks[2] : null);

export const roadLength = (p: Player | null | undefined) =>
  ROAD_LEN + (p && p.doc === 'guild' ? 2 : 0);

export const claimRadius = (b: Building) =>
  POST_RADIUS + (G.players[b.owner].doc === 'land' ? 1 : 0) + (b.rBonus || 0);

export const siteWorkers = (p: Player) => (hasPerk(p, 'labor') ? 2 : SITE_WORKERS);

export const arsonTime = (att: Player) => (att && att.doc === 'shadow' ? 4 : ARSON_TIME);

export const burnTime = (att: Player, def: Player) =>
  (hasPerk(att, 'burn60') ? 60 : BURN_TIME) * (hasPerk(def, 'repair') ? 0.5 : 1);

export const forgeBonus = (p: Player) => (p.doc === 'forge' ? 1.6 : 1);

export const yieldBonus = (p: Player, k: Resource) =>
  k === 'food' && hasPerk(p, 'bread') ? 1.25 : 1;

export const convoyCap = (p: Player) => (hasPerk(p, 'carav') ? 11 : CONVOY_CAP);

export const convoySpeed = (c: Convoy) =>
  (hasPerk(G.players[c.owner], 'carav') ? 1.4 : 1) *
  (c.key && (G.royal.get(c.key) || 0) > G.t ? 2 : 1);

export const deployTime = (u: Unit) =>
  hasPerk(G.players[u.owner], 'deploy') ? 1 : (UNITS[u.type].deploy ?? 0);

export const ammoMax = (u: Unit) =>
  UNITS[u.type].ammo * (hasPerk(G.players[u.owner], 'ammo') ? 1.5 : 1);

export function buildCost(p: Player, type: BuildingType) {
  const c = BUILDINGS[type];
  return hasPerk(p, 'cheap') ? { wood: c.wood! * 0.7, steel: c.steel! * 0.7 } : c;
}

export function unitCost(p: Player, type: UnitType) {
  const S = UNITS[type];
  if (type === 'siege' && hasPerk(p, 'cheapsiege'))
    return { steel: S.steel * 0.75, wood: S.wood * 0.75, food: S.food, pop: S.pop };
  return S;
}
