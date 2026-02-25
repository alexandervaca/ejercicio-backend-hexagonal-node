import type { ProcessTelegramUpdatesUseCase } from '../../application/use-cases/ProcessTelegramUpdatesUseCase.js';

const LOG_PREFIX = '[Telegram polling]';

/**
 * Ejecuta el caso de uso de procesamiento de Telegram de forma periódica (polling con getUpdates).
 * Mantiene el último update_id para pasar como offset y no reprocesar mensajes.
 * Logs de actividad y errores (excepciones de dominio o de API) se escriben en consola.
 */
export function startTelegramPolling(
  processUpdatesUseCase: ProcessTelegramUpdatesUseCase,
  intervalMs: number
): () => void {
  let lastUpdateId: number | undefined;
  let stopped = false;

  const run = async (): Promise<void> => {
    if (stopped) return;
    try {
      const result = await processUpdatesUseCase.execute(lastUpdateId);
      if (result.processed > 0) {
        console.log(`${LOG_PREFIX} Procesados ${result.processed} mensaje(s).`);
      }
      if (result.lastUpdateId !== null) {
        lastUpdateId = result.lastUpdateId + 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`${LOG_PREFIX} Error:`, message);
      if (err instanceof Error && err.stack) {
        console.error(`${LOG_PREFIX} Stack:`, err.stack);
      }
    }
    if (!stopped) {
      setTimeout(run, intervalMs);
    }
  };

  console.log(`${LOG_PREFIX} Iniciado (intervalo ${intervalMs} ms).`);
  setTimeout(run, 0);

  return () => {
    stopped = true;
    console.log(`${LOG_PREFIX} Detenido.`);
  };
}
