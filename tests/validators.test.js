// tests/unit/validators.test.js

const { validateEmail } = require('../../src/utils/validators');

describe('Função validateEmail', () => {
  test('deve retornar true para emails válidos', () => {
    expect(validateEmail('teste@example.com')).toBe(true);
    expect(validateEmail('USER+1@dominio.com.br')).toBe(true);
    expect(validateEmail('nome.sobrenome@empresa.org')).toBe(true);
  });

  test('deve retornar false para emails sem @', () => {
    expect(validateEmail('testeexample.com')).toBe(false);
  });

  test('deve retornar false para emails sem domínio correto', () => {
    expect(validateEmail('teste@')).toBe(false);
    expect(validateEmail('teste@dominio')).toBe(false);
  });

  test('deve retornar false para string vazia ou undefined', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });

  test('deve retornar false para valores não-string', () => {
    expect(validateEmail(123)).toBe(false);
    expect(validateEmail({})).toBe(false);
    expect(validateEmail([])).toBe(false);
  });
});
