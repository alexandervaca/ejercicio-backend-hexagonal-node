/**
 * Payload mínimo que se incluye en el token (sujeto de la sesión).
 */
export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Puerto de salida: emisión y verificación de tokens (JWT).
 */
export interface ITokenService {
  generate(payload: TokenPayload): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
}
