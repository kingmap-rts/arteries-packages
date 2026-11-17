import { MAX_PLAYERS } from './messages';
import type {
  GiftResource,
  PathId,
  PingKind,
  SayKind,
  SpecType,
  TradeResource,
  UnitType,
} from './vocabulary';

/** A player's command. Seats are 0..MAX_PLAYERS-1; ids refer to entity ids in the world. */
export type Intent =
  | { t: 'move'; ids: number[]; x: number; y: number; mode?: 'move' | 'amove' }
  | { t: 'attack'; ids: number[]; target: number }
  | { t: 'stop'; ids: number[] }
  | { t: 'build'; x: number; y: number }
  | { t: 'train'; type: UnitType }
  | { t: 'spec'; b: number; s: SpecType }
  /** where new troops appear */
  | { t: 'spawn'; b: number }
  /** hire troops automatically */
  | { t: 'auto'; on: boolean }
  /** choose a path (Шлях) for 3 mana */
  | { t: 'doctrine'; d: PathId }
  /** buy the next tier of the path, option 0 or 1 */
  | { t: 'perk'; i: 0 | 1 }
  /** use the tier-4 ability at a map point */
  | { t: 'cast'; x: number; y: number }
  /** walk the selected units of one type together into squads (up to 5 light / 3 heavy) */
  | { t: 'squad'; ids: number[] }
  /** split the selected squads back into single soldiers */
  | { t: 'unsquad'; ids: number[] }
  /** a short message to another ruler */
  | { t: 'say'; to: number; k: SayKind }
  /** propose an alliance, or accept one offered by that seat */
  | { t: 'ally'; to: number }
  /** break an alliance (traitor for 2 min), or decline / withdraw an offer */
  | { t: 'unally'; to: number }
  /** ask to renew a pact; it renews when both sides asked */
  | { t: 'renew'; to: number }
  /** send a caravan of one resource from your castle to an ally's castle */
  | { t: 'gift'; to: number; res: GiftResource }
  /** market at the castle: 30 of one resource for 10 of another */
  | { t: 'trade'; from: TradeResource; to: TradeResource }
  /** map signal seen by you and your allies */
  | { t: 'ping'; x: number; y: number; k: PingKind }
  /** injected by the server when a player leaves or drops: a bot takes over the seat */
  | { t: 'leave' };

export type IntentType = Intent['t'];

const PLAYER_INTENTS = new Set<string>([
  'move',
  'attack',
  'stop',
  'build',
  'train',
  'spec',
  'spawn',
  'auto',
  'doctrine',
  'perk',
  'cast',
  'ally',
  'unally',
  'renew',
  'gift',
  'trade',
  'ping',
  'squad',
  'unsquad',
  'say',
]);
const UNIT_TYPES: UnitType[] = [
  'inf',
  'raid',
  'wagon',
  'siege',
  'builder',
  'arsonist',
  'golem',
  'militia',
];
const SPECS: SpecType[] = ['forge', 'barracks', 'fort'];
const PATHS: PathId[] = ['guild', 'shadow', 'forge', 'land'];
const SAYS: SayKind[] = ['hi', 'peace', 'help', 'together', 'thanks', 'warn'];
const TRADE: TradeResource[] = ['wood', 'ore', 'steel', 'food'];
const GIFTS: GiftResource[] = ['wood', 'steel', 'food', 'crystal'];
const PINGS: PingKind[] = ['attack', 'help', 'retreat'];

const num = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
const ids = (v: unknown): v is number[] =>
  Array.isArray(v) && v.length <= 250 && v.every(num);
const seat = (v: unknown): v is number =>
  Number.isInteger(v) && (v as number) >= 0 && (v as number) < MAX_PLAYERS;
const oneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  list.includes(v as T);

/**
 * Strict shape check for intents coming from players. Returns a clean copy, or null when the
 * message is not a valid player intent ('leave' is server-only and always rejected here).
 */
export function cleanIntent(x: any): Intent | null {
  if (!x || typeof x !== 'object' || !PLAYER_INTENTS.has(x.t)) return null;
  switch (x.t) {
    case 'move':
      return ids(x.ids) && num(x.x) && num(x.y)
        ? {
            t: 'move',
            ids: x.ids,
            x: x.x | 0,
            y: x.y | 0,
            mode: x.mode === 'move' ? 'move' : 'amove',
          }
        : null;
    case 'attack':
      return ids(x.ids) && num(x.target)
        ? { t: 'attack', ids: x.ids, target: x.target }
        : null;
    case 'stop':
      return ids(x.ids) ? { t: 'stop', ids: x.ids } : null;
    case 'build':
      return num(x.x) && num(x.y)
        ? { t: 'build', x: x.x | 0, y: x.y | 0 }
        : null;
    case 'train':
      return oneOf(UNIT_TYPES, x.type) ? { t: 'train', type: x.type } : null;
    case 'spec':
      return num(x.b) && oneOf(SPECS, x.s)
        ? { t: 'spec', b: x.b, s: x.s }
        : null;
    case 'spawn':
      return num(x.b) ? { t: 'spawn', b: x.b } : null;
    case 'auto':
      return { t: 'auto', on: !!x.on };
    case 'doctrine':
      return oneOf(PATHS, x.d) ? { t: 'doctrine', d: x.d } : null;
    case 'perk':
      return { t: 'perk', i: x.i ? 1 : 0 };
    case 'say':
      return seat(x.to) && oneOf(SAYS, x.k)
        ? { t: 'say', to: x.to, k: x.k }
        : null;
    case 'squad':
    case 'unsquad':
      return ids(x.ids) ? { t: x.t, ids: x.ids } : null;
    case 'ally':
    case 'unally':
    case 'renew':
      return seat(x.to) ? { t: x.t, to: x.to } : null;
    case 'trade':
      return oneOf(TRADE, x.from) && oneOf(TRADE, x.to) && x.from !== x.to
        ? { t: 'trade', from: x.from, to: x.to }
        : null;
    case 'gift':
      return seat(x.to) && oneOf(GIFTS, x.res)
        ? { t: 'gift', to: x.to, res: x.res }
        : null;
    case 'ping':
      return num(x.x) && num(x.y) && oneOf(PINGS, x.k)
        ? { t: 'ping', x: x.x, y: x.y, k: x.k }
        : null;
    case 'cast':
      return num(x.x) && num(x.y) ? { t: 'cast', x: x.x, y: x.y } : null;
  }
  return null;
}
