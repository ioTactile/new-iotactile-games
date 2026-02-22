import type { DiceSessionPlayerRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionStateRepository } from "@/domain/dice/dice.repository.ts";
import type {
  DiceSessionType,
  DiceSessionPlayerType,
  DiceSessionStateType,
} from "@/domain/dice/dice.type.ts";
import { Result } from "typescript-result";

export interface DiceSessionView {
  session: DiceSessionType;
  players: DiceSessionPlayerType[];
  state: DiceSessionStateType | null;
}

export class GetDiceSessionUsecase {
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

  async execute(
    sessionId: string,
  ): Promise<Result<DiceSessionView | null, Error>> {
    const sessionResult = await this.sessionRepo.findById(sessionId);
    if (!sessionResult.ok) return sessionResult;
    const session = sessionResult.value;
    if (!session) return Result.ok(null);

    const [playersResult, stateResult] = await Promise.all([
      this.playerRepo.findBySession(sessionId),
      this.stateRepo.findBySession(sessionId),
    ]);
    if (!playersResult.ok) return playersResult;
    if (!stateResult.ok) return stateResult;

    return Result.ok({
      session,
      players: playersResult.value,
      state: stateResult.value,
    });
  }
}
