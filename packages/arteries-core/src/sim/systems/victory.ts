/** Victory by holding a share of the map. */
import type { Player } from '../world/types';
import { SEATS } from '../config/map';
import { DOMINATION_HOLD, DOMINATION_SHARE } from '../config/match';
import { loc } from '../i18n';
import { G } from '../state';
import { logEvent, notify } from '../world/events';

export function dominationTick(dt: number) {
  for (const p of G.players) {
    if (!p.alive) {
      p.domT = 0;
      continue;
    }
    if ((p.land || 0) >= DOMINATION_SHARE) {
      const before = p.domT || 0;
      p.domT = before + dt;
      if (Math.floor(before / 10) !== Math.floor(p.domT / 10) || before === 0) {
        const left = Math.max(0, Math.ceil(DOMINATION_HOLD - p.domT));
        for (let i = 0; i < SEATS; i++)
          notify(
            i,
            i === p.id
              ? loc(
                  `Ти контролюєш ${Math.round(p.land * 100)}% мапи! Втримай ще ${left} с, і перемога твоя`,
                  `You hold ${Math.round(p.land * 100)}% of the map! Hold it for ${left} s more to win`,
                )
              : loc(
                  `${p.name} контролює ${Math.round(p.land * 100)}% мапи: перемога через ${left} с!`,
                  `${p.name} holds ${Math.round(p.land * 100)}% of the map: victory in ${left} s!`,
                ),
          );
      }
      if (p.domT >= DOMINATION_HOLD) {
        dominate(p);
        return;
      }
    } else p.domT = 0;
  }
}

export function dominate(p: Player) {
  logEvent('domination', p.id);
  G.domWinner = p.id;
  G.over = true;
  G.winner = p.id;
  G.reason = 'domination';
}
