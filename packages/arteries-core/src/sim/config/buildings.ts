/** Buildings, post specialisations and production sites. */
import type { BuildingType, Resource, SiteType, SpecType } from '../world/types';

export interface BuildingSpec {
  name: string;
  hp: number;
  icon: string;
  wood?: number;
  steel?: number;
}
export interface SpecSpec {
  name: string;
  icon: string;
  wood: number;
  steel: number;
  desc: string;
}
export interface SiteSpec {
  name: string;
  icon: string;
  res: Resource;
  /** production per second */
  y: number;
  /** resource name ending for notices (" руди") */
  em: string;
}

export const BUILDINGS: Record<BuildingType, BuildingSpec> = {
  hq: { name: 'Замок', hp: 900, icon: '★' },
  depot: { name: 'Торговий пост', hp: 320, wood: 60, steel: 10, icon: '▣' },
};

export const POST_SPECS: Record<SpecType, SpecSpec> = {
  forge: { name: 'Кузня', icon: '⚒', wood: 60, steel: 10, desc: 'Переплавляє руду на сталь' },
  barracks: {
    name: 'Сторожова вежа',
    icon: '⚔',
    wood: 60,
    steel: 20,
    desc: 'Тут можна наймати війська',
  },
  fort: {
    name: 'Фортеця',
    icon: '⛨',
    wood: 50,
    steel: 25,
    desc: 'Стріляє з мурів, ×2 міцність, дороги важче перерізати',
  },
};

export const SITE_TYPES: Record<SiteType, SiteSpec> = {
  mine: { name: 'Шахта', icon: '⛏', res: 'ore', y: 0.5, em: ' руди' },
  farm: { name: 'Ферма', icon: '🌾', res: 'food', y: 0.45, em: ' хліба' },
  vein: { name: 'Джерело мани', icon: '💎', res: 'crystal', y: 1 / 60, em: ' мани' },
  mill: { name: 'Лісорубка', icon: '🪓', res: 'wood', y: 0.3, em: ' дерева' },
};

export const SITE_WORKERS = 4;
