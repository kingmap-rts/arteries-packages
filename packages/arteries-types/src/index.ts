/**
 * @kingmap-rts/arteries-types — every type shared by the projects of «Артерії»: the game's
 * vocabulary, intents and messages, the world the simulation produces, the rule table shapes,
 * the WebSocket protocol, replays and the backend's HTTP API — plus the shared constants as
 * enums (lockstep clock, limits, map codes). No logic here.
 */
export * from './game/map';
export * from './net/lockstep';
export type * from './game/vocabulary';
export type * from './game/message';
export type * from './game/intent';
export type * from './game/world';
export type * from './game/rules';
export type * from './game/match';
export type * from './net/messages';
export type * from './net/replay';
export type * from './api/http';
