/**
 * @caspen13/arteries-protocol — the runtime half of the contract between the game server and
 * the browser: strict validators for what players send and the seat layout. The types and the
 * shared constants are in @caspen13/arteries-types.
 */
export { cleanIntent } from './intent';
export { cleanReplay } from './replay';
export { spreadSeats } from './seats';
