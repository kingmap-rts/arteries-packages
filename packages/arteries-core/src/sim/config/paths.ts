/** Paths (Шляхи): costs, traits, tier perks and the ultimate cooldown. */
import type { PathId, PerkId, UnitType } from '../world/types';

export interface PathSpec {
  name: string;
  /** unique unit of the path */
  unit: UnitType;
  /** what the path gives at once */
  trait: string;
  /** tiers 2-4: pick one of two */
  perks: [PerkId, PerkId][];
}
export interface PerkSpec {
  name: string;
  desc: string;
  /** tier-4 ability used with cast */
  ult?: 1;
}

// Chosen in the match with mana crystals. Tier 1 (3💎): trait + unique unit. Tiers 2-4: pick one of two.
export const PATH_COST: number[] = [3, 4, 6, 9];

export const ULT_COOLDOWN = 180;

export const PATHS: Record<PathId, PathSpec> = {
  guild: {
    name: 'Гільдія Купців',
    unit: 'builder',
    trait: 'Шляхи до 11 клітинок',
    perks: [
      ['carav', 'cheap'],
      ['repair', 'reach'],
      ['ward', 'road'],
    ],
  },
  shadow: {
    name: 'Тіньове Братство',
    unit: 'arsonist',
    trait: 'Підпал за 4 с',
    perks: [
      ['burn60', 'tough'],
      ['bag', 'scorch'],
      ['panic', 'night'],
    ],
  },
  forge: {
    name: 'Орден Кузні',
    unit: 'golem',
    trait: 'Кузні й замок +60% сталі',
    perks: [
      ['cheapsiege', 'deploy'],
      ['ammo', 'walls'],
      ['rain', 'rally'],
    ],
  },
  land: {
    name: 'Земельний Союз',
    unit: 'militia',
    trait: 'Пости захоплюють землю радіусом 7',
    perks: [
      ['bread', 'growth'],
      ['labor', 'granary'],
      ['pitch', 'charter'],
    ],
  },
};

export const PERKS: Record<PerkId, PerkSpec> = {
  carav: { name: 'Швидкі каравани', desc: 'Каравани на 40% швидші й везуть 11 замість 8' },
  cheap: { name: 'Дешеві пости', desc: 'Торгові пости на 30% дешевші' },
  repair: { name: 'Ремонтні бригади', desc: 'Твої підпалені дороги лагодяться вдвічі швидше' },
  reach: {
    name: 'Обози в поході',
    desc: 'Бійці мають постачання на 3 клітинки далі від твоїх земель',
  },
  ward: {
    name: 'Чари шляху',
    desc: '30 с усі твої пости вважаються з’єднаними, дороги не ріжуться',
    ult: 1,
  },
  road: {
    name: 'Королівський тракт',
    desc: 'Вибрана дорога 2 хв не горить і не ріжеться, каравани по ній удвічі швидші',
    ult: 1,
  },
  burn60: { name: 'Довге полум’я', desc: 'Підпалена дорога горить 60 с замість 40' },
  tough: { name: 'Загартовані розбійники', desc: 'Розбійники мають +25% здоров’я' },
  bag: { name: 'Глибокі торби', desc: 'Розбійник несе 35 здобичі замість 20' },
  scorch: { name: 'Випалена земля', desc: 'Підпал спалює 40% запасу на обох постах дороги' },
  panic: { name: 'Паніка', desc: 'Ворожий пост 45 с не відправляє караванів', ult: 1 },
  night: { name: 'Ніч довгих ножів', desc: 'Усі ворожі дороги в радіусі 8 горять 20 с', ult: 1 },
  cheapsiege: { name: 'Дешеві требушети', desc: 'Требушети на 25% дешевші' },
  deploy: { name: 'Вишколені обслуги', desc: 'Требушет розгортається за 1 с замість 2' },
  ammo: { name: 'Повні сагайдаки', desc: 'Стріли вдвічі дешевші, запас +50%' },
  walls: { name: 'Товсті мури', desc: 'Фортеці й замок +30% міцності' },
  rain: {
    name: 'Вогняний дощ',
    desc: '10 с вогонь падає в радіусі 3: б’є ворожі будівлі й війська',
    ult: 1,
  },
  rally: {
    name: 'Заклик під прапори',
    desc: 'Миттєво 8 латників у найближчій вежі чи замку',
    ult: 1,
  },
  bread: { name: 'Щедрі поля', desc: 'Хліба на 25% більше' },
  growth: { name: 'Великі родини', desc: 'Населення росте в 1,5 раза швидше' },
  labor: {
    name: 'Цехи й артілі',
    desc: 'Шахтам, фермам і лісорубкам потрібно 2 робітники замість 4',
  },
  granary: { name: 'Великі комори', desc: 'Сховище на 50% більше' },
  pitch: { name: 'Вила й коси', desc: '6 ополченців на 60 с біля найближчого поста', ult: 1 },
  charter: {
    name: 'Земельна грамота',
    desc: 'Пост назавжди захоплює землю на 3 клітинки ширше',
    ult: 1,
  },
};
