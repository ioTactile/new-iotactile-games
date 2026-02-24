import type { Result } from "typescript-result";

/**
 * Port pour le hachage et la vérification des mots de passe.
 * L'implémentation (ex. bcrypt) reste dans les adapters.
 */
export interface PasswordHasherPort {
	/** Hash un mot de passe en clair. Ne jamais stocker le clair. */
	hash(plainPassword: string): Promise<Result<string, Error>>;

	/** Compare un mot de passe en clair au hash stocké (timing-safe). */
	compare(
		plainPassword: string,
		hashedPassword: string,
	): Promise<Result<boolean, Error>>;
}
