/**
 * @caspen13/arteries-protocol — the contract between the game server and the browser:
 * the game's vocabulary, player intents, WebSocket messages, replays and their validators.
 * No simulation here; that is @caspen13/arteries-core.
 */
export * from './vocabulary';
export * from './intent';
export * from './messages';
export * from './replay';
