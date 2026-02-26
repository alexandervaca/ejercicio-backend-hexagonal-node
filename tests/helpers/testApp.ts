import type { Express } from 'express';
import type { Container } from '../../src/composition/container.js';
import { loadConfig } from '../../src/composition/config.js';
import { createContainer } from '../../src/composition/container.js';
import { createApp } from '../../src/infrastructure/http/app.js';
import {
  TEST_DATABASE_URL,
  setupTestDatabase,
  getTestPrisma,
  cleanTestDatabase,
  closeTestDatabase,
} from './testDb.js';
import { FakeTelegramService } from './FakeTelegramService.js';

let app!: Express;
let container!: Container;

/**
 * App y container para tests de integración.
 * - Usa la misma instancia de Prisma que getTestPrisma() para que cleanTestDatabase
 *   y la app vean los mismos datos (evita 201 en lugar de 409 en email duplicado).
 * - Usa FakeTelegramService para que POST /conversations/:id/messages no llame a la API real (evita 500).
 */
export async function setupTestApp(): Promise<{ app: Express; container: Container }> {
  process.env.DATABASE_URL = TEST_DATABASE_URL;
  process.env.BOT_TOKEN = '';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-min-32-chars';
  setupTestDatabase();
  const config = loadConfig();
  const prisma = getTestPrisma();
  const telegramService = new FakeTelegramService();
  container = createContainer(config, { prisma, telegramService });
  app = createApp(container);
  return { app, container };
}

export function getApp(): Express {
  return app;
}

export function getContainer(): Container {
  return container;
}

export { getTestPrisma, cleanTestDatabase, closeTestDatabase, TEST_DATABASE_URL };
