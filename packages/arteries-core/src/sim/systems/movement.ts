/** Moving along paths and move/attack orders. */
import type { Entity, Unit } from '../world/types';
import { MAP_H, MAP_W, Terrain } from '../config/map';
import { terrainMap } from '../state';
import { findPath } from './pathfinding';
import { dist, tileIndex, vecLen } from '../util/geometry';
import { walkable } from '../world/terrain';

export function moveToward(e: Unit, tx: number, ty: number, speed: number, dt: number) {
  const dx = tx - e.x,
    dy = ty - e.y,
    d = vecLen(dx, dy);
  if (d < 1e-4) return true;
  const tk = tileIndex(e.x | 0, e.y | 0);
  const sp = speed * (terrainMap[tk] === Terrain.Forest ? 0.75 : 1) * dt;
  const st = Math.min(sp, d);
  const nx = e.x + (dx / d) * st,
    ny = e.y + (dy / d) * st;
  e.ang = Math.atan2(dy, dx);
  if (walkable(nx | 0, ny | 0)) {
    e.x = nx;
    e.y = ny;
  } else if (walkable(nx | 0, e.y | 0)) {
    e.x = nx;
  } else if (walkable(e.x | 0, ny | 0)) {
    e.y = ny;
  } else return false;
  e.mv = 1;
  return st >= d;
}

export function followPath(e: Unit, speed: number, dt: number) {
  if (!e.path || !e.path.length) return true;
  const [wx, wy] = e.path[0];
  const tx = wx + 0.5,
    ty = wy + 0.5;
  if (dist(e.x, e.y, tx, ty) < 0.12 || moveToward(e, tx, ty, speed, dt)) {
    e.path.shift();
  }
  return !e.path.length;
}

export const SPIRAL = (() => {
  const a = [[0, 0]];
  for (let r = 1; r < 6; r++)
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (Math.max(Math.abs(dx), Math.abs(dy)) === r) a.push([dx, dy]);
  return a;
})();

export function orderMove(units: Unit[], tx: number, ty: number, mode?: 'move' | 'amove') {
  tx = Math.max(0, Math.min(MAP_W - 1, tx | 0));
  ty = Math.max(0, Math.min(MAP_H - 1, ty | 0));
  let k = 0;
  const sorted = [...units].sort((a, b) => dist(a.x, a.y, tx, ty) - dist(b.x, b.y, tx, ty));
  for (const u of sorted) {
    let gx = tx,
      gy = ty;
    while (k < SPIRAL.length) {
      const [dx, dy] = SPIRAL[k++];
      if (walkable(tx + dx, ty + dy)) {
        gx = tx + dx;
        gy = ty + dy;
        break;
      }
    }
    u.path = findPath(u.x | 0, u.y | 0, gx, gy);
    u.dest = [gx, gy];
    u.tgt = 0;
    u.ftgt = 0;
    u.job = null;
    u.joinTo = 0;
    u.order = mode || 'amove';
  }
}

export function orderAttack(units: Unit[], ent: Entity) {
  for (const u of units) {
    u.joinTo = 0;
    u.order = 'amove';
    u.ftgt = ent.id;
    u.tgt = ent.id;
    u.path = null;
    u.repath = 0;
    u.dest = null;
    u.job = null;
  }
}

export function walkTo(u: Unit, t: Unit) {
  const gx = Math.round(t.x - 0.5),
    gy = Math.round(t.y - 0.5);
  u.path = findPath(u.x | 0, u.y | 0, gx, gy);
  u.dest = [gx, gy];
}
