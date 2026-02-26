import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestApp, getApp, cleanTestDatabase } from '../helpers/testApp.js';

describe('Auth integration', () => {
  beforeAll(async () => {
    await setupTestApp();
  });

  afterEach(async () => {
    await cleanTestDatabase();
  });

  it('POST /auth/register crea usuario y devuelve 201 con userId y email', async () => {
    const res = await request(getApp())
      .post('/auth/register')
      .send({ email: 'nuevo@test.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('email', 'nuevo@test.com');
  });

  it('POST /auth/login devuelve token, userId y email con credenciales válidas', async () => {
    await request(getApp())
      .post('/auth/register')
      .send({ email: 'login@test.com', password: 'secret456' });

    const res = await request(getApp())
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'secret456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
    expect(res.body).toHaveProperty('email', 'login@test.com');
  });

  it('POST /auth/register con email duplicado devuelve 409', async () => {
    await request(getApp())
      .post('/auth/register')
      .send({ email: 'duplicado@test.com', password: 'pass' });

    const res = await request(getApp())
      .post('/auth/register')
      .send({ email: 'duplicado@test.com', password: 'otra' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('DUPLICATE_EMAIL');
  });

  it('POST /auth/login con contraseña incorrecta devuelve 401', async () => {
    await request(getApp())
      .post('/auth/register')
      .send({ email: 'user@test.com', password: 'correct' });

    const res = await request(getApp())
      .post('/auth/login')
      .send({ email: 'user@test.com', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });

  it('POST /auth/login con email no registrado devuelve 401', async () => {
    const res = await request(getApp())
      .post('/auth/login')
      .send({ email: 'noexiste@test.com', password: 'any' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('INVALID_CREDENTIALS');
  });
});
