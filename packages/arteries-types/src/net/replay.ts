import type { Intent } from '../game/intent';
import type { Difficulty } from '../game/vocabulary';

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
