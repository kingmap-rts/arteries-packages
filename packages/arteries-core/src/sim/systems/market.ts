/** The market at the castle. */
import type { Player, TradeResource } from '../world/types';
import { MARKET_GET, MARKET_GIVE, MARKET_RES } from '../config/economy';
import { loc } from '../i18n';

export function trade(p: Player, from: TradeResource, to: TradeResource) {
  if (!MARKET_RES.includes(from) || !MARKET_RES.includes(to) || from === to)
    return loc('Такий обмін неможливий', 'That trade is not possible');
  if (!p.hq || p.hq.dead) return loc('Немає замку', 'No castle');
  if (p.res[from] < MARKET_GIVE)
    return loc(`Потрібно ${MARKET_GIVE} для обміну`, `You need ${MARKET_GIVE} to trade`);
  p.res[from] -= MARKET_GIVE;
  p.res[to] += MARKET_GET;
  p.stats.traded = (p.stats.traded || 0) + MARKET_GIVE;
  return null;
}
