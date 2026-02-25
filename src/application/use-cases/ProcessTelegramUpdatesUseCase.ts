import type { IConversationRepository } from '../../domain/ports/IConversationRepository.js';
import type { IMessageRepository } from '../../domain/ports/IMessageRepository.js';
import type { ITelegramService } from '../../domain/ports/ITelegramService.js';
import type { IIdGenerator } from '../../domain/ports/IIdGenerator.js';
import type { IAutoReplyProvider } from '../../domain/ports/IAutoReplyProvider.js';
import { Conversation } from '../../domain/entities/Conversation.js';
import { Message } from '../../domain/entities/Message.js';
import { MessageContent } from '../../domain/value-objects/MessageContent.js';

export interface ProcessTelegramUpdatesOutput {
  processed: number;
  lastUpdateId: number | null;
}

/**
 * Caso de uso: procesar actualizaciones de Telegram (polling).
 * Por cada mensaje recibido: crea o obtiene la conversación, persiste el mensaje,
 * genera respuesta automática, la envía por Telegram y persiste la respuesta.
 */
export class ProcessTelegramUpdatesUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly telegramService: ITelegramService,
    private readonly idGenerator: IIdGenerator,
    private readonly autoReplyProvider: IAutoReplyProvider
  ) {}

  async execute(offset?: number): Promise<ProcessTelegramUpdatesOutput> {
    const updates = await this.telegramService.getUpdates(offset);
    let lastUpdateId: number | null = null;

    for (const update of updates) {
      lastUpdateId = update.updateId;

      let conversation = await this.conversationRepository.findByTelegramChatId(update.chatId);
      if (conversation === null) {
        conversation = new Conversation(
          this.idGenerator.generate(),
          update.chatId,
          new Date()
        );
        await this.conversationRepository.save(conversation);
      }

      const incomingMessage = new Message(
        this.idGenerator.generate(),
        conversation.id,
        new MessageContent(update.text),
        'in',
        new Date(),
        update.telegramMessageId
      );
      await this.messageRepository.save(incomingMessage);

      const replyText = await this.autoReplyProvider.getReply();
      await this.telegramService.sendMessage(update.chatId, replyText);

      const outgoingMessage = new Message(
        this.idGenerator.generate(),
        conversation.id,
        new MessageContent(replyText),
        'out',
        new Date()
      );
      await this.messageRepository.save(outgoingMessage);
    }

    return {
      processed: updates.length,
      lastUpdateId,
    };
  }
}
