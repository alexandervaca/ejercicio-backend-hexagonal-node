/**
 * Base para excepciones de dominio.
 * Permite a los adaptadores (HTTP) identificar y mapear a códigos de estado.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
