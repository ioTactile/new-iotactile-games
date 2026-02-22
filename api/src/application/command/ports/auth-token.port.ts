import type { Role } from "@/domain/user/user.type.ts";
import type { Result } from "typescript-result";

/** Payload minimal pour l'access token (ex. JWT). */
export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  role: Role;
}

/** Payload pour le refresh token (ex. JWT). */
export interface RefreshTokenPayload {
  sub: string; // userId
  email: string;
  role: Role;
}

/**
 * Port pour l'émission et la vérification des tokens d'authentification (JWT).
 * L'implémentation reste dans les adapters (ex. @fastify/jwt).
 */
export interface AuthTokenPort {
  /** Émet un access token (courte durée). */
  issueAccessToken(payload: AccessTokenPayload): Promise<Result<string, Error>>;

  /** Émet un refresh token (longue durée). */
  issueRefreshToken(
    payload: RefreshTokenPayload,
  ): Promise<Result<string, Error>>;

  /** Vérifie un access token et retourne le payload. */
  verifyAccessToken(token: string): Promise<Result<AccessTokenPayload, Error>>;

  /** Vérifie un refresh token et retourne le payload. */
  verifyRefreshToken(
    token: string,
  ): Promise<Result<RefreshTokenPayload, Error>>;
}
