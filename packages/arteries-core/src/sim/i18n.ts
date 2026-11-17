/** Display language. Text only: nothing here touches the simulated state, so players in one online game can use different languages. */
import { BUILDINGS, SITE_TYPES, POST_SPECS } from './config/buildings';
import { PINGS } from './config/diplomacy';
import { NAMES } from './config/map';
import { PATHS, PERKS } from './config/paths';
import { UNITS } from './config/units';
import { G } from './state';
import type {
  BuildingType,
  PathId,
  PerkId,
  PingKind,
  SiteType,
  SpecType,
  UnitType,
} from './world/types';

export type Lang = 'uk' | 'en';

/** every display string of the rule tables, in one language */
interface Texts {
  names: string[];
  UT: Record<UnitType, string>;
  BT: Record<BuildingType, string>;
  SPEC: Record<SpecType, [name: string, desc: string]>;
  SITE: Record<SiteType, [name: string, ending: string]>;
  DOCS: Record<PathId, [name: string, trait: string]>;
  PERKS: Record<PerkId, [name: string, desc: string]>;
  PINGS: Record<PingKind, string>;
}

export let LANG: Lang = 'uk';

export const loc = (uk: string, en: string) => (LANG === 'en' ? en : uk);

export const EN: Texts = {
  names: [
    'You',
    'Kingdom of Elmor',
    'Principality of Varn',
    'Dwarven Ridge',
    'Elven Dale',
    'Order of the Raven',
    'Free Cities',
    'Steppe Khans',
    'Sea Guild',
    'Marsh Clans',
  ],
  UT: {
    inf: 'Man-at-arms',
    wagon: 'Wagon',
    siege: 'Trebuchet',
    builder: 'Builder',
    arsonist: 'Arsonist',
    golem: 'Iron golem',
    militia: 'Militia',
    raid: 'Bandit',
  },
  BT: { hq: 'Castle', depot: 'Trading post' },
  SPEC: {
    forge: ['Forge', 'Smelts ore into steel'],
    barracks: ['Watchtower', 'Troops can be hired here'],
    fort: ['Fortress', 'Shoots from its walls, ×2 strength, its roads are harder to cut'],
  },
  SITE: {
    mine: ['Mine', ' ore'],
    farm: ['Farm', ' bread'],
    vein: ['Mana spring', ' mana'],
    mill: ['Lumber camp', ' wood'],
  },
  DOCS: {
    guild: ['Merchant Guild', 'Roads up to 11 tiles'],
    shadow: ['Shadow Brotherhood', 'Arson takes 4 s'],
    forge: ['Order of the Forge', 'Forges and castle +60% steel'],
    land: ['Land Union', 'Posts claim land within 7 tiles'],
  },
  PERKS: {
    carav: ['Fast caravans', 'Caravans are 40% faster and carry 11 instead of 8'],
    cheap: ['Cheap posts', 'Trading posts cost 30% less'],
    repair: ['Repair crews', 'Your burned roads are fixed twice as fast'],
    reach: ['Supply columns', 'Troops stay supplied 3 tiles further from your land'],
    ward: ['Road ward', 'For 30 s all your posts count as connected and your roads cannot be cut'],
    road: [
      "King's highway",
      'The chosen road cannot burn or be cut for 2 min, caravans on it move twice as fast',
    ],
    burn60: ['Long fire', 'A burned road burns 60 s instead of 40'],
    tough: ['Hardened bandits', 'Bandits have +25% health'],
    bag: ['Deep bags', 'A bandit carries 35 loot instead of 20'],
    scorch: ['Scorched earth', 'Arson burns 40% of the stock at both posts of the road'],
    panic: ['Panic', 'An enemy post sends no caravans for 45 s'],
    night: ['Night of long knives', 'All enemy roads within 8 tiles burn for 20 s'],
    cheapsiege: ['Cheap trebuchets', 'Trebuchets cost 25% less'],
    deploy: ['Drilled crews', 'A trebuchet deploys in 1 s instead of 2'],
    ammo: ['Full quivers', 'Arrows cost half, +50% arrows carried'],
    walls: ['Thick walls', 'Fortresses and castle +30% strength'],
    rain: [
      'Fire rain',
      'For 10 s fire rains on a 3-tile circle, hitting enemy buildings and troops',
    ],
    rally: ['Rally to the banners', '8 men-at-arms appear at once at the nearest tower or castle'],
    bread: ['Rich fields', '25% more bread'],
    growth: ['Large families', 'Population grows 1.5× faster'],
    labor: ['Guilds and crews', 'Mines, farms and lumber camps need 2 workers instead of 4'],
    granary: ['Big granaries', '50% more storage'],
    pitch: ['Pitchforks and scythes', '6 militia for 60 s at the nearest post'],
    charter: ['Land charter', 'A post permanently claims land 3 tiles wider'],
  },
  PINGS: { attack: 'Attack here', help: 'Help here', retreat: 'Fall back from here' },
};

const keys = <K extends string>(o: Record<K, unknown>) => Object.keys(o) as K[];
const mapValues = <K extends string, V, R>(o: Record<K, V>, f: (v: V) => R) =>
  Object.fromEntries(keys(o).map((k) => [k, f(o[k])])) as Record<K, R>;

/** the Ukrainian originals, saved before the first switch */
let UK: Texts | null = null;

/** switch display language: localises the rule tables in place and renames bots in the active match */
export function setLang(lang: string): void {
  const l: Lang = lang === 'en' ? 'en' : 'uk';
  UK ??= {
    names: NAMES.slice(),
    UT: mapValues(UNITS, (v) => v.name),
    BT: mapValues(BUILDINGS, (v) => v.name),
    SPEC: mapValues(POST_SPECS, (v) => [v.name, v.desc]),
    SITE: mapValues(SITE_TYPES, (v) => [v.name, v.em]),
    DOCS: mapValues(PATHS, (v) => [v.name, v.trait]),
    PERKS: mapValues(PERKS, (v) => [v.name, v.desc]),
    PINGS: { ...PINGS },
  };
  const src = l === 'en' ? EN : UK;
  const old = NAMES.slice();
  for (let i = 0; i < NAMES.length; i++) NAMES[i] = src.names[i];
  for (const k of keys(UNITS)) UNITS[k].name = src.UT[k];
  for (const k of keys(BUILDINGS)) BUILDINGS[k].name = src.BT[k];
  for (const k of keys(POST_SPECS)) [POST_SPECS[k].name, POST_SPECS[k].desc] = src.SPEC[k];
  for (const k of keys(SITE_TYPES)) [SITE_TYPES[k].name, SITE_TYPES[k].em] = src.SITE[k];
  for (const k of keys(PATHS)) [PATHS[k].name, PATHS[k].trait] = src.DOCS[k];
  for (const k of keys(PERKS)) [PERKS[k].name, PERKS[k].desc] = src.PERKS[k];
  for (const k of keys(PINGS)) PINGS[k] = src.PINGS[k];
  if (G)
    for (const p of G.players) {
      const i = old.indexOf(p.name);
      if (i > 0 && p.bot) p.name = NAMES[i];
    }
  LANG = l;
}
