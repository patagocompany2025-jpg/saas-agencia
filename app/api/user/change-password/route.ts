// ═══════════════════════════════════════════════════════════════════
// API: TROCAR SENHA DO USUÁRIO
// ═══════════════════════════════════════════════════════════════════
// Permite trocar senha temporária por uma permanente
// Atualiza password_hash e require_password_change
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hashPassword, validatePasswordStrength } from '@/lib/utils/password';

export async function POST(request: NextRequest) {
  try {
    const { userId, newPassword } = await request.json();

    console.log('[API /user/change-password] Troca de senha para userId:', userId);

    // Validações
    if (!userId || !newPassword) {
      return NextResponse.json({
        success: false,
        error: 'Dados incompletos'
      }, { status: 400 });
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Senha inválida',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /user/change-password] DATABASE_URL não configurado');
      return NextResponse.json({
        success: false,
        error: 'Erro de configuração do servidor'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar usuário
    const users = await sql`
      SELECT id, email, name, status
      FROM users
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      console.log('[API /user/change-password] Usuário não encontrado:', userId);
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado'
      }, { status: 404 });
    }

    const user = users[0];

    // Verificar se usuário está ativo
    if (user.status !== 'active') {
      console.log('[API /user/change-password] Usuário inativo:', userId);
      return NextResponse.json({
        success: false,
        error: 'Usuário inativo'
      }, { status: 403 });
    }

    // Gerar hash da nova senha
    const passwordHash = await hashPassword(newPassword);

    // Atualizar senha e remover flag de troca obrigatória
    await sql`
      UPDATE users
      SET
        password_hash = ${passwordHash},
        require_password_change = FALSE,
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    console.log('[API /user/change-password] Senha atualizada com sucesso:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('[API /user/change-password] Erro:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao atualizar senha',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
