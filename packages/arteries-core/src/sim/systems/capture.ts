/** Capturing cut-off posts. */
import type { Building } from '../world/types';
import { COLORS } from '../config/map';
import { CAPTURE_TIME } from '../config/network';
import { loc } from '../i18n';
import { G } from '../state';
import { hostile } from './diplomacy';
import { dist } from '../util/geometry';
import { goodsTotal } from '../util/resources';
import { buildingName } from '../world/entities';
import { logEvent, notify } from '../world/events';

export function capture(b: Building, pid: number) {
  const old = b.owner;
  b.owner = pid;
  b.cap = 0;
  b.capBy = -1;
  G.players[pid].stats.captures++;
  G.players[old].stats.capturedFrom++;
  logEvent('capture', pid, { v: old, spec: b.spec });
  b.hp = Math.max(b.hp, b.maxhp * 0.5);
  G.fx.push({ x: b.x + 0.5, y: b.y + 0.5, t: 0, dur: 1, r: 1.8, color: COLORS[pid] });
  const loot = Math.floor(goodsTotal(b.stock));
  if (G.players[old].spawn === b.id) G.players[old].spawn = null;
  notify(
    pid,
    loc(
      `${buildingName(b)} захоплено!${loot ? ' Здобич: ' + loot + ' ресурсів' : ''}`,
      `${buildingName(b)} captured!${loot ? ' Loot: ' + loot + ' resources' : ''}`,
    ),
  );
  notify(
    old,
    loc(
      `Ворог захопив твій відрізаний пост (${buildingName(b)})!`,
      `The enemy took your cut-off post (${buildingName(b)})!`,
    ),
  );
}

export function captureTick(dt: number) {
  for (const b of G.buildings) {
    if (b.dead || b.type !== 'depot') continue;
    if (b.linked) {
      b.cap = 0;
      b.capBy = -1;
      continue;
    }
    let foe = -1,
      mixed = false,
      defended = false;
    for (const u of G.units) {
      if (u.dead) continue;
      if (Math.abs(u.x - b.x - 0.5) > 2.2 || Math.abs(u.y - b.y - 0.5) > 2.2) continue;
      if (dist(u.x, u.y, b.x + 0.5, b.y + 0.5) > 2.2) continue;
      if (u.owner === b.owner) {
        defended = true;
        break;
      }
      if (!hostile(b.owner, u.owner)) continue;
      if (foe === -1) foe = u.owner;
      else if (foe !== u.owner) mixed = true;
    }
    if (defended || mixed || foe < 0) {
      b.cap = Math.max(0, b.cap - dt);
      continue;
    }
    if (b.capBy !== foe) {
      b.capBy = foe;
      b.cap = 0;
    }
    b.cap += dt;
    if (b.cap >= CAPTURE_TIME) capture(b, foe);
  }
}
