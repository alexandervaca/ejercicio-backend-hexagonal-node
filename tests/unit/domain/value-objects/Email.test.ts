import { describe, it, expect } from 'vitest';
import { Email } from '../../../../src/domain/value-objects/Email.js';

describe('Email', () => {
  it('acepta un email válido y lo normaliza a minúsculas', () => {
    const email = new Email('  User@Example.COM  ');
    expect(email.value).toBe('user@example.com');
  });

  it('lanza si el formato es inválido', () => {
    expect(() => new Email('')).toThrow('InvalidEmail');
    expect(() => new Email('sinarroba')).toThrow('InvalidEmail');
    expect(() => new Email('@nodominio.com')).toThrow('InvalidEmail');
    expect(() => new Email('usuario@')).toThrow('InvalidEmail');
  });

  it('equals devuelve true para el mismo valor', () => {
    const a = new Email('a@b.com');
    const b = new Email('A@B.COM');
    expect(a.equals(b)).toBe(true);
  });

  it('equals devuelve false para valores distintos', () => {
    const a = new Email('a@b.com');
    const b = new Email('other@b.com');
    expect(a.equals(b)).toBe(false);
  });
});
