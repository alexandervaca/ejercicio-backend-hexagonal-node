import type { ITokenService, TokenPayload } from '../../domain/ports/ITokenService.js';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../domain/errors/UnauthorizedError.js';

/**
 * Adaptador: emisión y verificación de JWT.
 */
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresInSeconds: number = 86400
  ) {}

  async generate(payload: TokenPayload): Promise<string> {
    return jwt.sign(
      { userId: payload.userId, email: payload.email },
      this.secret,
      { expiresIn: this.expiresInSeconds }
    );
  }

  async verify(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string; email: string };
      return { userId: decoded.userId, email: decoded.email };
    } catch {
      throw new UnauthorizedError('Token inválido o expirado');
    }
  }
}
