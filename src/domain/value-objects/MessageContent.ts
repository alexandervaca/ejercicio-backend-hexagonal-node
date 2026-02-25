/**
 * Objeto de valor: contenido de un mensaje.
 * Inmutable, con validación de longitud si se desea.
 */
const MAX_LENGTH = 4096; // límite típico de Telegram para un mensaje de texto

export class MessageContent {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error('InvalidMessageContent: el contenido no puede estar vacío');
    }
    if (trimmed.length > MAX_LENGTH) {
      throw new Error(`InvalidMessageContent: máximo ${MAX_LENGTH} caracteres`);
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }
}
