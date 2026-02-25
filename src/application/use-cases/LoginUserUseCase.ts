import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { IPasswordHasher } from '../../domain/ports/IPasswordHasher.js';
import type { ITokenService } from '../../domain/ports/ITokenService.js';
import { InvalidCredentialsError } from '../../domain/errors/InvalidCredentialsError.js';
import { Email } from '../../domain/value-objects/Email.js';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  userId: string;
  email: string;
}

/**
 * Caso de uso: login con email y contraseña; devuelve un token.
 */
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const email = new Email(input.email);
    const user = await this.userRepository.findByEmail(email);
    if (user === null) {
      throw new InvalidCredentialsError();
    }
    const valid = await this.passwordHasher.verify(input.password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsError();
    }
    const token = await this.tokenService.generate({
      userId: user.id.value,
      email: user.email.value,
    });
    return {
      token,
      userId: user.id.value,
      email: user.email.value,
    };
  }
}
