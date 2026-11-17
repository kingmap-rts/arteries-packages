/** Match log, timeline snapshots and player notices. */
import { SEATS } from '../config/map';
import { G } from '../state';

export function logEvent(
  type: string,
  pid: number | null | undefined,
  extra?: Record<string, unknown>,
) {
  if (!G) return;
  G.events.push(Object.assign({ t: Math.round(G.t), type, p: pid }, extra || {}));
}

export function snapshot() {
  G.timeline.push({
    t: Math.round(G.t),
    pl: G.players.map((p) =>
      p.alive
        ? [
            Math.round(p.res.wood),
            Math.round(p.res.ore),
            Math.round(p.res.steel),
            Math.round(p.res.food),
            Math.round(p.pop),
            Math.round(p.cap),
            Math.round(p.eff * 100),
            p.soldiers || 0,
            G.buildings.filter((b) => b.owner === p.id).length,
            p.tiles,
          ]
        : null,
    ),
  });
}

export function notifyAll(msg: string) {
  for (let i = 0; i < SEATS; i++) notify(i, msg);
}

export function notify(seat: number, msg: string) {
  if (!G || G.sim || seat == null || seat < 0) return;
  G.notices.push([seat, msg]);
  if (G.notices.length > 200) G.notices.splice(0, G.notices.length - 200);
}
