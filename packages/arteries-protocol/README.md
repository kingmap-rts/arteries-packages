# @caspen13/arteries-protocol

The runtime half of the contract between the game server and the browser — no types here
(they are in `@caspen13/arteries-types`):

- `cleanIntent(x)` — strict validator for what a player sends; returns a clean `Intent` or null
  ('leave' is server-only and always rejected);
- `cleanReplay(x)` — shape check for replays uploaded by clients;
- `spreadSeats(k)` — spreads human seats around the ring of start positions.

```ts
import { cleanIntent } from '@caspen13/arteries-protocol';
import type { ClientMsg } from '@caspen13/arteries-types';

const m: ClientMsg = JSON.parse(data);
if (m.t === 'i') {
  const intent = cleanIntent(m.i);
  if (intent) pending.push([seat, intent]);
}
```
