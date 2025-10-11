// ═══════════════════════════════════════════════════════════════════
// HELPER DE SENHA - HASH E VALIDAÇÃO
// ═══════════════════════════════════════════════════════════════════
// Funções para gerenciar senhas com bcrypt
// Senha temporária padrão: "123456"
// ═══════════════════════════════════════════════════════════════════

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
const TEMPORARY_PASSWORD = '123456';

/**
 * Gera hash de uma senha
 * @param password Senha em texto plano
 * @returns Hash bcrypt da senha
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Valida senha comparando com hash
 * @param password Senha em texto plano
 * @param hash Hash armazenado no banco
 * @returns true se senha está correta
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Valida senha do usuário (suporta senha temporária)
 * @param password Senha fornecida
 * @param user Dados do usuário do banco
 * @returns true se senha está correta
 */
export async function validateUserPassword(
  password: string,
  user: { password_hash: string | null }
): Promise<boolean> {
  // Se password_hash é NULL = aceita senha temporária
  if (!user.password_hash || user.password_hash === null) {
    return password === TEMPORARY_PASSWORD;
  }

  // Validar com bcrypt
  return await verifyPassword(password, user.password_hash);
}

/**
 * Verifica se senha é a temporária
 * @param password Senha para verificar
 * @returns true se é a senha temporária
 */
export function isTemporaryPassword(password: string): boolean {
  return password === TEMPORARY_PASSWORD;
}

/**
 * Valida força da senha
 * @param password Senha para validar
 * @returns Objeto com validação e mensagens de erro
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }

  if (password.length > 100) {
    errors.push('Senha muito longa (máximo 100 caracteres)');
  }

  // Não permitir senha temporária como nova senha
  if (password === TEMPORARY_PASSWORD) {
    errors.push('Não pode usar a senha temporária como nova senha');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Gera hash da senha temporária (para inserir no banco)
 * @returns Hash da senha "123456"
 */
export async function getTemporaryPasswordHash(): Promise<string> {
  return await hashPassword(TEMPORARY_PASSWORD);
}
