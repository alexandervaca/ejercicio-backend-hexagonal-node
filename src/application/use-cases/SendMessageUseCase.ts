import type { IConversationRepository } from '../../domain/ports/IConversationRepository.js';
import type { IMessageRepository } from '../../domain/ports/IMessageRepository.js';
import type { ITelegramService } from '../../domain/ports/ITelegramService.js';
import type { IIdGenerator } from '../../domain/ports/IIdGenerator.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';
import { Message } from '../../domain/entities/Message.js';
import { MessageContent } from '../../domain/value-objects/MessageContent.js';

export interface SendMessageInput {
  conversationId: string;
  content: string;
}

export interface SendMessageOutput {
  messageId: string;
  conversationId: string;
  content: string;
  direction: 'out';
  createdAt: Date;
}

/**
 * Caso de uso: enviar un mensaje a una conversación (desde el panel).
 * Persiste el mensaje y lo envía por Telegram.
 */
export class SendMessageUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly telegramService: ITelegramService,
    private readonly idGenerator: IIdGenerator
  ) {}

  async execute(input: SendMessageInput): Promise<SendMessageOutput> {
    const conversation = await this.conversationRepository.findById(input.conversationId);
    if (conversation === null) {
      throw new NotFoundError('Conversation');
    }
    const content = new MessageContent(input.content);
    const messageId = this.idGenerator.generate();
    const message = new Message(
      messageId,
      input.conversationId,
      content,
      'out',
      new Date()
    );
    await this.messageRepository.save(message);
    await this.telegramService.sendMessage(conversation.telegramChatId, content.value);
    return {
      messageId: message.id,
      conversationId: message.conversationId,
      content: message.content.value,
      direction: 'out',
      createdAt: message.createdAt,
    };
  }
}
