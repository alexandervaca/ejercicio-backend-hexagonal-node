import type { IAutoReplyProvider } from '../../domain/ports/IAutoReplyProvider.js';

/**
 * Adaptador: respuesta aleatoria desde una lista de frases (configurable por env).
 */
export class RandomAutoReplyProvider implements IAutoReplyProvider {
  private readonly phrases: string[];

  constructor(phrases: string[]) {
    this.phrases = phrases.length > 0 ? phrases : ['Gracias por tu mensaje.'];
  }

  async getReply(): Promise<string> {
    const index = Math.floor(Math.random() * this.phrases.length);
    return this.phrases[index];
  }
}
