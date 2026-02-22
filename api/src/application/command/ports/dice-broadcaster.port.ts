/**
 * Port pour diffuser les mises à jour du jeu Dice en temps réel (WebSocket).
 * L'adapteur primary (WebSocket) implémente ce port.
 */
export interface DiceBroadcasterPort {
  /** Envoyer un message à tous les clients connectés à une session. */
  broadcast(sessionId: string, payload: unknown): void;
}
