import type { Conversation } from '../entities/Conversation.js';
import type { TelegramChatId } from '../value-objects/TelegramChatId.js';

/**
 * Puerto de salida: persistencia de conversaciones.
 */
export interface IConversationRepository {
  save(conversation: Conversation): Promise<void>;
  findById(id: string): Promise<Conversation | null>;
  findByTelegramChatId(telegramChatId: TelegramChatId): Promise<Conversation | null>;
  list(): Promise<Conversation[]>;
}
