import { loadConfig } from './composition/config.js';
import { createContainer } from './composition/container.js';
import { createApp } from './infrastructure/http/app.js';

async function main(): Promise<void> {
  const config = loadConfig();
  const container = createContainer(config);
  const app = createApp(container);

  const server = app.listen(config.port, () => {
    console.log('[API] Escuchando en http://localhost:' + config.port);
    if (config.botToken) {
      console.log('[API] Polling de Telegram activo (getUpdates).');
    } else {
      console.warn('[API] BOT_TOKEN no configurado: polling de Telegram desactivado.');
    }
  });

  const shutdown = (): void => {
    container.stopTelegramPolling();
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
