import type { IConversationRepository } from '../../domain/ports/IConversationRepository.js';
import type { Conversation } from '../../domain/entities/Conversation.js';
import type { TelegramChatId } from '../../domain/value-objects/TelegramChatId.js';
import { Conversation as ConversationEntity } from '../../domain/entities/Conversation.js';
import { TelegramChatId as TelegramChatIdVO } from '../../domain/value-objects/TelegramChatId.js';
import type { PrismaClient } from '@prisma/client';

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(conversation: Conversation): Promise<void> {
    await this.db.conversation.upsert({
      where: { id: conversation.id },
      create: {
        id: conversation.id,
        telegramChatId: conversation.telegramChatId.value,
        createdAt: conversation.createdAt,
      },
      update: {
        telegramChatId: conversation.telegramChatId.value,
      },
    });
  }

  async findById(id: string): Promise<ConversationEntity | null> {
    const row = await this.db.conversation.findUnique({
      where: { id },
    });
    if (row === null) return null;
    return new ConversationEntity(
      row.id,
      new TelegramChatIdVO(row.telegramChatId),
      row.createdAt
    );
  }

  async findByTelegramChatId(telegramChatId: TelegramChatId): Promise<ConversationEntity | null> {
    const row = await this.db.conversation.findUnique({
      where: { telegramChatId: telegramChatId.value },
    });
    if (row === null) return null;
    return new ConversationEntity(
      row.id,
      new TelegramChatIdVO(row.telegramChatId),
      row.createdAt
    );
  }

  async list(): Promise<ConversationEntity[]> {
    const rows = await this.db.conversation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(
      (row: { id: string; telegramChatId: string; createdAt: Date }) =>
        new ConversationEntity(
          row.id,
          new TelegramChatIdVO(row.telegramChatId),
          row.createdAt
        )
    );
  }
}
