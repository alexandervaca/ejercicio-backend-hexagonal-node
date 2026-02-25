import type { MessageContent } from '../value-objects/MessageContent.js';

export type MessageDirection = 'in' | 'out';

/**
 * Entidad de dominio: mensaje dentro de una conversación.
 * direction: 'in' = recibido de Telegram, 'out' = enviado por el sistema/admin.
 */
export class Message {
  constructor(
    readonly id: string,
    readonly conversationId: string,
    readonly content: MessageContent,
    readonly direction: MessageDirection,
    readonly createdAt: Date = new Date(),
    readonly telegramMessageId?: number
  ) {
    if (!id || id.trim() === '') {
      throw new Error('Message: id no puede estar vacío');
    }
    if (!conversationId || conversationId.trim() === '') {
      throw new Error('Message: conversationId no puede estar vacío');
    }
  }
}
