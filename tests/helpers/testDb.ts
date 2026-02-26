import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  `file:${path.join(projectRoot, 'prisma', 'test-integration.sqlite')}`;

let prismaInstance: PrismaClient | null = null;

/**
 * Ejecuta prisma db push contra la BD de test para crear el esquema.
 */
export function setupTestDatabase(): void {
  execSync('npx prisma db push --accept-data-loss', {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    cwd: projectRoot,
    stdio: 'pipe',
  });
}

/**
 * PrismaClient apuntando a la BD de test (para seed o limpieza).
 */
export function getTestPrisma(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: { db: { url: TEST_DATABASE_URL } },
    });
  }
  return prismaInstance;
}

/**
 * Limpia tablas para dejar la BD lista para el siguiente test.
 */
export async function cleanTestDatabase(): Promise<void> {
  const db = getTestPrisma();
  await db.message.deleteMany({});
  await db.conversation.deleteMany({});
  await db.user.deleteMany({});
}

export async function closeTestDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
