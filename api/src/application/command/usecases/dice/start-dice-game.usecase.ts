import type { DiceSessionPlayerRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionStateRepository } from "@/domain/dice/dice.repository.ts";
import {
  EMPTY_DICE_SCORES,
  NUM_DICES,
  MAX_TRIES,
  TOTAL_TURNS,
} from "@/domain/dice/dice.type.ts";
import { Result } from "typescript-result";

export interface StartDiceGameInput {
  sessionId: string;
  userId: string | null;
  guestId: string | null;
}

export class StartDiceGameUsecase {
  private readonly sessionRepo: DiceSessionRepository;
  private readonly playerRepo: DiceSessionPlayerRepository;
  private readonly stateRepo: DiceSessionStateRepository;

  constructor(
    sessionRepo: DiceSessionRepository,
    playerRepo: DiceSessionPlayerRepository,
    stateRepo: DiceSessionStateRepository,
  ) {
    this.sessionRepo = sessionRepo;
    this.playerRepo = playerRepo;
    this.stateRepo = stateRepo;
  }

  async execute(input: StartDiceGameInput): Promise<Result<void, Error>> {
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
      return Result.error(new Error("SESSION_ALREADY_STARTED_OR_FINISHED"));
    }

    const playersResult = await this.playerRepo.findBySession(input.sessionId);
    if (!playersResult.ok) return playersResult;
    const players = playersResult.value;
    if (players.length < 2) {
      return Result.error(new Error("MIN_TWO_PLAYERS_REQUIRED"));
    }

    const isCreator =
      players[0].userId === input.userId ||
      players[0].guestId === input.guestId;
    if (!isCreator) {
      return Result.error(new Error("ONLY_CREATOR_CAN_START"));
    }

    const scores: Record<number, typeof EMPTY_DICE_SCORES> = {};
    for (const p of players) {
      scores[p.slot] = { ...EMPTY_DICE_SCORES };
    }

    const firstSlot = players[0].slot;
    const createResult = await this.stateRepo.createState({
      sessionId: input.sessionId,
      currentPlayerSlot: firstSlot,
      remainingTurns: TOTAL_TURNS,
      dices: Array.from({ length: NUM_DICES }, () => ({
        face: 1,
        locked: false,
      })),
      triesLeft: MAX_TRIES,
      scores,
    });
    if (!createResult.ok) return createResult;

    const updateResult = await this.sessionRepo.updateStatus(
      input.sessionId,
      "PLAYING",
    );
    if (!updateResult.ok) return updateResult;

    return Result.ok(undefined);
  }
}
