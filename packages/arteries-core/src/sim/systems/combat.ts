/** Targeting, shooting, damage, death and elimination. */
import type { Entity, Unit } from '../world/types';
import { RESOURCES } from '../config/economy';
import { COLORS, SEATS } from '../config/map';
import { UNITS } from '../config/units';
import { loc } from '../i18n';
import { G } from '../state';
import { hostile } from './diplomacy';
import { findPath } from './pathfinding';
import { memberLoss } from './squads';
import { dist, tileIndex } from '../util/geometry';
import { rand } from '../util/rng';
import { lootCarried, centerX, centerY } from '../world/entities';
import { logEvent, notify } from '../world/events';

export function kill(e: Entity, silent?: boolean, by?: number) {
  if (e.dead) return;
  e.dead = true;
  if (!silent) {
    const vs = G.players[e.owner].stats,
      ks = by != null && by >= 0 ? G.players[by].stats : null;
    if (e.kind === 'u') {
      if (e.bag && lootCarried(e) > 0)
        G.fx.push({
          x: e.x,
          y: e.y,
          t: 0,
          dur: 1,
          text: '−' + Math.round(lootCarried(e)),
          color: '#ff7b72',
        });
      vs.unitsLost++;
      if (ks) ks.kills++;
      else vs.starved++;
    } else if (e.kind === 'c') {
      vs.convoysLost++;
      if (ks) ks.convoysKilled++;
    } else if (e.kind === 'b' && e.type === 'depot') {
      vs.depotsLost++;
      if (ks) ks.depotsDestroyed++;
      logEvent('destroy', by, { v: e.owner, spec: e.spec });
    }
  }
  if (!silent)
    G.fx.push({
      x: centerX(e),
      y: centerY(e),
      t: 0,
      dur: e.kind === 'b' ? 0.9 : 0.45,
      r: e.kind === 'b' ? 1.6 : 0.7,
      color: G.players[e.owner].color,
    });
  if (e.kind === 'b') {
    G.bAt[tileIndex(e.x, e.y)] = -1;
    if (e.type === 'hq') eliminate(e.owner, by);
    G.netT = 0;
  }
}

export function eliminate(pid: number, by?: number) {
  const p = G.players[pid];
  if (!p.alive) return;
  p.alive = false;
  p.stats.elimAt = Math.round(G.t);
  p.stats.elimBy = by != null && by >= 0 ? by : null;
  logEvent('elim', pid);
  for (const b of G.buildings)
    if (b.owner === pid && !b.dead) {
      G.fx.push({ x: b.x + 0.5, y: b.y + 0.5, t: 0, dur: 1.2, r: 1.4, color: p.color });
      b.dead = true;
      G.bAt[tileIndex(b.x, b.y)] = -1;
    }
  for (const u of G.units) if (u.owner === pid) kill(u, true);
  for (const c of G.convoys) if (c.owner === pid) kill(c, true);
  for (let i = 0; i < SEATS; i++)
    notify(
      i,
      i === pid
        ? loc('Твій замок упав!', 'Your castle has fallen!')
        : loc(`${p.name} впало!`, `${p.name} has fallen!`),
    );
  const alive = G.players.filter((q) => q.alive);
  if (alive.length <= 1) {
    G.over = true;
    G.winner = alive[0] ? alive[0].id : -1;
    G.reason = 'elimination';
  }
}

