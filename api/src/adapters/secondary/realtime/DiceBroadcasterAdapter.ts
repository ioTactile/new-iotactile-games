import type { DiceBroadcasterPort } from "@/application/command/ports/dice-broadcaster.port.ts";

type Send = (payload: unknown) => void;

/**
 * Adaptateur in-memory pour diffuser les événements Dice à tous les clients
 * connectés à une session (WebSocket). Les sockets sont enregistrés au moment
 * de la connexion WS.
 */
export class DiceBroadcasterAdapter implements DiceBroadcasterPort {
  private readonly rooms = new Map<string, Set<Send>>();

  register(sessionId: string, send: Send): () => void {
    if (!this.rooms.has(sessionId)) {
      this.rooms.set(sessionId, new Set());
    }
    this.rooms.get(sessionId)!.add(send);
    return () => {
      this.rooms.get(sessionId)?.delete(send);
      if (this.rooms.get(sessionId)?.size === 0) {
        this.rooms.delete(sessionId);
      }
    };
  }

  broadcast(sessionId: string, payload: unknown): void {
    const room = this.rooms.get(sessionId);
    if (!room) return;
    const message =
      typeof payload === "string" ? payload : JSON.stringify(payload);
    for (const send of room) {
      try {
        send(message);
      } catch {
        // Ignorer les erreurs d'envoi (client déconnecté)
      }
    }
  }
}
