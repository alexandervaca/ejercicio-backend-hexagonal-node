import { describe, it, expect, vi } from 'vitest';
import { RegisterUserUseCase } from '../../../src/application/use-cases/RegisterUserUseCase.js';
import { DuplicateEmailError } from '../../../src/domain/errors/DuplicateEmailError.js';
import type { IUserRepository } from '../../../src/domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../../src/domain/ports/IPasswordHasher.js';
import type { IIdGenerator } from '../../../src/domain/ports/IIdGenerator.js';
import { User } from '../../../src/domain/entities/User.js';
import { UserId } from '../../../src/domain/value-objects/UserId.js';
import { Email } from '../../../src/domain/value-objects/Email.js';

describe('RegisterUserUseCase', () => {
  it('registra un usuario y devuelve userId y email', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const findByEmail = vi.fn().mockResolvedValue(null);
    const hash = vi.fn().mockResolvedValue('hashed');
    const generate = vi.fn().mockReturnValue('generated-uuid');

    const useCase = new RegisterUserUseCase(
      { save, findByEmail, findById: vi.fn() } as unknown as IUserRepository,
      { hash, verify: vi.fn() } as unknown as IPasswordHasher,
      { generate } as IIdGenerator
    );

    const result = await useCase.execute({
      email: 'new@test.com',
      password: 'secret123',
    });

    expect(result.userId).toBe('generated-uuid');
    expect(result.email).toBe('new@test.com');
    expect(findByEmail).toHaveBeenCalledOnce();
    expect(hash).toHaveBeenCalledWith('secret123');
    expect(save).toHaveBeenCalledOnce();
    const savedUser = save.mock.calls[0][0] as User;
    expect(savedUser.email.value).toBe('new@test.com');
    expect(savedUser.passwordHash).toBe('hashed');
  });

  it('lanza DuplicateEmailError si el email ya existe', async () => {
    const existingUser = new User(
      new UserId('existing-id'),
      new Email('taken@test.com'),
      'existingHash'
    );
    const findByEmail = vi.fn().mockResolvedValue(existingUser);

    const useCase = new RegisterUserUseCase(
      { save: vi.fn(), findByEmail, findById: vi.fn() } as unknown as IUserRepository,
      { hash: vi.fn(), verify: vi.fn() } as unknown as IPasswordHasher,
      { generate: vi.fn() } as IIdGenerator
    );

    await expect(
      useCase.execute({ email: 'taken@test.com', password: 'any' })
    ).rejects.toThrow(DuplicateEmailError);

    expect(findByEmail).toHaveBeenCalledOnce();
  });
});
