import type { User } from '../entities/User.js';
import type { Email } from '../value-objects/Email.js';
import type { UserId } from '../value-objects/UserId.js';

/**
 * Puerto de salida: persistencia de usuarios.
 * La infraestructura (adaptador) implementa esta interfaz.
 */
export interface IUserRepository {
  save(user: User): Promise<void>;
  findByEmail(email: Email): Promise<User | null>;
  findById(id: UserId): Promise<User | null>;
}
