import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Adaptador: hashing de contraseñas con bcrypt.
 */
export class BcryptPasswordHasher implements IPasswordHasher {
  async hash(plainPassword: string): Promise<string> {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
  }

  async verify(plainPassword: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hash);
  }
}
