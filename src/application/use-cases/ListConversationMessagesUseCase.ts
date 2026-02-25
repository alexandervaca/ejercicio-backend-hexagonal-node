import type { IConversationRepository } from '../../domain/ports/IConversationRepository.js';
import type { IMessageRepository } from '../../domain/ports/IMessageRepository.js';
import { NotFoundError } from '../../domain/errors/NotFoundError.js';

export interface ListConversationMessagesOutput {
  conversationId: string;
  messages: Array<{
    id: string;
    content: string;
    direction: 'in' | 'out';
    createdAt: Date;
  }>;
}

/**
 * Caso de uso: listar mensajes de una conversación.
 */
export class ListConversationMessagesUseCase {
  constructor(
    private readonly conversationRepository: IConversationRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute(conversationId: string): Promise<ListConversationMessagesOutput> {
    const conversation = await this.conversationRepository.findById(conversationId);
    if (conversation === null) {
      throw new NotFoundError('Conversation');
    }
    const messages = await this.messageRepository.findByConversationId(conversationId);
    return {
      conversationId,
      messages: messages.map((m) => ({
        id: m.id,
        content: m.content.value,
        direction: m.direction,
        createdAt: m.createdAt,
      })),
    };
  }
}
