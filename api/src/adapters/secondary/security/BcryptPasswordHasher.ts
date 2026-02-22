import type { PasswordHasherPort } from "@/application/command/ports/password-hasher.port.ts";
import { Result } from "typescript-result";
import { hash as bcryptHash, compare as bcryptCompare } from "bcrypt";

/** Nombre de rounds de sel (OWASP recommandé : 10–12). */
const SALT_ROUNDS = 12;

export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(plainPassword: string): Promise<Result<string, Error>> {
    try {
      const hashed = await bcryptHash(plainPassword, SALT_ROUNDS);
      return Result.ok(hashed);
    } catch (error) {
      return Result.error(error as Error);
    }
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<Result<boolean, Error>> {
    try {
      const match = await bcryptCompare(plainPassword, hashedPassword);
      return Result.ok(match);
    } catch (error) {
      return Result.error(error as Error);
    }
  }
}
