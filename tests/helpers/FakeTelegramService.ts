import type { ITelegramService, TelegramUpdate } from '../../src/domain/ports/ITelegramService.js';
import type { TelegramChatId } from '../../src/domain/value-objects/TelegramChatId.js';

/**
 * Implementación de ITelegramService que no llama a la red.
 * Para tests de integración donde SendMessageUseCase no debe contactar la API de Telegram.
 */
export class FakeTelegramService implements ITelegramService {
  sentMessages: Array<{ chatId: string; text: string }> = [];

  async getUpdates(_offset?: number): Promise<TelegramUpdate[]> {
    return [];
  }

  async sendMessage(chatId: TelegramChatId, text: string): Promise<void> {
    this.sentMessages.push({ chatId: chatId.value, text });
  }
}
