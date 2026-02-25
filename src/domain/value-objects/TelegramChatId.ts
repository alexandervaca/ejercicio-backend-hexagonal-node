/**
 * Objeto de valor: identificador de chat de Telegram.
 * Inmutable. Telegram usa números (positivos o negativos) como string en la API.
 */
export class TelegramChatId {
  private readonly _value: string;

  constructor(value: string | number) {
    const str = String(value).trim();
    if (str === '' || str === 'NaN') {
      throw new Error('InvalidTelegramChatId: el chat id no puede estar vacío');
    }
    this._value = str;
  }

  get value(): string {
    return this._value;
  }

  equals(other: TelegramChatId): boolean {
    return this._value === other._value;
  }
}
