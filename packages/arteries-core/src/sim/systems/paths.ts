/** Choosing a path, buying tiers and casting the ultimate. */
import type { PathId, Player } from '../world/types';
import { COLORS, SEATS } from '../config/map';
import { PATHS, PATH_COST, ULT_COOLDOWN } from '../config/paths';
import { loc } from '../i18n';
import { ultimateOf } from '../modifiers';
import { G } from '../state';
import { hit } from './combat';
import { hostile } from './diplomacy';
import { dist, segmentDist } from '../util/geometry';
import { rand } from '../util/rng';
import { addUnit, canHire, isDepot, nearest } from '../world/entities';
import { logEvent, notify } from '../world/events';

export function fireRainTick(dt: number) {
  if (!G.zones.length) return;
  for (const z of G.zones) {
    for (const b of G.buildings) {
      if (b.dead || !hostile(z.owner, b.owner)) continue;
      if (dist(b.x + 0.5, b.y + 0.5, z.x, z.y) <= z.r) hit(b, 20 * dt, z.owner, z.x, z.y - 3);
    }
    for (const u of G.units) {
      if (u.dead || !hostile(z.owner, u.owner)) continue;
      if (
        Math.abs(u.x - z.x) <= z.r &&
        Math.abs(u.y - z.y) <= z.r &&
        dist(u.x, u.y, z.x, z.y) <= z.r
      )
        hit(u, 6 * dt, z.owner, z.x, z.y - 3);
    }
    if (rand() < dt * 6)
      G.fx.push({
        x: z.x + (rand() - 0.5) * z.r * 1.6,
        y: z.y + (rand() - 0.5) * z.r * 1.6,
        t: 0,
        dur: 0.6,
        r: 0.8,
        color: '#ff7b3d',
      });
  }
  G.zones = G.zones.filter((z) => z.until > G.t);
}

export function choosePath(p: Player, d: PathId) {
  if (p.doc) return loc('Шлях уже обрано', 'Path already chosen');
  if (!PATHS[d]) return loc('Немає такого шляху', 'No such path');
  if (p.res.crystal < PATH_COST[0])
    return loc(`Потрібно ${PATH_COST[0]}💎 мани`, `You need ${PATH_COST[0]}💎 mana`);
  p.res.crystal -= PATH_COST[0];
  p.doc = d;
  p.perks = [];
  p.stats.docAt = Math.round(G.t);
  G.netT = 0;
  logEvent('doctrine', p.id, { d });
  for (let i = 0; i < SEATS; i++)
    notify(
      i,
      i === p.id
        ? loc(`Ти обираєш шлях: ${PATHS[d].name}`, `Path chosen: ${PATHS[d].name}`)
        : loc(
            `${p.name} обирає шлях: ${PATHS[d].name}`,
            `${p.name} has chosen a path: ${PATHS[d].name}`,
          ),
    );
  return null;
}

export function pickPerk(p: Player, i: number) {
  if (!p.doc) return loc('Спершу обери шлях', 'Choose a path first');
  const tier = p.perks.length;
  if (tier >= 3) return loc('Усі ступені вже відкрито', 'All tiers are already open');
  const cost = PATH_COST[tier + 1];
  if (p.res.crystal < cost) return loc(`Потрібно ${cost}💎 мани`, `You need ${cost}💎 mana`);
  const id = PATHS[p.doc].perks[tier][i ? 1 : 0];
  p.res.crystal -= cost;
  p.perks.push(id);
  logEvent('perk', p.id, { id });
  if (id === 'walls')
    for (const b of G.buildings)
      if (!b.dead && b.owner === p.id && (b.type === 'hq' || b.spec === 'fort')) {
        b.maxhp *= 1.3;
        b.hp *= 1.3;
      }
  G.netT = 0;
  return null;
}

export function cast(p: Player, x: number, y: number) {
  const id = ultimateOf(p);
  if (!id) return loc('Ульту ще не відкрито', 'Your ultimate is not unlocked yet');
  if (p.ultCd > G.t)
    return loc(
      `Перезарядка ще ${Math.ceil(p.ultCd - G.t)} с`,
      `Recharging: ${Math.ceil(p.ultCd - G.t)} s`,
    );
  const mine = G.buildings.filter((b) => !b.dead && b.owner === p.id && isDepot(b));
  switch (id) {
    case 'ward':
      p.wardUntil = G.t + 30;
      G.netT = 0;
      break;
    case 'road': {
      let best = null,
        bd = 3.5;
      for (const l of G.links) {
        if (l.owner !== p.id) continue;
        const d = segmentDist(x, y, l.a.x + 0.5, l.a.y + 0.5, l.b.x + 0.5, l.b.y + 0.5);
        if (d < bd) {
          bd = d;
          best = l;
        }
      }
      if (!best) return loc('Торкнись своєї дороги', 'Tap one of your roads');
      G.royal.set(best.key, G.t + 120);
      G.sab.delete(best.key);
      G.netT = 0;
      break;
    }
    case 'panic': {
      const b = nearest(
        G.buildings.filter((b) => !b.dead && hostile(p.id, b.owner) && b.type === 'depot'),
        x,
        y,
        3.5,
      );
      if (!b) return loc('Торкнись ворожого поста', 'Tap an enemy post');
      b.panicUntil = G.t + 45;
      break;
    }
    case 'night': {
      let n = 0;
      for (const l of G.links) {
        if (!hostile(p.id, l.owner)) continue;
        const mx = (l.a.x + l.b.x) / 2 + 0.5,
          my = (l.a.y + l.b.y) / 2 + 0.5;
        if (dist(mx, my, x, y) <= 8) {
          G.sab.set(l.key, Math.max(G.sab.get(l.key) || 0, G.t + 20));
          n++;
        }
      }
      if (!n) return loc('Поруч немає ворожих доріг', 'No enemy roads nearby');
      G.netT = 0;
      break;
    }
    case 'rain':
      G.zones.push({ x, y, r: 3, until: G.t + 10, owner: p.id });
      break;
    case 'rally': {
      const at = nearest(
        mine.filter((b) => canHire(b) && b.linked),
        x,
        y,
        1e9,
      );
      if (!at) return loc('Немає замку чи вежі', 'No castle or watchtower');
      for (let i = 0; i < 8; i++)
        addUnit('inf', p.id, at.x + 0.5 + (rand() - 0.5) * 2, at.y + 1.4 + (rand() - 0.5) * 1.2);
      break;
    }
    case 'pitch': {
      const at = nearest(
        mine.filter((b) => b.linked),
        x,
        y,
        1e9,
      );
      if (!at) return loc('Немає постів', 'No posts');
      for (let i = 0; i < 6; i++) {
        const u = addUnit(
          'militia',
          p.id,
          at.x + 0.5 + (rand() - 0.5) * 2,
          at.y + 1.4 + (rand() - 0.5) * 1.2,
        );
        u.expire = G.t + 60;
      }
      break;
    }
    case 'charter': {
      const b = nearest(
        mine.filter((b) => b.type === 'depot' && !b.rBonus),
        x,
        y,
        3.5,
      );
      if (!b)
        return loc('Торкнись свого поста без грамоти', 'Tap one of your posts without a charter');
      b.rBonus = 3;
      G.netT = 0;
      break;
    }
  }
  p.ultCd = G.t + ULT_COOLDOWN;
  p.stats.casts++;
  logEvent('cast', p.id, { id });
  G.fx.push({ x, y, t: 0, dur: 1, r: 2, color: COLORS[p.id] });
  return null;
}
