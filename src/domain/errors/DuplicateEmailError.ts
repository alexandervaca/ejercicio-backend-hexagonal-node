import { DomainError } from './DomainError.js';

export class DuplicateEmailError extends DomainError {
  readonly code = 'DUPLICATE_EMAIL';

  constructor(message = 'Ya existe un usuario con ese email') {
    super(message);
  }
}
