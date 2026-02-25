import type { IIdGenerator } from '../../domain/ports/IIdGenerator.js';
import { randomUUID } from 'node:crypto';

/**
 * Adaptador: generación de IDs con crypto.randomUUID().
 */
export class CryptoIdGenerator implements IIdGenerator {
  generate(): string {
    return randomUUID();
  }
}
