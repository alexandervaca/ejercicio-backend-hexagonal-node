/**
 * Configuración de la aplicación (desde variables de entorno).
 */
export interface AppConfig {
  databaseUrl: string;
  botToken: string;
  jwtSecret: string;
  port: number;
  telegramPollIntervalMs: number;
  autoReplyPhrases: string[];
}

export function loadConfig(): AppConfig {
  const databaseUrl = process.env.DATABASE_URL ?? 'file:./dev.sqlite';
  const botToken = (process.env.BOT_TOKEN ?? '').trim().replace(/\s/g, '');
  const jwtSecret = process.env.JWT_SECRET ?? '';
  const port = Number(process.env.PORT) || 3000;
  const telegramPollIntervalMs = Number(process.env.TELEGRAM_POLL_INTERVAL_MS) || 5000;
  const phrasesEnv = process.env.AUTO_REPLY_PHRASES ?? 'Hola!,¿En qué puedo ayudarte?';
  const autoReplyPhrases = phrasesEnv.split(',').map((s) => s.trim()).filter(Boolean);

  return {
    databaseUrl,
    botToken,
    jwtSecret,
    port,
    telegramPollIntervalMs,
    autoReplyPhrases,
  };
}
