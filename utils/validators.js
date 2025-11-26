// src/utils/validators.js

/**
 * Valida se um email está em um formato básico válido.
 * Retorna true para emails válidos e false caso contrário.
 *
 * Exemplos válidos:
 *  - teste@example.com
 *  - nome.sobrenome@dominio.com.br
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // Regex simples para validar formato de email
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.toLowerCase());
}

module.exports = { validateEmail };
