/**
 * @caspen13/arteries-core — the deterministic simulation of «Артерії».
 *
 * Lockstep: every client runs this core with the same seed, the server only relays player
 * intents per turn. Same seed + same intents in the same order = the same world everywhere
 * (compare Game.hash()).
 *
 *   const game = createGame({ seed: 42, humans: { 0: 'Аня' } });
 *   game.apply(0, { t: 'train', type: 'inf' });
 *   game.step();
 *   game.hash();
 */
export { createGame, Game, TICK } from './game';
export type { GameOptions, GameResult, GameMap } from './game';
export * as rules from './rules';
export type {
  World,
  Player,
  PlayerStats,
  BotParams,
  BotState,
  Unit,
  UnitJob,
  Building,
  Convoy,
  Entity,
  Link,
  RoadLink,
  Site,
  Pact,
  AllyRequest,
  Ping,
  FireZone,
  Effect,
  Shot,
  MatchEvent,
  Bag,
  Tile,
  Point,
  Cost,
} from './sim/world/types';

/** the protocol package, re-exported so the client needs one import */
export * from '@caspen13/arteries-protocol';
