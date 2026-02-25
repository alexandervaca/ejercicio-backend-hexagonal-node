import { DomainError } from './DomainError.js';

export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, message?: string) {
    super(message ?? `Recurso no encontrado: ${resource}`);
  }
}
