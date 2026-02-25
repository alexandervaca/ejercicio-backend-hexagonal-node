/**
 * Puerto de salida: proveedor del texto de respuesta automática (aleatorio o configurable).
 * La infraestructura puede usar una lista fija, BD o IA.
 */
export interface IAutoReplyProvider {
  getReply(): Promise<string>;
}
