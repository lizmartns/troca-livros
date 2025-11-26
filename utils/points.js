// src/utils/points.js

/**
 * Calcula pontos do usuário com base em:
 * - livrosCadastrados: 2 pontos por livro
 * - trocasSolicitadas: 5 pontos por solicitação
 * - trocasAceitas: 10 pontos por troca aceita
 */
function calculatePoints({
  livrosCadastrados = 0,
  trocasSolicitadas = 0,
  trocasAceitas = 0
}) {
  if (
    livrosCadastrados < 0 ||
    trocasSolicitadas < 0 ||
    trocasAceitas < 0
  ) {
    throw new Error('Valores não podem ser negativos');
  }

  return (
    livrosCadastrados * 2 +
    trocasSolicitadas * 5 +
    trocasAceitas * 10
  );
}

module.exports = { calculatePoints };