export function acquireTarget(u: Unit) {
  if (u.type === 'wagon') {
    u.tgt = 0;
    return;
  }
  if (u.order === 'move' && u.path && u.path.length && !u.ftgt) {
    u.tgt = 0;
    return;
  }
  if (u.ftgt) {
    const f = G.byId.get(u.ftgt);
    if (f && !f.dead) {
      u.tgt = f.id;
      return;
    }
    u.ftgt = 0;
  }
  const S = UNITS[u.type];
  let best = null,
    bd = S.aggro;

  if (u.type === 'siege') {
    // artillery prefers buildings in range, never chases
    let bb = null,
      bdd = S.range + 0.4;
    for (const b of G.buildings) {
      if (b.dead || !hostile(u.owner, b.owner)) continue;
      if (Math.abs(b.x + 0.5 - u.x) > bdd || Math.abs(b.y + 0.5 - u.y) > bdd) continue;
      const e = dist(b.x + 0.5, b.y + 0.5, u.x, u.y);
      if (e < bdd) {
        bdd = e;
        bb = b;
      }
    }
    if (bb) {
      u.tgt = bb.id;
      return;
    }
  }
  for (const o of G.units) {
    if (o.dead || !hostile(u.owner, o.owner)) continue;
    const d = Math.abs(o.x - u.x) + Math.abs(o.y - u.y);
    if (d > bd * 1.5) continue;
    const e = dist(o.x, o.y, u.x, u.y);
    if (e < bd) {
      bd = e;
      best = o;
    }
  }
  if (!best) {
    bd = u.type === 'raid' ? 5 : 3.5;
    for (const c of G.convoys) {
      if (c.dead || !hostile(u.owner, c.owner)) continue;
      const e = dist(c.x, c.y, u.x, u.y);
      if (e < bd) {
        bd = e;
        best = c;
      }
    }
  }
  if (!best) {
    bd = 2.6;
    for (const b of G.buildings) {
      if (b.dead || !hostile(u.owner, b.owner)) continue;
      const e = dist(b.x + 0.5, b.y + 0.5, u.x, u.y);
      if (e < bd) {
        bd = e;
        best = b;
      }
    }
  }
  const had = u.tgt;
  u.tgt = best ? best.id : 0;
  if (had && !u.tgt && u.dest) {
    u.path = findPath(u.x | 0, u.y | 0, u.dest[0], u.dest[1]);
  }
}

export function hit(t: Entity, dmg: number, owner: number, x1: number, y1: number) {
  t.hp -= dmg;
  t.lastHit = G.t;
  if (t.kind === 'u' && t.n > 1) memberLoss(t, owner);
  G.shots.push({ x1, y1, x2: centerX(t), y2: centerY(t), t: 0.12, c: COLORS[owner] });
  if (t.hp <= 0) {
    if (t.kind === 'c' && !t.dead) {
      const p = G.players[owner];
      let sum = 0;
      for (const k of RESOURCES) {
        const v = Math.floor(t.cargo[k] * 0.5);
        p.res[k] += v;
        sum += v;
      }
      p.stats.loot += sum;
      if (sum) G.fx.push({ x: t.x, y: t.y, t: 0, dur: 1.2, text: '+' + sum, color: COLORS[owner] });
    }
    kill(t, false, owner);
  }
}

export function fire(u: Unit, t: Entity) {
  const S = UNITS[u.type];
  if (!S.dmg) return;
  let dmg = S.dmg * (u.n || 1) * (u.supplied ? 1 : 0.6);
  if (S.noAmmo) u.cd = S.cd * (0.9 + rand() * 0.2);
  else if (u.ammo >= 1) {
    u.ammo -= 1;
    u.cd = S.cd * (0.9 + rand() * 0.2);
  } else {
    dmg *= 0.25;
    u.cd = S.cd * 1.6;
  }
  if (t.kind === 'c') dmg *= S.vsC;
  else if (t.kind === 'b') dmg *= S.vsB;
  else if (t.kind === 'u') {
    if (t.type === 'wagon') dmg *= Math.max(1, S.vsC);
    else if (S.vsU) dmg *= S.vsU;
  }
  if (u.type === 'siege') {
    G.fx.push({ x: centerX(t), y: centerY(t), t: 0, dur: 0.5, r: 0.9, color: '#ffb27a' });
  }
  if (t.kind === 'b' && t.type === 'hq' && t.owner !== u.owner)
    G.players[u.owner].stats.hqDmg += dmg;
  hit(t, dmg, u.owner, u.x, u.y);
}
