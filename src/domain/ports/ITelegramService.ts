import type { TelegramChatId } from '../value-objects/TelegramChatId.js';

/**
 * Resultado de una actualización de Telegram (getUpdates).
 * El adaptador mapea la respuesta de la API a este DTO de dominio.
 */
export interface TelegramUpdate {
  updateId: number;
  chatId: TelegramChatId;
  text: string;
  telegramMessageId: number;
  fromUsername?: string;
}

/**
 * Puerto de salida: comunicación con la API de Telegram.
 * Implementado por un adaptador (polling con getUpdates, o webhook).
 */
export interface ITelegramService {
  getUpdates(offset?: number): Promise<TelegramUpdate[]>;
  sendMessage(chatId: TelegramChatId, text: string): Promise<void>;
}
