import type { IMessageRepository } from '../../domain/ports/IMessageRepository.js';
import type { Message } from '../../domain/entities/Message.js';
import type { MessageDirection } from '../../domain/entities/Message.js';
import { Message as MessageEntity } from '../../domain/entities/Message.js';
import { MessageContent } from '../../domain/value-objects/MessageContent.js';
import type { PrismaClient } from '@prisma/client';

export class PrismaMessageRepository implements IMessageRepository {
  constructor(private readonly db: PrismaClient) {}

  async save(message: Message): Promise<void> {
    await this.db.message.upsert({
      where: { id: message.id },
      create: {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content.value,
        direction: message.direction,
        createdAt: message.createdAt,
        telegramMessageId: message.telegramMessageId ?? null,
      },
      update: {
        content: message.content.value,
        direction: message.direction,
      },
    });
  }

  async findByConversationId(conversationId: string): Promise<MessageEntity[]> {
    const rows = await this.db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<MessageEntity | null> {
    const row = await this.db.message.findUnique({
      where: { id },
    });
    if (row === null) return null;
    return this.toEntity(row);
  }

  private toEntity(row: {
    id: string;
    conversationId: string;
    content: string;
    direction: string;
    createdAt: Date;
    telegramMessageId: number | null;
  }): MessageEntity {
    return new MessageEntity(
      row.id,
      row.conversationId,
      new MessageContent(row.content),
      row.direction as MessageDirection,
      row.createdAt,
      row.telegramMessageId ?? undefined
    );
  }
}
