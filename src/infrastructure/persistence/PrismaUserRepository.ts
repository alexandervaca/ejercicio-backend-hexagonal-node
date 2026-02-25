import type { IUserRepository } from '../../domain/ports/IUserRepository.js';
import type { User } from '../../domain/entities/User.js';
import type { Email } from '../../domain/value-objects/Email.js';
import type { UserId } from '../../domain/value-objects/UserId.js';
import { User as UserEntity } from '../../domain/entities/User.js';
import { Email as EmailVO } from '../../domain/value-objects/Email.js';
import { UserId as UserIdVO } from '../../domain/value-objects/UserId.js';
import type { PrismaClient } from '@prisma/client';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(user: User): Promise<void> {
    await this.db.user.upsert({
      where: { id: user.id.value },
      create: {
        id: user.id.value,
        email: user.email.value,
        passwordHash: user.passwordHash,
      },
      update: {
        email: user.email.value,
        passwordHash: user.passwordHash,
      },
    });
  }

  async findByEmail(email: Email): Promise<UserEntity | null> {
    const row = await this.db.user.findUnique({
      where: { email: email.value },
    });
    if (row === null) return null;
    return new UserEntity(
      new UserIdVO(row.id),
      new EmailVO(row.email),
      row.passwordHash
    );
  }

  async findById(id: UserId): Promise<UserEntity | null> {
    const row = await this.db.user.findUnique({
      where: { id: id.value },
    });
    if (row === null) return null;
    return new UserEntity(
      new UserIdVO(row.id),
      new EmailVO(row.email),
      row.passwordHash
    );
  }
}
