import { DomainError } from './DomainError.js';

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor(message = 'No autorizado') {
    super(message);
  }
}
