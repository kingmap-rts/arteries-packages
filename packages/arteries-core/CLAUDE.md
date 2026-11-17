# arteries-core — conventions

A **lockstep** simulation: every browser runs it and must end up bit-for-bit identical.
Anything that changes what `step()` computes is a breaking change for online play.

## Determinism rules

- All randomness through `rand()` / `randomInt()` (`sim/util/rng.ts`, seeded per match).
  Never `Math.random`, `Date`, `performance`, or iteration over unordered data.
- Trigonometry that affects the state uses `detSin` / `detCos`; distances use `dist`
  (`Math.sqrt` is exact everywhere).
- Do not reorder systems in `sim/update.ts` or calls inside a system, and do not change the
  order of `rand()` calls: that changes every match from that point on.
- Visual-only data (`world.fx`, `world.shots`, `terrV`, `ang`) must never be read by the sim.

## The golden test

`test/golden.test.ts` replays 4 recorded matches (`test/fixtures/golden.json`) and compares the
state hash every 100 ticks. It must stay green for refactors. When a change is **meant** to
alter the simulation (balance, new mechanic): regenerate the fixture in the same PR, say so in
the PR, and bump the **minor** version.

## Layout

- `sim/config/*` — pure data, typed (`UnitSpec`, `PathSpec`, …). Balance changes go here.
- `sim/systems/*` — one mechanic per file; functions work on the active match (`G` from
  `sim/state.ts`). New per-tick work is called from `sim/update.ts`.
- `sim/commands/apply.ts` — the only entry for player intents; validate inputs there.
- `sim/ai/*` — bots. They use the same systems and commands as players.
- `game.ts` — the `Game` object: every public method calls `activate()` first.
- `rules.ts` — the explicit read-only facade for UIs. Export from here only what a renderer
  needs; it is part of the public API.
- World and entity field names are read by renderers and hashed by `sim/hash.ts`: renaming a
  field means updating `hash.ts` without changing what is hashed.
