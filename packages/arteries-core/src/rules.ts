/**
 * The rules of the game for renderers and UI: tables, constants and pure helpers.
 * Everything here is read only. Change the world only through Game.apply().
 */

// ---- map ----
export {
  SEATS,
  TILE_PX,
  MAP_W,
  MAP_H,
  TILES,
  Terrain,
  Deposit,
  COLORS,
  NAMES,
} from './sim/config/map';
export type { TerrainCode, DepositCode } from './sim/config/map';

// ---- roads and territory ----
export {
  ROAD_LEN,
  HQ_RADIUS,
  POST_RADIUS,
  CAPTURE_TIME,
  ARSON_TIME,
  BURN_TIME,
  BURN_IMMUNITY,
} from './sim/config/network';

// ---- units, buildings, sites ----
export { UNITS, HEAVY_UNITS, WAGON_CAP, WAGON_R, BAG_CAP, AMMO_COST } from './sim/config/units';
export type { UnitSpec } from './sim/config/units';
export { BUILDINGS, POST_SPECS, SITE_TYPES, SITE_WORKERS } from './sim/config/buildings';
export type { BuildingSpec, SpecSpec, SiteSpec } from './sim/config/buildings';

// ---- economy ----
export {
  RESOURCES,
  RESOURCE_COLORS,
  YIELD_ORE,
  YIELD_GRAIN,
  YIELD_FOREST,
  YIELD_PLAIN,
  YIELD_CRYSTAL,
  CONVOY_CAP,
  STOCK_CAP,
  STORE_BASE,
  STORE_PER_DEPOT,
  FORGE_RATE,
  MARKET_GIVE,
  MARKET_GET,
  MARKET_RES,
  /** experiment knobs for headless balance runs; the game itself never changes them */
  TUNE,
} from './sim/config/economy';

// ---- match, diplomacy, paths ----
export { DOMINATION_SHARE, DOMINATION_HOLD, DIFFICULTY } from './sim/config/match';
export { DEFAULT_BOT_PARAMS } from './sim/config/ai';
export {
  PACT_TIME,
  TRAITOR_TIME,
  OFFER_TIME,
  ALLY_MAX,
  GIFT_COOLDOWN,
  GIFT_AMOUNT,
  PINGS,
  MESSAGES,
} from './sim/config/diplomacy';
export { PATH_COST, ULT_COOLDOWN, PATHS, PERKS } from './sim/config/paths';
export type { PathSpec, PerkSpec } from './sim/config/paths';

// ---- pure helpers ----
export { tileIndex, inBounds, dist, segmentDist } from './sim/util/geometry';
export { goodsTotal, dominantResource } from './sim/util/resources';
/** deterministic value noise of the map generator (handy for decorating tiles the same way everywhere) */
export { noiseHash, fbm } from './sim/util/noise';
export {
  isDepot,
  canHire,
  buildingName,
  buildingIcon,
  centerX,
  centerY,
  wagonLoad,
  lootCarried,
} from './sim/world/entities';
export { hasPerk, ultimateOf, roadLength, unitCost, buildCost } from './sim/modifiers';
export { squadSize, soldierCount } from './sim/systems/squads';
export { canAfford } from './sim/commands/build';

// ---- display language ----
/** Switch the language of rule tables, notices and bot names ('uk' default, 'en'). Display only. */
export { setLang } from './sim/i18n';
export type { Lang } from './sim/i18n';
