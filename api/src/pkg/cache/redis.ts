import type { RedisClientType } from "redis";
import { createClient } from "redis";
import { config } from "@/pkg/config/index.ts";

let client: RedisClientType | null = null;
let connecting = false;

export function getRedisClient(): RedisClientType | null {
	if (!config.cache?.redisUrl) return null;
	if (client) return client;
	if (connecting) return null;

	connecting = true;
	client = createClient({
		url: config.cache.redisUrl,
	});

	client.on("error", (error) => {
		// eslint-disable-next-line no-console
		console.error("[redis] connection error", error);
	});

	void client
		.connect()
		.catch((error) => {
			// eslint-disable-next-line no-console
			console.error("[redis] failed to connect", error);
			client = null;
		})
		.finally(() => {
			connecting = false;
		});

	return client;
}

