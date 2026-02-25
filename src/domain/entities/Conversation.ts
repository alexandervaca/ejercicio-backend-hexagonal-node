import type { TelegramChatId } from '../value-objects/TelegramChatId.js';

/**
 * Entidad de dominio: conversación con un chat de Telegram.
 * Identificada por id interno y por telegramChatId (único por bot).
 */
export class Conversation {
  constructor(
    readonly id: string,
    readonly telegramChatId: TelegramChatId,
    readonly createdAt: Date = new Date()
  ) {
    if (!id || id.trim() === '') {
      throw new Error('Conversation: id no puede estar vacío');
    }
  }
}
