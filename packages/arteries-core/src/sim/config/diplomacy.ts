/** Alliances, gifts, map signals and short messages. */
import type { GiftResource, PingKind, SayKind } from '@caspen13/arteries-protocol';

// Pacts last 8 min and can be renewed by both sides. Breaking one early marks you a traitor for 2 min:
// no new alliances in that time. Allies never fight, share supply and do not cut each other's roads.
// There is still one winner, so every alliance ends some day.
export const PACT_TIME = 480;

export const TRAITOR_TIME = 120;

export const OFFER_TIME = 30;

export const ALLY_MAX = 2;

export const GIFT_COOLDOWN = 10;

export const PING_TIME = 8;

export const GIFT_AMOUNT: Record<GiftResource, number> = {
  wood: 30,
  steel: 30,
  food: 30,
  crystal: 2,
};

export const PINGS: Record<PingKind, string> = {
  attack: 'Атакуймо сюди',
  help: 'Допоможи тут',
  retreat: 'Відходь звідси',
};

// short messages between rulers (shown to the recipient as a messenger notice)
export const MESSAGES: Record<SayKind, [uk: string, en: string]> = {
  hi: ['Вітаю, сусіде!', 'Greetings, neighbour!'],
  peace: ['Пропоную мир: не чіпаймо одне одного', 'I offer peace: let us leave each other alone'],
  help: ['Допоможи мені, прошу!', 'Please help me!'],
  together: ['Ходімо разом на лідера', 'Let us march on the leader together'],
  thanks: ['Дякую!', 'Thank you!'],
  warn: [
    'Відступи від моїх кордонів, або буде війна',
    'Pull back from my borders, or there will be war',
  ],
};
