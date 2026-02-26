import type { FastifyInstance, FastifyRequest } from "fastify";
import type { AccessTokenPayload } from "@/application/command/ports/auth-token.port.ts";

/** Type minimal pour le socket WebSocket (handler @fastify/websocket). */
interface DiceWsSocket {
	send(payload: string): void;
	close(code?: number, reason?: string): void;
	on(event: string, fn: (data?: string | Buffer) => void): void;
}

import {
	createDiceSessionBodySchema,
	diceSessionIdParamsSchema,
	joinByCodeBodySchema,
	joinDiceSessionBodySchema,
	listMyDiceSessionsQuerySchema,
} from "@/adapters/primary/http/schemas/dice.schemas.ts";
import { CachedDiceSessionRepository } from "@/adapters/secondary/persistence/CachedDiceSessionRepository.ts";
import { PrismaDiceSessionPlayerRepository } from "@/adapters/secondary/persistence/PrismaDiceSessionPlayerRepository.ts";
import { PrismaDiceSessionRepository } from "@/adapters/secondary/persistence/PrismaDiceSessionRepository.ts";
import { PrismaDiceSessionStateRepository } from "@/adapters/secondary/persistence/PrismaDiceSessionStateRepository.ts";
import { PrismaUserRepository } from "@/adapters/secondary/persistence/PrismaUserRepository.ts";
import { DiceBroadcasterAdapter } from "@/adapters/secondary/realtime/DiceBroadcasterAdapter.ts";
import { ChooseScoreUsecase } from "@/application/command/usecases/dice/choose-score.usecase.ts";
import { CreateDiceSessionUsecase } from "@/application/command/usecases/dice/create-dice-session.usecase.ts";
import { JoinDiceSessionUsecase } from "@/application/command/usecases/dice/join-dice-session.usecase.ts";
import { LeaveDiceSessionUsecase } from "@/application/command/usecases/dice/leave-dice-session.usecase.ts";
import { LockDiceUsecase } from "@/application/command/usecases/dice/lock-dice.usecase.ts";
import { RollDiceUsecase } from "@/application/command/usecases/dice/roll-dice.usecase.ts";
import { StartDiceGameUsecase } from "@/application/command/usecases/dice/start-dice-game.usecase.ts";
import { GetDiceSessionUsecase } from "@/application/query/usecases/dice/get-dice-session.usecase.ts";
import { ListMyDiceSessionsUsecase } from "@/application/query/usecases/dice/list-my-dice-sessions.usecase.ts";
import { ListPublicDiceSessionsUsecase } from "@/application/query/usecases/dice/list-public-dice-sessions.usecase.ts";
import { GetUserByIdUsecase } from "@/application/query/usecases/user/get-user-by-id.usecase.ts";
import { SCORE_KEYS } from "@/domain/dice/diceInputs.ts";
import { getRedisClient } from "@/pkg/cache/redis.ts";
import { config } from "@/pkg/config/index.ts";

const sessionRepo = new CachedDiceSessionRepository({
	inner: new PrismaDiceSessionRepository(),
	redis: getRedisClient(),
	publicWaitingTtlSeconds: config.cache.dice.publicSessionsTtlSeconds,
});
const playerRepo = new PrismaDiceSessionPlayerRepository();
const stateRepo = new PrismaDiceSessionStateRepository();
const broadcaster = new DiceBroadcasterAdapter();
const userRepo = new PrismaUserRepository();
const getUserById = new GetUserByIdUsecase(userRepo);

function getUserId(request: { user?: unknown }): string | null {
	const user = request.user as AccessTokenPayload | undefined;
	return user?.sub ?? null;
}

async function getDisplayName(
	request: { user?: unknown },
	bodyDisplayName?: string,
): Promise<string | null> {
	if (bodyDisplayName?.trim()) return bodyDisplayName.trim();
	const user = request.user as AccessTokenPayload | undefined;
	if (user?.sub) {
		const u = await getUserById.execute(user.sub);
		if (u.ok && u.value) return u.value.username;
	}
	return null;
}

