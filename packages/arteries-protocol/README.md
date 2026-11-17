# @caspen13/arteries-protocol

The contract between the game server and the browser. No simulation, no runtime dependencies.

- **Vocabulary** — `Resource`, `UnitType`, `SpecType`, `PathId`, `PerkId`, `Difficulty`, …
- **Intents** — `Intent` (every player command) and `cleanIntent()`, the strict validator the
  server runs on everything a player sends.
- **Messages** — `ClientMsg` / `ServerMsg` (JSON `{ t: ... }` over one WebSocket), `TURN_MS`,
  `HASH_EVERY`, `MAX_PLAYERS`, `spreadSeats()`.
- **Replays** — `Replay` (seed + every intent with its tick + agreed hashes),
  `cleanReplay()`, `REPLAY_MAX_BYTES`.

```ts
import {
  cleanIntent,
  type ClientMsg,
  type ServerMsg,
} from '@caspen13/arteries-protocol';

const m: ClientMsg = JSON.parse(data);
if (m.t === 'i') {
  const intent = cleanIntent(m.i); // null when malformed or server-only
  if (intent) pending.push([seat, intent]);
}
```

## How a match runs (lockstep)

```
browser ──{t:'i', intent}──▶ server ──{t:'turn', n, [[seat, intent]…]}──▶ every browser
browser ──{t:'hash', n, h}─▶ server ──{t:'desync', n}──────────────────▶ (if hashes differ)
```

The server orders intents into turns (one every `TURN_MS`); every browser applies turn `n`
and simulates tick `n` with `@caspen13/arteries-core`, so all worlds stay identical.
