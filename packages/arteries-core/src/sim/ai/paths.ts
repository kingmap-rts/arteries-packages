/** Bots choose a path, buy tiers and use the ultimate. */
import type { Building, PathId, Player, Point, Unit } from '../world/types';
import { PATHS, PATH_COST } from '../config/paths';
import { ultimateOf } from '../modifiers';
import { G } from '../state';
import { hostile } from '../systems/diplomacy';
import { cast, choosePath, pickPerk } from '../systems/paths';
import { dist } from '../util/geometry';
import { randomInt, rand } from '../util/rng';
import { isDepot, nearest } from '../world/entities';

// bots: choose a doctrine at 3💎, buy tiers when they can, use the ult with simple heuristics
export function botPaths(
  p: Player,
  army: Unit[],
  threat: Point | null,
  td: number,
) {
  const P = p.ai.P;
  if (P.noDoc) return;
  if (!p.doc) {
    if (p.res.crystal >= PATH_COST[0]) {
      const ds = Object.keys(PATHS) as PathId[];
      choosePath(
        p,
        P.doc && PATHS[P.doc] ? P.doc : ds[randomInt(0, ds.length - 1)],
      );
    }
    return;
  }
  if (p.perks.length < 3 && p.res.crystal >= PATH_COST[p.perks.length + 1])
    pickPerk(p, rand() < 0.5 ? 0 : 1);
  const id = ultimateOf(p);
  if (!id || p.ultCd > G.t) return;
  const foeB = G.buildings.filter(
    b => !b.dead && hostile(p.id, b.owner) && isDepot(b),
  );
  const gT = p.ai.gT ? (G.byId.get(p.ai.gT) as Building | undefined) : null;
  switch (id) {
    case 'ward':
      if (G.links.filter(l => l.owner === p.id && l.blocked).length >= 2)
        cast(p, p.hq.x, p.hq.y);
      break;
    case 'road': {
      const l = G.links.find(
        l => l.owner === p.id && (l.a === p.hq || l.b === p.hq),
      );
      if (l) cast(p, (l.a.x + l.b.x) / 2 + 0.5, (l.a.y + l.b.y) / 2 + 0.5);
      break;
    }
    case 'panic': {
      const b =
        gT && gT.type === 'depot'
          ? gT
          : nearest(
              foeB.filter(b => b.type === 'depot'),
              p.hq.x,
              p.hq.y,
              30,
            );
      if (b) cast(p, b.x + 0.5, b.y + 0.5);
      break;
    }
    case 'night': {
      const b = gT || nearest(foeB, p.hq.x, p.hq.y, 30);
      if (b) cast(p, b.x + 0.5, b.y + 0.5);
      break;
    }
    case 'rain':
      if (
        gT &&
        army.some(u => u.job === 'push' && dist(u.x, u.y, gT.x, gT.y) < 7)
      )
        cast(p, gT.x + 0.5, gT.y + 0.5);
      break;
    case 'rally':
      if (threat || army.some(u => u.job === 'push')) cast(p, p.hq.x, p.hq.y);
      break;
    case 'pitch':
      if (threat && td < 14) cast(p, threat.x, threat.y);
      break;
    case 'charter': {
      const b = G.buildings.find(
        b =>
          !b.dead &&
          b.owner === p.id &&
          b.type === 'depot' &&
          !b.rBonus &&
          b.linked,
      );
      if (b) cast(p, b.x + 0.5, b.y + 0.5);
      break;
    }
  }
}
