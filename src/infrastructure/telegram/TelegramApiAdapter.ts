import type { ITelegramService, TelegramUpdate } from '../../domain/ports/ITelegramService.js';
import { TelegramChatId } from '../../domain/value-objects/TelegramChatId.js';

const TELEGRAM_API_BASE = 'https://api.telegram.org';

/**
 * Adaptador: comunicación con la API de Telegram (getUpdates + sendMessage).
 * Nota: Telegram devuelve 404 cuando el token es inválido (no 401).
 */
export class TelegramApiAdapter implements ITelegramService {
  private readonly botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken.trim().replace(/\s/g, '');
  }

  async getUpdates(offset?: number): Promise<TelegramUpdate[]> {
    if (!this.botToken) {
      throw new Error(
        'BOT_TOKEN no configurado. Configura BOT_TOKEN en .env con el token de @BotFather.'
      );
    }
    const url = new URL(`/bot${this.botToken}/getUpdates`, TELEGRAM_API_BASE);
    if (offset !== undefined) url.searchParams.set('offset', String(offset));
    url.searchParams.set('timeout', '30');

    const res = await fetch(url.toString());
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 404) {
        throw new Error(
          `Telegram API 404: token de bot inválido o incorrecto. Revisa BOT_TOKEN en .env (sin espacios ni comillas). Obtén un token válido en @BotFather. Respuesta: ${body}`
        );
      }
      throw new Error(`Telegram API error: ${res.status} ${body}`);
    }
    const data = (await res.json()) as {
      ok: boolean;
      result?: Array<{
        update_id: number;
        message?: {
          chat: { id: number };
          text?: string;
          message_id: number;
          from?: { username?: string };
        };
      }>;
    };
    if (!data.ok || !data.result) return [];

    const updates: TelegramUpdate[] = [];
    for (const r of data.result) {
      const msg = r.message;
      if (!msg?.text) continue;
      updates.push({
        updateId: r.update_id,
        chatId: new TelegramChatId(String(msg.chat.id)),
        text: msg.text,
        telegramMessageId: msg.message_id,
        fromUsername: msg.from?.username,
      });
    }
    return updates;
  }

  async sendMessage(chatId: TelegramChatId, text: string): Promise<void> {
    const url = new URL(`/bot${this.botToken}/sendMessage`, TELEGRAM_API_BASE);
    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.value,
        text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      if (res.status === 404) {
        throw new Error(
          'Telegram API 404: token de bot inválido. Revisa BOT_TOKEN en .env.'
        );
      }
      throw new Error(`Telegram sendMessage error: ${res.status} ${body}`);
    }
  }
}
