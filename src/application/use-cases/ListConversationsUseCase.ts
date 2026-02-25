import type { IConversationRepository } from '../../domain/ports/IConversationRepository.js';
import type { Conversation } from '../../domain/entities/Conversation.js';

export interface ListConversationsOutput {
  conversations: Array<{
    id: string;
    telegramChatId: string;
    createdAt: Date;
  }>;
}

/**
 * Caso de uso: listar todas las conversaciones (para el panel de administración).
 */
export class ListConversationsUseCase {
  constructor(private readonly conversationRepository: IConversationRepository) {}

  async execute(): Promise<ListConversationsOutput> {
    const conversations = await this.conversationRepository.list();
    return {
      conversations: conversations.map((c: Conversation) => ({
        id: c.id,
        telegramChatId: c.telegramChatId.value,
        createdAt: c.createdAt,
      })),
    };
  }
}
