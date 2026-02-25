import express, { type Request, type Response, type NextFunction } from 'express';
import type { Container } from '../../composition/container.js';
import { domainErrorHandler } from './errorHandler.js';
import { authMiddleware } from './authMiddleware.js';

export function createApp(container: Container): express.Express {
  const app = express();
  app.use(express.json());

  app.post('/auth/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body ?? {};
      const result = await container.registerUser.execute({ email, password });
      res.status(201).json(result);
    } catch (e) {
      next(e);
    }
  });

  app.post('/auth/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body ?? {};
      const result = await container.loginUser.execute({ email, password });
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  app.get('/conversations', authMiddleware(container.tokenService), async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await container.listConversations.execute();
      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  app.get(
    '/conversations/:id/messages',
    authMiddleware(container.tokenService),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        const result = await container.listConversationMessages.execute(id);
        res.json(result);
      } catch (e) {
        next(e);
      }
    }
  );

  app.post(
    '/conversations/:id/messages',
    authMiddleware(container.tokenService),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        //console.log('req.params: ', req.params);
        //console.log('req.body: ', req.body);
        const { id } = req.params;
        const { content } = req.body ?? {};
        const result = await container.sendMessage.execute({
          conversationId: id,
          content,
        });
        res.status(201).json(result);
      } catch (e) {
        console.error('Error to container.sendMessage.execute: ', e);
        next(e);
      }
    }
  );

  app.use(domainErrorHandler);
  return app;
}
