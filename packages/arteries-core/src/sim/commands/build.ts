/** Building posts, specialising them and hiring troops. */
import type { Building, BuildingType, Cost, Player, SpecType, UnitType } from '../world/types';
import { SITE_TYPES, POST_SPECS } from '../config/buildings';
import { COLORS } from '../config/map';
import { UNITS } from '../config/units';
import { loc } from '../i18n';
import { buildCost, hasPerk, roadLength, unitCost } from '../modifiers';
import { G, siteAt, sites } from '../state';
import { hostile } from '../systems/diplomacy';
import { SPIRAL } from '../systems/movement';
import { dist, tileIndex, inBounds } from '../util/geometry';
import { rand } from '../util/rng';
import { addBuilding, addUnit, canHire, isDepot } from '../world/entities';
import { logEvent } from '../world/events';
import { walkable } from '../world/terrain';

export function canAfford(p: Player, c: Cost) {
  return (
    p.res.wood >= (c.wood || 0) && p.res.steel >= (c.steel || 0) && p.res.food >= (c.food || 0)
  );
}

export function pay(p: Player, c: Cost) {
  p.res.wood -= c.wood || 0;
  p.res.steel -= c.steel || 0;
  p.res.food -= c.food || 0;
}

export function buildCheck(p: Player, type: BuildingType, x: number, y: number) {
  if (!inBounds(x, y)) return loc('Поза мапою', 'Off the map');
  const k = tileIndex(x, y);
  if (!walkable(x, y))
    return loc(
      'Тут не можна будувати (вода або гори)',
      'You cannot build here (water or mountains)',
    );
  if (G.bAt[k] !== -1) return loc('Клітинка зайнята', 'This tile is taken');
  if (siteAt[k] >= 0)
    return loc(
      `Тут стоїть ${SITE_TYPES[sites[siteAt[k]].type].name.toLowerCase()}: постав пост поруч, щоб вона опинилась на твоїй території`,
      `There is a ${SITE_TYPES[sites[siteAt[k]].type].name.toLowerCase()} here: build a post next to it to bring it onto your land`,
    );
  if (G.own[k] !== -1 && G.own[k] !== p.id)
    return hostile(p.id, G.own[k])
      ? loc('Це ворожа територія', 'This is enemy land')
      : loc('Це земля союзника', 'This land belongs to an ally');
  let ok = false,
    tooClose = false;
  for (const b of G.buildings) {
    if (b.dead || b.owner !== p.id || !isDepot(b)) continue;
    const d = dist(b.x, b.y, x, y);
    if (d < 3) tooClose = true;
    if (b.linked && d <= roadLength(p)) ok = true;
  }
  if (tooClose) return loc('Занадто близько до іншого поста', 'Too close to another post');
  if (!ok)
    return loc(
      `Пост має бути до ${roadLength(p)} клітинок від з’єднаного поста`,
      `A post must be within ${roadLength(p)} tiles of a connected post`,
    );
  if (!canAfford(p, buildCost(p, type))) return loc('Бракує ресурсів', 'Not enough resources');
  if (p.pop < 3)
    return loc(
      'Бракує людей: пост потребує 3 поселенців',
      'Not enough people: a post needs 3 settlers',
    );
  return null;
}

export function build(p: Player, type: BuildingType, x: number, y: number) {
  const e = buildCheck(p, type, x, y);
  if (e) return e;
  pay(p, buildCost(p, type));
  p.pop -= 3;
  p.stats.built++;
  logEvent('build', p.id, { x, y });
  const b = addBuilding(type, p.id, x, y);
  G.netT = 0;
  b.linked = true;
  return null;
}

export function specialize(p: Player, b: Building | undefined, s: SpecType) {
  if (!b || b.dead || b.owner !== p.id || b.type !== 'depot' || b.spec)
    return loc('Не можна', 'Not allowed');
  if (!b.linked) return loc('Пост відрізано від замку', 'This post is cut off from the castle');
  if (!canAfford(p, POST_SPECS[s])) return loc('Бракує ресурсів', 'Not enough resources');
  pay(p, POST_SPECS[s]);
  b.spec = s;
  p.stats.specs++;
  p.stats[s]++;
  logEvent('spec', p.id, { s });
  if (s === 'fort') {
    const m = hasPerk(p, 'walls') ? 1.3 : 1;
    b.maxhp = 700 * m;
    b.hp += 700 * m - 320;
  }
  G.fx.push({ x: b.x + 0.5, y: b.y + 0.5, t: 0, dur: 0.8, r: 1.3, color: COLORS[p.id] });
  G.netT = 0;
  return null;
}

export function train(p: Player, type: UnitType, at: Building | null | undefined) {
  const S = UNITS[type];
  if (S.doc && p.doc !== S.doc)
    return loc('Цей юніт доступний лише на іншому шляху', 'This unit belongs to another path');
  const cost = unitCost(p, type);
  if (!canAfford(p, cost)) return loc('Бракує ресурсів', 'Not enough resources');
  if (p.pop < (S.pop || 1))
    return loc(
      'Бракує людей: зачекай, поки населення підросте',
      'Not enough people: wait for the population to grow',
    );
  const d = at && !at.dead && at.linked && at.owner === p.id && canHire(at) ? at : p.hq;
  if (!d || d.dead) return loc('Немає замку', 'No castle');
  for (const [dx, dy] of SPIRAL.slice(1)) {
    const x = d.x + dx,
      y = d.y + dy;
    if (walkable(x, y) && G.bAt[tileIndex(x, y)] === -1) {
      pay(p, cost);
      p.pop -= S.pop || 1;
      p.stats.hired++;
      return addUnit(type, p.id, x + 0.3 + rand() * 0.4, y + 0.3 + rand() * 0.4);
    }
  }
  return loc('Немає місця', 'No room');
}
