import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import type { IIdGenerator } from '../../domain/ports/IIdGenerator.js';
import { DuplicateEmailError } from '../../domain/errors/DuplicateEmailError.js';
import { User } from '../../domain/entities/User.js';
import { Email } from '../../domain/value-objects/Email.js';
import { UserId } from '../../domain/value-objects/UserId.js';

export interface RegisterUserInput {
  email: string;
  password: string;
}

export interface RegisterUserOutput {
  userId: string;
  email: string;
}

/**
 * Caso de uso: registro de un nuevo usuario (email + contraseña).
 */
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = new Email(input.email);
    const existing = await this.userRepository.findByEmail(email);
    if (existing !== null) {
      throw new DuplicateEmailError();
    }
    const passwordHash = await this.passwordHasher.hash(input.password);
    const userId = new UserId(this.idGenerator.generate());
    const user = new User(userId, email, passwordHash);
    await this.userRepository.save(user);
    return { userId: user.id.value, email: user.email.value };
  }
}
