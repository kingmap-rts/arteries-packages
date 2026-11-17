/** Alliances, gifts, signals and messages between rulers. */
import type { Bag, Building, PingKind, Player, SayKind } from '../world/types';
import type { GiftResource } from '@caspen13/arteries-protocol';
import {
  ALLY_MAX,
  GIFT_AMOUNT,
  GIFT_COOLDOWN,
  PACT_TIME,
  PINGS,
  PING_TIME,
  OFFER_TIME,
  MESSAGES,
  TRAITOR_TIME,
} from '../config/diplomacy';
import { RESOURCES } from '../config/economy';
import { SEATS } from '../config/map';
import { LANG, loc } from '../i18n';
import { G } from '../state';
import { dist } from '../util/geometry';
import { addConvoy } from '../world/entities';
import { logEvent, notify } from '../world/events';

export const allied = (a: number, b: number) => a !== b && a >= 0 && b >= 0 && G.pact[a][b] > G.t;

export const hostile = (a: number, b: number) =>
  a !== b && !(a >= 0 && b >= 0 && G.pact[a][b] > G.t);

export const allyIds = (pid: number) => {
  const r = [];
  for (let i = 0; i < SEATS; i++) if (allied(pid, i)) r.push(i);
  return r;
};

export function giftText(c: Bag) {
  return RESOURCES.filter((k) => c[k] > 0)
    .map(
      (k) =>
        `${Math.round(c[k])} ${(LANG === 'en' ? { wood: 'wood', ore: 'ore', steel: 'steel', food: 'bread', crystal: 'mana' } : { wood: 'дерева', ore: 'руди', steel: 'сталі', food: 'хліба', crystal: 'мани' })[k]}`,
    )
    .join(', ');
}

export function supplyDeps(pid: number, deps: Building[][]) {
  const al = allyIds(pid);
  if (!al.length) return deps[pid];
  let r = deps[pid];
  for (const a of al) r = r.concat(deps[a]);
  return r;
}

export function setPact(a: number, b: number, until: number) {
  G.pact[a][b] = G.pact[b][a] = until;
  G.netT = 0;
}

export function pactOf(a: number, b: number) {
  return G.pacts.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
}

export function requestAlly(p: Player, to: number) {
  const q = G.players[to];
  if (!q || q.id === p.id || !q.alive) return loc('Немає такого королівства', 'No such kingdom');
  if (allied(p.id, q.id)) return loc('Ви вже союзники', 'You are already allies');
  if (p.traitorUntil > G.t)
    return loc(
      `Після зради ще ${Math.ceil(p.traitorUntil - G.t)} с ніхто не укладе з тобою союзу`,
      `After your betrayal nobody will ally with you for ${Math.ceil(p.traitorUntil - G.t)} s`,
    );
  const back = G.reqs.find((r) => r.from === q.id && r.to === p.id && r.until > G.t);
  if (back) {
    if (allyIds(p.id).length >= ALLY_MAX)
      return loc(
        `Не більше ${ALLY_MAX} союзників одночасно`,
        `No more than ${ALLY_MAX} allies at a time`,
      );
    if (allyIds(q.id).length >= ALLY_MAX)
      return loc(
        `${q.name} уже має ${ALLY_MAX} союзників`,
        `${q.name} already has ${ALLY_MAX} allies`,
      );
    G.reqs = G.reqs.filter((r) => r !== back);
    G.pacts.push({ a: q.id, b: p.id, until: G.t + PACT_TIME, warned: false, ra: false, rb: false });
    setPact(p.id, q.id, G.t + PACT_TIME);
    p.stats.pacts++;
    q.stats.pacts++;
    logEvent('pact', p.id, { v: q.id });
    for (let i = 0; i < SEATS; i++)
      notify(
        i,
        i === p.id || i === q.id
          ? loc(
              `Союз з ${i === p.id ? q.name : p.name} укладено на 8 хв`,
              `Alliance with ${i === p.id ? q.name : p.name} made for 8 min`,
            )
          : loc(`${q.name} і ${p.name} уклали союз`, `${q.name} and ${p.name} made an alliance`),
      );
    return null;
  }
  if (allyIds(p.id).length >= ALLY_MAX)
    return loc(
      `Не більше ${ALLY_MAX} союзників одночасно`,
      `No more than ${ALLY_MAX} allies at a time`,
    );
  if (G.reqs.some((r) => r.from === p.id && r.to === q.id && r.until > G.t))
    return loc('Пропозицію вже надіслано', 'Offer already sent');
  G.reqs.push({ from: p.id, to: q.id, until: G.t + OFFER_TIME, at: G.t });
  notify(
    q.id,
    loc(
      `${p.name} пропонує союз. Відповідь у дипломатії (🤝), 30 с`,
      `${p.name} offers an alliance. Answer in diplomacy (🤝) within 30 s`,
    ),
  );
  return null;
}

