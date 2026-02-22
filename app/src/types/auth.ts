/** Rôle utilisateur (aligné API). */
export const Role = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** Utilisateur côté front (sans mot de passe, aligné GET /auth/me). */
export interface User {
  id: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

/** Payload de connexion (aligné POST /auth/login). */
export interface LoginCredentials {
  email: string;
  password: string;
}

/** Réponse du login (accessToken dans le body, refresh en cookie). */
export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

/** Payload d'inscription (aligné POST /auth/register). */
export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  role?: Role;
}
