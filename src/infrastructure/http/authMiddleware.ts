import type { Request, Response, NextFunction } from 'express';
import type { JwtTokenService } from '../auth/JwtTokenService.js';

export function authMiddleware(tokenService: JwtTokenService) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token requerido' });
      return;
    }
    const token = authHeader.slice(7);
    try {
      const payload = await tokenService.verify(token);
      (req as Request & { userId?: string; userEmail?: string }).userId = payload.userId;
      (req as Request & { userId?: string; userEmail?: string }).userEmail = payload.email;
      next();
    } catch {
      res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido o expirado' });
    }
  };
}