export function breakAlly(p: Player, to: number) {
  const q = G.players[to];
  if (!q) return loc('Немає такого королівства', 'No such kingdom');
  const rq = G.reqs.find((r) => r.from === q.id && r.to === p.id && r.until > G.t);
  if (rq && !allied(p.id, q.id)) {
    G.reqs = G.reqs.filter((r) => r !== rq);
    notify(q.id, loc(`${p.name} відхиляє союз`, `${p.name} declines the alliance`));
    return null;
  }
  const mine = G.reqs.find((r) => r.from === p.id && r.to === q.id);
  if (mine && !allied(p.id, q.id)) {
    G.reqs = G.reqs.filter((r) => r !== mine);
    return null;
  }
  if (!allied(p.id, q.id)) return loc('Ви не союзники', 'You are not allies');
  G.pacts = G.pacts.filter((x) => x !== pactOf(p.id, q.id));
  setPact(p.id, q.id, 0);
  p.traitorUntil = G.t + TRAITOR_TIME;
  p.stats.betrayals++;
  q.stats.betrayed++;
  logEvent('betray', p.id, { v: q.id });
  for (let i = 0; i < SEATS; i++)
    notify(
      i,
      i === q.id
        ? loc(
            `${p.name} зрадив тебе й розірвав союз!`,
            `${p.name} betrayed you and broke the alliance!`,
          )
        : i === p.id
          ? loc(
              `Ти розірвав союз з ${q.name}. 2 хв ніхто не укладе з тобою союзу`,
              `You broke the alliance with ${q.name}. Nobody will ally with you for 2 min`,
            )
          : loc(
              `${p.name} зрадив союз з ${q.name}`,
              `${p.name} betrayed the alliance with ${q.name}`,
            ),
    );
  return null;
}

export function renewAlly(p: Player, to: number) {
  const x = pactOf(p.id, to);
  if (!x || !allied(p.id, to)) return loc('Ви не союзники', 'You are not allies');
  if (x.a === p.id) x.ra = true;
  else x.rb = true;
  const q = G.players[to];
  if (x.ra && x.rb) {
    x.until = G.t + PACT_TIME;
    x.ra = x.rb = false;
    x.warned = false;
    setPact(x.a, x.b, x.until);
    notify(
      p.id,
      loc(`Союз з ${q.name} продовжено на 8 хв`, `Alliance with ${q.name} renewed for 8 min`),
    );
    notify(
      q.id,
      loc(`Союз з ${p.name} продовжено на 8 хв`, `Alliance with ${p.name} renewed for 8 min`),
    );
  } else
    notify(q.id, loc(`${p.name} хоче продовжити союз`, `${p.name} wants to renew the alliance`));
  return null;
}

