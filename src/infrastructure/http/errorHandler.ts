import type { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../domain/errors/DomainError.js';
import { DuplicateEmailError } from '../../domain/errors/DuplicateEmailError.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';

export function domainErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError) {
    const status = statusFor(err);
    res.status(status).json({ error: err.code, message: err.message });
    return;
  }
  if (err instanceof Error) {
    if (err.message.includes('InvalidEmail') || err.message.includes('InvalidMessageContent')) {
      res.status(400).json({ error: 'VALIDATION_ERROR', message: err.message });
      return;
    }
  }
  console.error(err);
  res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
}

function statusFor(err: DomainError): number {
  if (err instanceof DuplicateEmailError) return 409;
  if (err instanceof InvalidCredentialsError) return 401;
  if (err instanceof UnauthorizedError) return 401;
  if (err instanceof NotFoundError) return 404;
  return 400;
}
