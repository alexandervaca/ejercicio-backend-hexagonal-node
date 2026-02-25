import type { Message } from '../entities/Message.js';

/**
 * Puerto de salida: persistencia de mensajes.
 */
export interface IMessageRepository {
  save(message: Message): Promise<void>;
  findByConversationId(conversationId: string): Promise<Message[]>;
  findById(id: string): Promise<Message | null>;
}
