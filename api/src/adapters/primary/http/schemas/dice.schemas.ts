import { z } from "zod";

export const createDiceSessionBodySchema = z.object({
  name: z.string().min(1).max(100),
  displayName: z.string().min(1).max(50).optional(),
  guestId: z.uuid().optional(),
});

export const joinDiceSessionBodySchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  guestId: z.uuid().optional(),
});

export const diceSessionIdParamsSchema = z.object({
  sessionId: z.uuid(),
});

export type CreateDiceSessionBody = z.infer<typeof createDiceSessionBodySchema>;
export type JoinDiceSessionBody = z.infer<typeof joinDiceSessionBodySchema>;
export type DiceSessionIdParams = z.infer<typeof diceSessionIdParamsSchema>;
