import { cleanIntent, type Intent } from './intent';
import { MAX_PLAYERS } from './messages';
import type { Difficulty } from './vocabulary';

/**
 * A replay is everything needed to re-simulate a match exactly:
 * the seed, who sat where, and every intent with the tick it was applied on.
 */
export interface Replay {
  v: 1;
  id: string;
  mode: 'online' | 'local';
  build: string;
  startedAt: string;
  endedAt: string;
  seed: number;
  diff: Difficulty;
  humans: Record<number, string>;
  /** number of simulated ticks */
  ticks: number;
  result: { winner: number | null; reason: string | null; tick: number } | null;
  /** non-empty turns only: [tick, [[seat, intent], ...]] */
  turns: [number, [number, Intent][]][];
  /** agreed state hashes at some ticks, to verify a re-simulation */
  checks: Record<number, string>;
}

/** biggest replay a client may upload */
export const REPLAY_MAX_BYTES = 4 * 1024 * 1024;

/** Shape check for replays uploaded by clients (local games). */
export function cleanReplay(x: any): Replay | null {
  if (!x || typeof x !== 'object' || x.v !== 1 || x.mode !== 'local') return null;
  if (
    !Number.isInteger(x.seed) ||
    ![0, 1, 2].includes(x.diff) ||
    !Number.isInteger(x.ticks) ||
    x.ticks < 0 ||
    x.ticks > 10 * 60 * 60 * 6
  )
    return null;
  if (!Array.isArray(x.turns) || x.turns.length > x.ticks + 1) return null;
  const turns: Replay['turns'] = [];
  for (const t of x.turns) {
    if (!Array.isArray(t) || !Number.isInteger(t[0]) || !Array.isArray(t[1])) return null;
    const list: [number, Intent][] = [];
    for (const [seat, it] of t[1]) {
      const c = cleanIntent(it);
      if (c && Number.isInteger(seat) && seat >= 0 && seat < MAX_PLAYERS) list.push([seat, c]);
    }
    if (list.length) turns.push([t[0], list]);
  }
  const humans: Record<number, string> = {};
  const checks: Record<number, string> = {};
  for (const [k, v] of Object.entries(x.checks ?? {}).slice(0, 2000))
    if (Number.isInteger(+k) && typeof v === 'string') checks[+k] = v.slice(0, 16);
  for (const [k, v] of Object.entries(x.humans ?? {}))
    if (+k >= 0 && +k < MAX_PLAYERS) humans[+k] = String(v).slice(0, 16);
  const r =
    x.result && typeof x.result === 'object'
      ? {
          winner: Number.isInteger(x.result.winner) ? x.result.winner : null,
          reason: typeof x.result.reason === 'string' ? x.result.reason.slice(0, 32) : null,
          tick: x.result.tick | 0,
        }
      : null;
  return {
    v: 1,
    id:
      String(x.id ?? '')
        .replace(/[^a-zA-Z0-9_-]/g, '')
        .slice(0, 40) || 'local',
    mode: 'local',
    build: String(x.build ?? '').slice(0, 40),
    startedAt: String(x.startedAt ?? '').slice(0, 30),
    endedAt: String(x.endedAt ?? '').slice(0, 30),
    seed: x.seed,
    diff: x.diff,
    humans,
    ticks: x.ticks,
    result: r,
    turns,
    checks,
  };
}
