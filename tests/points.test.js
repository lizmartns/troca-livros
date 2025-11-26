// tests/unit/points.test.js

const { calculatePoints } = require('../../src/utils/points');

describe('Função calculatePoints', () => {
  test('deve calcular pontos corretamente para valores básicos', () => {
    const pontos = calculatePoints({
      livrosCadastrados: 2,  // 2 * 2 = 4
      trocasSolicitadas: 1,  // 1 * 5 = 5
      trocasAceitas: 1       // 1 * 10 = 10
    });

    expect(pontos).toBe(19);
  });

  test('deve retornar 0 quando todos os valores forem 0 ou não informados', () => {
    expect(calculatePoints({})).toBe(0);
    expect(
      calculatePoints({
        livrosCadastrados: 0,
        trocasSolicitadas: 0,
        trocasAceitas: 0
      })
    ).toBe(0);
  });

  test('deve funcionar com apenas um dos campos preenchido', () => {
    expect(calculatePoints({ livrosCadastrados: 3 })).toBe(6);
    expect(calculatePoints({ trocasSolicitadas: 2 })).toBe(10);
    expect(calculatePoints({ trocasAceitas: 1 })).toBe(10);
  });

  test('deve lançar erro para valores negativos', () => {
    expect(() =>
      calculatePoints({ livrosCadastrados: -1 })
    ).toThrow('Valores não podem ser negativos');

    expect(() =>
      calculatePoints({ trocasSolicitadas: -2 })
    ).toThrow('Valores não podem ser negativos');

    expect(() =>
      calculatePoints({ trocasAceitas: -3 })
    ).toThrow('Valores não podem ser negativos');
  });
});
