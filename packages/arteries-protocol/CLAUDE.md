# arteries-protocol — conventions

The wire contract of the game. Both `arteries-front` and `arteries-backend` depend on it, so
every change here is a change of the protocol between them.

## File layout

```
src/
  vocabulary.ts   // game words: Resource, UnitType, PathId, … (types only)
  intent.ts       // Intent union + cleanIntent()
  messages.ts     // ClientMsg / ServerMsg, TURN_MS, HASH_EVERY, MAX_PLAYERS, spreadSeats()
  replay.ts       // Replay + cleanReplay(), REPLAY_MAX_BYTES
  index.ts        // barrel
```

## Rules

- **No runtime dependencies, no simulation.** Types, constants and validators only.
- **Every new intent goes in three places**: the `Intent` union, `PLAYER_INTENTS` and a `case`
  in `cleanIntent()` that builds a clean copy (never return the input object itself).
- Validators **reject** anything they do not recognise; numbers are checked with
  `Number.isFinite`, seats with `0 <= seat < MAX_PLAYERS`, id lists are capped at 250.
- Changing a message shape or a constant (`TURN_MS`, `MAX_PLAYERS`) breaks old clients:
  bump the **minor** version and release front and backend together.
