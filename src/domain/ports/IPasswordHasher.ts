/**
 * Puerto de salida: hashing y verificación de contraseñas.
 * La infraestructura puede usar bcrypt, argon2, etc.
 */
export interface IPasswordHasher {
  hash(plainPassword: string): Promise<string>;
  verify(plainPassword: string, hash: string): Promise<boolean>;
}
