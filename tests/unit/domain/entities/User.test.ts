import { describe, it, expect } from 'vitest';
import { User } from '../../../../src/domain/entities/User.js';
import { UserId } from '../../../../src/domain/value-objects/UserId.js';
import { Email } from '../../../../src/domain/value-objects/Email.js';

describe('User', () => {
  it('crea un usuario con id, email y passwordHash', () => {
    const id = new UserId('uuid-1');
    const email = new Email('admin@test.com');
    const user = new User(id, email, 'hashedPassword123');
    expect(user.id.value).toBe('uuid-1');
    expect(user.email.value).toBe('admin@test.com');
    expect(user.passwordHash).toBe('hashedPassword123');
  });

  it('lanza si passwordHash está vacío', () => {
    const id = new UserId('uuid-1');
    const email = new Email('a@b.com');
    expect(() => new User(id, email, '')).toThrow('passwordHash');
  });
});
