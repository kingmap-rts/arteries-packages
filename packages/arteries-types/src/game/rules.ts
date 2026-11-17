// The shapes of the rule tables (the numbers live in @caspen13/arteries-core → rules).
import type { PathId, PerkId, Resource, UnitType } from './vocabulary';

export interface UnitSpec {
  hp: number;
  dmg: number;
  range: number;
  /** seconds between blows */
  cd: number;
  speed: number;
  steel: number;
  wood: number;
  food: number;
  /** people it takes (default 1) */
  pop?: number;
  /** food eaten per second */
  upk: number;
  /** damage multipliers against caravans, buildings and units */
  vsC: number;
  vsB: number;
  vsU?: number;
  /** distance at which it notices enemies */
  aggro: number;
  /** arrows carried */
  ammo: number;
  /** steel per arrow (default AMMO_COST) */
  ammoCost?: number;
  /** fights without arrows */
  noAmmo?: boolean;
  /** seconds standing still before it can fire */
  deploy?: number;
  /** only for this path */
  doc?: PathId;
}

export interface BuildingSpec {
  hp: number;
  icon: string;
  wood?: number;
  steel?: number;
}

export interface SpecSpec {
  icon: string;
  wood: number;
  steel: number;
}

export interface SiteSpec {
  icon: string;
  res: Resource;
  /** production per second */
  y: number;
}

export interface PathSpec {
  /** unique unit of the path */
  unit: UnitType;
  /** tiers 2-4: pick one of two */
  perks: [PerkId, PerkId][];
}

export interface PerkSpec {
  /** tier-4 ability used with cast */
  ult?: 1;
}
