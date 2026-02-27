const STORAGE_KEY = "dice_guest_id";

/**
 * Retourne un UUID invité persistant (localStorage).
 * Utilisé pour jouer en invité sans compte.
 */
export function getOrCreateGuestId(): string {
  if (typeof window === "undefined") {
    return "";
  }
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