export function giftAlly(p: Player, to: number, k: GiftResource) {
  const q = G.players[to];
  if (!q || !allied(p.id, to)) return loc('Подарунки лише союзникам', 'Gifts are for allies only');
  if (!GIFT_AMOUNT[k]) return loc('Немає такого ресурсу', 'No such resource');
  if (p.giftCd > G.t)
    return loc(
      `Наступний караван за ${Math.ceil(p.giftCd - G.t)} с`,
      `Next caravan in ${Math.ceil(p.giftCd - G.t)} s`,
    );
  if (p.res[k] < GIFT_AMOUNT[k]) return loc('Бракує ресурсів', 'Not enough resources');
  if (!p.hq || p.hq.dead || !q.hq || q.hq.dead) return loc('Немає замку', 'No castle');
  p.res[k] -= GIFT_AMOUNT[k];
  p.giftCd = G.t + GIFT_COOLDOWN;
  p.stats.giftsSent += GIFT_AMOUNT[k];
  const cargo: Bag = { wood: 0, ore: 0, steel: 0, food: 0, crystal: 0 };
  cargo[k] = GIFT_AMOUNT[k];
  const c = addConvoy(p.hq, q.hq, cargo);
  c.giftTo = q.id;
  c.hp = c.maxhp = 60;
  c.L0 = dist(p.hq.x, p.hq.y, q.hq.x, q.hq.y);
  return null;
}

export function ping(p: Player, x: number, y: number, k: PingKind) {
  if (!PINGS[k]) return loc('Немає такого сигналу', 'No such signal');
  if (p.pingCd > G.t) return null;
  p.pingCd = G.t + 1;
  G.pings.push({ x, y, k, owner: p.id, until: G.t + PING_TIME });
  if (G.pings.length > 40) G.pings.shift();
  for (const a of allyIds(p.id)) notify(a, `${p.name}: ${PINGS[k].toLowerCase()}`);
  return null;
}

export function say(p: Player, to: number, k: SayKind) {
  const q = G.players[to];
  if (!q || q.id === p.id || !q.alive) return loc('Немає такого королівства', 'No such kingdom');
  if (!MESSAGES[k]) return loc('Немає такого повідомлення', 'No such message');
  if (p.sayCd > G.t) return loc('Гонець ще в дорозі', 'The messenger is still on the road');
  p.sayCd = G.t + 3;
  const tx = LANG === 'en' ? MESSAGES[k][1] : MESSAGES[k][0];
  notify(q.id, `${p.name}: «${tx}»`);
  // bots answer simple courtesy and remember a threat
  if (q.bot) {
    if (k === 'hi' || k === 'thanks') notify(p.id, `${q.name}: «${loc('Взаємно', 'Likewise')}»`);
    else if (k === 'warn') {
      q.ai.grudge = p.id;
      notify(p.id, `${q.name}: «${loc('Побачимо', 'We shall see')}»`);
    } else if (k === 'peace' || k === 'together') {
      notify(
        p.id,
        `${q.name}: «${loc('Запропонуй союз, і поговоримо', 'Offer an alliance and we will talk')}»`,
      );
    }
  }
  return null;
}

export function diploTick() {
  if (G.reqs.length)
    G.reqs = G.reqs.filter(
      (r) => r.until > G.t && G.players[r.from].alive && G.players[r.to].alive,
    );
  if (G.pings.length) G.pings = G.pings.filter((q) => q.until > G.t);
  if (!G.pacts.length) return;
  for (const x of G.pacts) {
    const A = G.players[x.a],
      B = G.players[x.b];
    if (!A.alive || !B.alive) {
      x.until = 0;
      continue;
    }
    if (!x.warned && x.until - G.t <= 60) {
      x.warned = true;
      notify(
        x.a,
        loc(`Союз з ${B.name} завершиться за 1 хв`, `Alliance with ${B.name} ends in 1 min`),
      );
      notify(
        x.b,
        loc(`Союз з ${A.name} завершиться за 1 хв`, `Alliance with ${A.name} ends in 1 min`),
      );
    }
    if (x.until <= G.t) {
      notify(x.a, loc(`Союз з ${B.name} завершився`, `Alliance with ${B.name} has ended`));
      notify(x.b, loc(`Союз з ${A.name} завершився`, `Alliance with ${A.name} has ended`));
      logEvent('pactEnd', x.a, { v: x.b });
    }
  }
  const keep = G.pacts.filter((x) => x.until > G.t);
  if (keep.length !== G.pacts.length) {
    for (const x of G.pacts) if (!keep.includes(x)) setPact(x.a, x.b, 0);
    G.pacts = keep;
  }
}
