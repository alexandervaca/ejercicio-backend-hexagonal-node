/**
 * Puerto de salida: generación de identificadores únicos.
 * La infraestructura puede usar UUID v4, nanoid, etc.
 */
export interface IIdGenerator {
  generate(): string;
}
