import { DomainError } from './DomainError.js';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor(message = 'Credenciales inválidas') {
    super(message);
  }
}
