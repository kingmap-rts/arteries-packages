# @caspen13/arteries-core

The deterministic simulation of «Артерії». The browser runs it to play; the server can run it
to re-simulate a match from its replay. Same seed + same intents in the same order = the same
world everywhere.

```ts
import { createGame, rules } from '@caspen13/arteries-core';

const game = createGame({ seed: 42, diff: 1, humans: { 0: 'Аня' } });

game.apply(0, { t: 'train', type: 'inf' }); // null, or a message for the player
game.step(); // one tick (TICK = 0.1 s = one server turn)
game.hash(); // compare with other clients every HASH_EVERY turns

game.world.units; // read-only view for the renderer
game.map.terrain[y * rules.MAP_W + x] === rules.Terrain.Forest;
game.buildError(0, x, y); // why a post cannot go there, or null
game.drainNotices(); // [seat, text] for the HUD
rules.setLang('en'); // display language of tables and notices
```

Several games can live in one process (a server checking matches, tests): every `Game` keeps
its own world, map and random stream.

## What is exported

| Export                              | For                                                                                             |
| ----------------------------------- | ----------------------------------------------------------------------------------------------- |
| `createGame`, `Game`, `TICK`        | running a match                                                                                 |
| `rules`                             | rule tables (`UNITS`, `BUILDINGS`, `PATHS`, `PERKS`, …), map constants, pure helpers for the UI |
| `World`, `Player`, `Unit`, …        | types of the world the renderer reads                                                           |
| everything from `arteries-protocol` | `Intent`, `ClientMsg`, `Replay`, `cleanIntent`, …                                               |

## Inside

```
src/
  index.ts, game.ts, rules.ts     public API
  sim/
    state.ts        the active match (the only mutable module state)
    update.ts       one tick: every system in a fixed order
    hash.ts         stateHash()
    config/         rule tables: map, units, buildings, economy, network, diplomacy, paths, ai
    world/          types, map generation, new game, entity factories, events
    systems/        one mechanic per file: network, logistics, combat, movement, squads,
                    sabotage, capture, diplomacy, market, paths, victory, pathfinding
    commands/       player intents → systems
    ai/             bots: bot (main loop), campaign, diplomacy, market, paths
    modifiers.ts    numbers changed by paths and perks
    i18n.ts         display language
    util/           seeded rng, noise, geometry, resource bags
test/
  golden.test.ts  4 recorded matches (31 000 ticks, every intent type) must re-simulate to the
                  same hashes — the guard against accidental simulation changes
```
