/**
 * Objeto de valor: identificador único de usuario en el sistema.
 * Inmutable.
 */
export class UserId {
  private readonly _value: string;

  constructor(value: string) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error('InvalidUserId: el id de usuario no puede estar vacío');
    }
    this._value = trimmed;
  }

  get value(): string {
    return this._value;
  }

  equals(other: UserId): boolean {
    return this._value === other._value;
  }
}
