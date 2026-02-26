import type { RedisClientType } from "redis";
import { Result } from "typescript-result";
import type { DiceSessionRepository } from "@/domain/dice/dice.repository.ts";
import type { DiceSessionType } from "@/domain/dice/dice.type.ts";

const PUBLIC_WAITING_KEY = "dice:sessions:public:waiting";

export class CachedDiceSessionRepository implements DiceSessionRepository {
	private readonly inner: DiceSessionRepository;

	private readonly redis: RedisClientType | null;

	private readonly publicWaitingTtlSeconds: number;

	constructor(options: {
		inner: DiceSessionRepository;
		redis: RedisClientType | null;
		publicWaitingTtlSeconds: number;
	}) {
		this.inner = options.inner;
		this.redis = options.redis;
		this.publicWaitingTtlSeconds = options.publicWaitingTtlSeconds;
	}

	async create(session: {
		name: string;
		isPublic?: boolean;
		createdBy: {
			userId: string | null;
			guestId: string | null;
			displayName: string;
		};
	}): Promise<Result<DiceSessionType, Error>> {
		return this.inner.create(session);
	}

	async findById(id: string): Promise<Result<DiceSessionType | null, Error>> {
		return this.inner.findById(id);
	}

	async findByJoinCode(
		joinCode: string,
	): Promise<Result<DiceSessionType | null, Error>> {
		return this.inner.findByJoinCode(joinCode);
	}

	async findPublicWaiting(): Promise<Result<DiceSessionType[], Error>> {
		if (!this.redis) {
			return this.inner.findPublicWaiting();
		}

		try {
			const cached = await this.redis.get(PUBLIC_WAITING_KEY);
			if (cached) {
				const parsed = JSON.parse(cached) as Array<
					Omit<DiceSessionType, "createdAt" | "updatedAt"> & {
						createdAt: string;
						updatedAt: string;
					}
				>;

				const normalized = parsed.map((session) => ({
					...session,
					createdAt: new Date(session.createdAt),
					updatedAt: new Date(session.updatedAt),
				}));

				return Result.ok(normalized);
			}
		} catch {
			// En cas d'erreur Redis, on retombe sur la source de vérité (Prisma)
		}

		const result = await this.inner.findPublicWaiting();
		if (!result.ok) return result;

		try {
			await this.redis.set(PUBLIC_WAITING_KEY, JSON.stringify(result.value), {
				EX: this.publicWaitingTtlSeconds,
			});
		} catch {
			// Si l'écriture dans le cache échoue, on ne bloque pas la requête
		}

		return result;
	}

	async updateStatus(
		id: string,
		status: Parameters<DiceSessionRepository["updateStatus"]>[1],
	): Promise<Result<void, Error>> {
		return this.inner.updateStatus(id, status);
	}

	async delete(id: string): Promise<Result<void, Error>> {
		return this.inner.delete(id);
	}
}
