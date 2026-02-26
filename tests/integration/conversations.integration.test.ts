import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import {
  setupTestApp,
  getApp,
  getTestPrisma,
  cleanTestDatabase,
} from '../helpers/testApp.js';

describe('Conversations integration', () => {
  let token: string;
  let conversationId: string;

  beforeAll(async () => {
    await setupTestApp();
  });

  beforeEach(async () => {
    await cleanTestDatabase();
    const registerRes = await request(getApp())
      .post('/auth/register')
      .send({ email: 'admin@test.com', password: 'admin123' });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(getApp())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'admin123' });
    expect(loginRes.status).toBe(200);
    token = loginRes.body.token;

    const prisma = getTestPrisma();
    const conv = await prisma.conversation.create({
      data: { id: 'conv-test-1', telegramChatId: '123456789' },
    });
    conversationId = conv.id;
  });

  it('GET /conversations sin token devuelve 401', async () => {
    const res = await request(getApp()).get('/conversations');
    expect(res.status).toBe(401);
  });

  it('GET /conversations con token devuelve lista de conversaciones', async () => {
    const res = await request(getApp())
      .get('/conversations')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('conversations');
    expect(Array.isArray(res.body.conversations)).toBe(true);
    expect(res.body.conversations.length).toBeGreaterThanOrEqual(1);
    const conv = res.body.conversations.find((c: { id: string }) => c.id === conversationId);
    expect(conv).toBeDefined();
    expect(conv.telegramChatId).toBe('123456789');
  });

  it('GET /conversations/:id/messages con token devuelve mensajes', async () => {
    const res = await request(getApp())
      .get(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('conversationId', conversationId);
    expect(res.body).toHaveProperty('messages');
    expect(Array.isArray(res.body.messages)).toBe(true);
  });

  it('GET /conversations/:id/messages con id inexistente devuelve 404', async () => {
    const res = await request(getApp())
      .get('/conversations/id-inexistente/messages')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('NOT_FOUND');
  });

  it('POST /conversations/:id/messages con token crea y envía mensaje (201)', async () => {
    const res = await request(getApp())
      .post(`/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'Mensaje de integración' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('messageId');
    expect(res.body).toHaveProperty('conversationId', conversationId);
    expect(res.body).toHaveProperty('content', 'Mensaje de integración');
    expect(res.body).toHaveProperty('direction', 'out');
  });

  it('POST /conversations/:id/messages sin token devuelve 401', async () => {
    const res = await request(getApp())
      .post(`/conversations/${conversationId}/messages`)
      .send({ content: 'Hola' });

    expect(res.status).toBe(401);
  });
});