export async function registerDiceRoutes(server: FastifyInstance) {
	const createUsecase = new CreateDiceSessionUsecase(sessionRepo);
	const joinUsecase = new JoinDiceSessionUsecase(sessionRepo, playerRepo);
	const leaveUsecase = new LeaveDiceSessionUsecase(sessionRepo, playerRepo);
	const startUsecase = new StartDiceGameUsecase(
		sessionRepo,
		playerRepo,
		stateRepo,
	);
	const getUsecase = new GetDiceSessionUsecase(
		sessionRepo,
		playerRepo,
		stateRepo,
	);
	const rollUsecase = new RollDiceUsecase(
		sessionRepo,
		playerRepo,
		stateRepo,
		broadcaster,
	);
	const lockUsecase = new LockDiceUsecase(
		sessionRepo,
		playerRepo,
		stateRepo,
		broadcaster,
	);
	const chooseScoreUsecase = new ChooseScoreUsecase(
		sessionRepo,
		playerRepo,
		stateRepo,
		broadcaster,
	);

	const listMySessionsUsecase = new ListMyDiceSessionsUsecase(
		sessionRepo,
		playerRepo,
	);
	const listPublicSessionsUsecase = new ListPublicDiceSessionsUsecase(
		sessionRepo,
	);

	server.addHook("preHandler", server.optionalAuth);

	server.get("/sessions/public", async (_request, reply) => {
		const result = await listPublicSessionsUsecase.execute();
		if (!result.ok) {
			return reply.status(500).send({ error: "Erreur serveur." });
		}
		return reply.status(200).send(result.value);
	});

	server.get<{ Querystring: unknown }>("/sessions", async (request, reply) => {
		const parsed = listMyDiceSessionsQuerySchema.safeParse(request.query);
		const query = parsed.success ? parsed.data : {};
		const userId = getUserId(request);
		const guestId = query.guestId ?? null;
		if (!userId && !guestId) {
			return reply.status(400).send({
				error:
					"Connexion ou guestId requis (fournir guestId en query pour invité).",
			});
		}
		const result = await listMySessionsUsecase.execute({ userId, guestId });
		if (!result.ok) {
			request.log.error(result.error);
			return reply.status(500).send({ error: "Erreur serveur." });
		}
		return reply.status(200).send(result.value);
	});

	server.post<{ Body: unknown }>("/sessions", async (request, reply) => {
		const parsed = createDiceSessionBodySchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.status(400).send({
				error: "VALIDATION_ERROR",
				details: parsed.error.flatten().fieldErrors,
			});
		}
		const body = parsed.data;
		const userId = getUserId(request);
		const guestId = body.guestId ?? null;
		if (!userId && !guestId) {
			return reply.status(400).send({
				error:
					"Connexion ou guestId requis (invité : fournir guestId + displayName).",
			});
		}
		const displayName =
			(await getDisplayName(request, body.displayName)) ??
			(body.displayName?.trim() || null);
		if (!displayName) {
			return reply.status(400).send({
				error:
					"displayName requis (ou connectez-vous pour utiliser votre pseudo).",
			});
		}

		const result = await createUsecase.execute({
			name: body.name,
			isPublic: body.isPublic ?? false,
			userId,
			guestId,
			displayName,
		});
		if (!result.ok) {
			const err = result.error.message;
			if (err === "DISPLAY_NAME_REQUIRED" || err === "USER_OR_GUEST_REQUIRED") {
				return reply.status(400).send({ error: result.error.message });
			}
			request.log.error(result.error);
			return reply.status(500).send({ error: "Erreur serveur." });
		}
		return reply.status(201).send(result.value);
	});

	server.post<{
		Params: { sessionId: string };
		Body: unknown;
	}>("/sessions/:sessionId/join", async (request, reply) => {
		const params = diceSessionIdParamsSchema.safeParse(request.params);
		if (!params.success) {
			return reply.status(400).send({ error: "sessionId invalide." });
		}
		const parsed = joinDiceSessionBodySchema.safeParse(request.body);
		if (!parsed.success) {
			return reply.status(400).send({
				error: "VALIDATION_ERROR",
				details: parsed.error.flatten().fieldErrors,
			});
		}
		const body = parsed.data;
		const userId = getUserId(request);
		const guestId = body.guestId ?? null;
		if (!userId && !guestId) {
			return reply.status(400).send({
				error:
					"Connexion ou guestId requis (invité : fournir guestId + displayName).",
			});
		}
		const displayName =
			(await getDisplayName(request, body.displayName)) ??
			(body.displayName?.trim() || null);
		if (!displayName) {
			return reply.status(400).send({
				error: "displayName requis.",
			});
		}

		const result = await joinUsecase.execute({
			sessionId: params.data.sessionId,
			userId,
			guestId,
			displayName,
		});
		if (!result.ok) {
			const err = result.error.message;
			if (err === "SESSION_NOT_FOUND")
				return reply.status(404).send({ error: err });
			if (
				err === "SESSION_ALREADY_STARTED_OR_FINISHED" ||
				err === "SESSION_FULL" ||
				err === "ALREADY_IN_SESSION" ||
				err === "DISPLAY_NAME_REQUIRED" ||
				err === "USER_OR_GUEST_REQUIRED"
			) {
				return reply.status(400).send({ error: err });
			}
			request.log.error(result.error);
			return reply.status(500).send({ error: "Erreur serveur." });
		}
		return reply.status(200).send(result.value);
	});

	server.post<{ Body: unknown }>(
		"/sessions/join-by-code",
		async (request, reply) => {
			const parsed = joinByCodeBodySchema.safeParse(request.body);
			if (!parsed.success) {
				return reply.status(400).send({
					error: "VALIDATION_ERROR",
					details: parsed.error.flatten().fieldErrors,
				});
			}
			const body = parsed.data;
			const userId = getUserId(request);
			const guestId = body.guestId ?? null;
			if (!userId && !guestId) {
				return reply.status(400).send({
					error:
						"Connexion ou guestId requis (invité : fournir guestId + displayName).",
				});
			}
			const displayName =
				(await getDisplayName(request, body.displayName)) ??
				(body.displayName?.trim() || null);
			if (!displayName) {
				return reply.status(400).send({
					error: "displayName requis.",
				});
			}
			const sessionByCodeResult = await sessionRepo.findByJoinCode(
				body.joinCode.trim().toUpperCase(),
			);
			if (!sessionByCodeResult.ok) {
				request.log.error(sessionByCodeResult.error);
				return reply.status(500).send({ error: "Erreur serveur." });
			}
			const session = sessionByCodeResult.value;
			if (!session) {
				return reply.status(404).send({ error: "SESSION_NOT_FOUND" });
			}
			const result = await joinUsecase.execute({
				sessionId: session.id,
				userId,
				guestId,
				displayName,
			});
			if (!result.ok) {
				const err = result.error.message;
				if (err === "SESSION_NOT_FOUND")
					return reply.status(404).send({ error: err });
				if (
					err === "SESSION_ALREADY_STARTED_OR_FINISHED" ||
					err === "SESSION_FULL" ||
					err === "ALREADY_IN_SESSION" ||
					err === "DISPLAY_NAME_REQUIRED" ||
					err === "USER_OR_GUEST_REQUIRED"
				) {
					return reply.status(400).send({ error: err });
				}
				request.log.error(result.error);
				return reply.status(500).send({ error: "Erreur serveur." });
			}
			return reply.status(200).send(result.value);
		},
	);

	server.post<{
		Params: { sessionId: string };
		Body: { guestId?: string };
	}>("/sessions/:sessionId/leave", async (request, reply) => {
		const params = diceSessionIdParamsSchema.safeParse(request.params);
		if (!params.success) {
			return reply.status(400).send({ error: "sessionId invalide." });
		}
		const userId = getUserId(request);
		const guestId = request.body?.guestId ?? null;
		if (!userId && !guestId) {
			return reply.status(400).send({
				error: "Connexion ou guestId requis.",
			});
		}

		const result = await leaveUsecase.execute({
			sessionId: params.data.sessionId,
			userId,
			guestId,
		});
		if (!result.ok) {
			const err = result.error.message;
			if (err === "SESSION_NOT_FOUND")
				return reply.status(404).send({ error: err });
			if (
				err === "CANNOT_LEAVE_STARTED_GAME" ||
				err === "NOT_IN_SESSION" ||
				err === "USER_OR_GUEST_REQUIRED"
			) {
				return reply.status(400).send({ error: err });
			}
			request.log.error(result.error);
			return reply.status(500).send({ error: "Erreur serveur." });
		}
		return reply.status(204).send();
	});

	server.post<{
		Params: { sessionId: string };
		Body: { guestId?: string };
	}>("/sessions/:sessionId/start", async (request, reply) => {
		const params = diceSessionIdParamsSchema.safeParse(request.params);
		if (!params.success) {
			return reply.status(400).send({ error: "sessionId invalide." });
		}
		const userId = getUserId(request);
		const guestId = request.body?.guestId ?? null;
		if (!userId && !guestId) {
			return reply.status(400).send({
				error: "Connexion ou guestId requis.",
			});
		}

		const result = await startUsecase.execute({
			sessionId: params.data.sessionId,
			userId,
			guestId,
		});
		if (!result.ok) {
			const err = result.error.message;
			if (err === "SESSION_NOT_FOUND")
				return reply.status(404).send({ error: err });
			if (
				err === "SESSION_ALREADY_STARTED_OR_FINISHED" ||
				err === "MIN_ONE_PLAYER_REQUIRED" ||
				err === "ONLY_CREATOR_CAN_START" ||
				err === "USER_OR_GUEST_REQUIRED"
			) {
				return reply.status(400).send({ error: err });
			}
			request.log.error(result.error);
			return reply.status(500).send({ error: "Erreur serveur." });
		}
		return reply.status(204).send();
	});

	server.get<{ Params: { sessionId: string } }>(
		"/sessions/:sessionId",
		async (request, reply) => {
			const params = diceSessionIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				return reply.status(400).send({ error: "sessionId invalide." });
			}

			const result = await getUsecase.execute(params.data.sessionId);
			if (!result.ok) {
				request.log.error(result.error);
				return reply.status(500).send({ error: "Erreur serveur." });
			}
			if (!result.value) {
				return reply.status(404).send({ error: "SESSION_NOT_FOUND" });
			}
			return reply.status(200).send(result.value);
		},
	);

	// WebSocket : listeners attachés de façon synchrone ; la validation async se fait dans connect()
	server.get(
		"/sessions/:sessionId/ws",
		{ websocket: true } as Record<string, unknown>,
		(connectionOrReq: unknown, requestOrReply: unknown): void => {
			// @fastify/websocket passe (socket, request) à l’exécution
			const socket = connectionOrReq as DiceWsSocket;
			const request = requestOrReply as FastifyRequest<{
				Params: { sessionId: string };
				Querystring: { token?: string; guestId?: string };
			}>;
			const params = diceSessionIdParamsSchema.safeParse(request.params);
			if (!params.success) {
				socket.close(1008, "sessionId invalide");
				return;
			}
			const sessionId = params.data.sessionId;
			const token =
				typeof request.query?.token === "string"
					? request.query.token
					: undefined;
			const guestId =
				typeof request.query?.guestId === "string"
					? request.query.guestId
					: undefined;

			let resolveCreds: (value: {
				userId: string | null;
				guestId: string | null;
			}) => void;
			let rejectCreds: (reason: Error) => void;
			const credsPromise = new Promise<{
				userId: string | null;
				guestId: string | null;
			}>((resolve, reject) => {
				resolveCreds = resolve;
				rejectCreds = reject;
			});

			const connect = async () => {
				let userId: string | null = null;
				let resolvedGuestId: string | null = null;
				if (token) {
					const result = await server.authToken.verifyAccessToken(token);
					if (result.ok) userId = result.value.sub;
				}
				if (!userId && guestId) resolvedGuestId = guestId;
				if (!userId && !resolvedGuestId) {
					socket.close(1008, "token ou guestId requis");
					rejectCreds(new Error("token ou guestId requis"));
					return;
				}

				const playerResult = await playerRepo.findBySessionAndUserOrGuest(
					sessionId,
					userId,
					resolvedGuestId,
				);
				if (!playerResult.ok || !playerResult.value) {
					socket.close(1008, "non membre de la session");
					rejectCreds(new Error("non membre de la session"));
					return;
				}

				resolveCreds({ userId, guestId: resolvedGuestId });

				const unregister = broadcaster.register(sessionId, (payload) => {
					socket.send(payload as string);
				});

				socket.on("close", () => {
					unregister();
				});

				const r = await getUsecase.execute(sessionId);
				if (r.ok && r.value) {
					socket.send(
						JSON.stringify({
							type: "STATE",
							payload: r.value,
						}),
					);
				}
			};

			socket.on("message", async (raw: string | Buffer | undefined) => {
				let creds: { userId: string | null; guestId: string | null };
				try {
					creds = await credsPromise;
				} catch {
					return;
				}
				let data: { type: string; payload?: unknown };
				try {
					const str =
						raw === undefined
							? ""
							: typeof raw === "string"
								? raw
								: raw.toString("utf8");
					data = JSON.parse(str) as { type: string; payload?: unknown };
				} catch {
					socket.send(JSON.stringify({ type: "ERROR", error: "INVALID_JSON" }));
					return;
				}

				if (data.type === "ROLL") {
					const res = await rollUsecase.execute({
						sessionId,
						userId: creds.userId,
						guestId: creds.guestId,
					});
					if (!res.ok) {
						socket.send(
							JSON.stringify({
								type: "ERROR",
								error: res.error.message,
							}),
						);
					}
					return;
				}

				if (data.type === "LOCK") {
					const diceIndex =
						typeof data.payload === "object" &&
						data.payload !== null &&
						"diceIndex" in data.payload
							? Number((data.payload as { diceIndex: number }).diceIndex)
							: NaN;
					if (Number.isNaN(diceIndex)) {
						socket.send(
							JSON.stringify({
								type: "ERROR",
								error: "diceIndex requis",
							}),
						);
						return;
					}
					const res = await lockUsecase.execute({
						sessionId,
						userId: creds.userId,
						guestId: creds.guestId,
						diceIndex,
					});
					if (!res.ok) {
						socket.send(
							JSON.stringify({
								type: "ERROR",
								error: res.error.message,
							}),
						);
					}
					return;
				}

				if (data.type === "CHOOSE_SCORE") {
					const scoreKey =
						typeof data.payload === "object" &&
						data.payload !== null &&
						"scoreKey" in data.payload
							? (data.payload as { scoreKey: string }).scoreKey
							: undefined;
					if (
						!scoreKey ||
						typeof scoreKey !== "string" ||
						!SCORE_KEYS.includes(scoreKey as (typeof SCORE_KEYS)[number])
					) {
						socket.send(
							JSON.stringify({
								type: "ERROR",
								error: "scoreKey invalide",
							}),
						);
						return;
					}
					const res = await chooseScoreUsecase.execute({
						sessionId,
						userId: creds.userId,
						guestId: creds.guestId,
						scoreKey: scoreKey as (typeof SCORE_KEYS)[number],
					});
					if (!res.ok) {
						socket.send(
							JSON.stringify({
								type: "ERROR",
								error: res.error.message,
							}),
						);
					}
				}
			});

			void connect();
		},
	);
}
