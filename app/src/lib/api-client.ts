const DEFAULT_API_URL = "http://localhost:3000";

/**
 * URL de base de l'API (côté client).
 * Utilise NEXT_PUBLIC_API_URL si défini, sinon http://localhost:3000 en dev.
 */
export function getApiUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  return url && url !== "undefined" ? url : DEFAULT_API_URL;
}

export const defaultFetchOptions: RequestInit = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

/**
 * URL WebSocket pour une route donnée (remplace http(s) par ws(s)).
 */
export function getWsUrl(path: string): string {
  const base = getApiUrl().replace(/^http/, "ws");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base.endsWith("/") ? `${base.slice(0, -1)}${p}` : `${base}${p}`;
}
