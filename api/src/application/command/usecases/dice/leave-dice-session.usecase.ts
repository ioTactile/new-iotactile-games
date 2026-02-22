import type { DiceSessionPlayerRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionRepository } from "@/domain/dice/dice.repository.ts";
import { Result } from "typescript-result";

export interface LeaveDiceSessionInput {
  sessionId: string;
  userId: string | null;
  guestId: string | null;
}

export class LeaveDiceSessionUsecase {
  private readonly sessionRepo: DiceSessionRepository;
  private readonly playerRepo: DiceSessionPlayerRepository;

  constructor(
    sessionRepo: DiceSessionRepository,
    playerRepo: DiceSessionPlayerRepository,
  ) {
    this.sessionRepo = sessionRepo;
    this.playerRepo = playerRepo;
  }

  async execute(input: LeaveDiceSessionInput): Promise<Result<void, Error>> {
    if (!input.userId && !input.guestId) {
      return Result.error(new Error("USER_OR_GUEST_REQUIRED"));
    }

    const sessionResult = await this.sessionRepo.findById(input.sessionId);
    if (!sessionResult.ok) return sessionResult;
    const session = sessionResult.value;
    if (!session) {
      return Result.error(new Error("SESSION_NOT_FOUND"));
    }
    if (session.status !== "WAITING") {
      return Result.error(new Error("CANNOT_LEAVE_STARTED_GAME"));
    }

    const playerResult = await this.playerRepo.findBySessionAndUserOrGuest(
      input.sessionId,
      input.userId,
      input.guestId,
    );
    if (!playerResult.ok) return playerResult;
    const player = playerResult.value;
    if (!player) {
      return Result.error(new Error("NOT_IN_SESSION"));
    }

    const removed = await this.playerRepo.removePlayer(
      input.sessionId,
      player.slot,
    );
    if (!removed.ok) return removed;
    if (!removed.value) {
      return Result.error(new Error("REMOVE_FAILED"));
    }

    const countResult = await this.playerRepo.countBySession(input.sessionId);
    if (!countResult.ok) return countResult;
    if (countResult.value === 0) {
      await this.sessionRepo.updateStatus(input.sessionId, "WAITING");
      // Option: supprimer la session si plus personne. Pour l’instant on la laisse.
    }

    return Result.ok(undefined);
  }
}
