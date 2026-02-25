import type { Email } from '../value-objects/Email.js';
import type { UserId } from '../value-objects/UserId.js';

/**
 * Entidad de dominio: usuario del sistema (administrador de conversaciones).
 * La contraseña nunca se almacena en claro; solo el hash (responsabilidad de infraestructura).
 */
export class User {
  constructor(
    readonly id: UserId,
    readonly email: Email,
    readonly passwordHash: string
  ) {
    if (!passwordHash || passwordHash.length < 1) {
      throw new Error('User: passwordHash no puede estar vacío');
    }
  }
}
