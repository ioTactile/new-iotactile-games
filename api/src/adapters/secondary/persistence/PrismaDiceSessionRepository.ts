import type { DiceSessionRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionType } from "@/domain/dice/dice.type.ts";
import { DiceSessionStatus } from "@/domain/dice/dice.type.ts";
import { prisma } from "@/pkg/database/prisma.ts";
import { Result } from "typescript-result";

function mapStatus(
  s: "WAITING" | "PLAYING" | "FINISHED",
): DiceSessionType["status"] {
  return s as DiceSessionType["status"];
}

function toSession(row: {
  id: string;
  name: string;
  status: "WAITING" | "PLAYING" | "FINISHED";
  createdAt: Date;
  updatedAt: Date;
}): DiceSessionType {
  return {
    id: row.id,
    name: row.name,
    status: mapStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaDiceSessionRepository implements DiceSessionRepository {
  async create(session: {
    name: string;
    createdBy: {
      userId: string | null;
      guestId: string | null;
      displayName: string;
    };
  }): Promise<Result<DiceSessionType, Error>> {
    try {
      const created = await prisma.diceSession.create({
        data: {
          name: session.name,
          status: "WAITING",
          players: {
            create: {
              slot: 1,
              userId: session.createdBy.userId,
              guestId: session.createdBy.guestId,
              displayName: session.createdBy.displayName,
              orderIndex: 0,
            },
          },
        },
      });
      return Result.ok(toSession(created));
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  async findById(id: string): Promise<Result<DiceSessionType | null, Error>> {
    try {
      const row = await prisma.diceSession.findUnique({
        where: { id },
      });
      return Result.ok(row ? toSession(row) : null);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  async updateStatus(
    id: string,
    status: DiceSessionType["status"],
  ): Promise<Result<void, Error>> {
    try {
      const prismaStatus =
        status === DiceSessionStatus.WAITING
          ? "WAITING"
          : status === DiceSessionStatus.PLAYING
            ? "PLAYING"
            : "FINISHED";
      await prisma.diceSession.update({
        where: { id },
        data: { status: prismaStatus },
      });
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error as Error);
    }
  }
}
