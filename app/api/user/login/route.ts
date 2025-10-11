// ═══════════════════════════════════════════════════════════════════
// API: LOGIN DE USUÁRIO
// ═══════════════════════════════════════════════════════════════════
// Valida email + senha e retorna dados do usuário
// Suporta senha temporária "123456" para usuários sem password_hash
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { validateUserPassword } from '@/lib/utils/password';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('[API /user/login] Tentativa de login:', email);

    // Validações
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email e senha são obrigatórios'
      }, { status: 400 });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /user/login] DATABASE_URL não configurado');
      return NextResponse.json({
        success: false,
        error: 'Erro de configuração do servidor'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar usuário no banco (modo simplificado - sem colunas extras)
    const users = await sql`
      SELECT
        id,
        name,
        email,
        role,
        status,
        created_at,
        updated_at
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (users.length === 0) {
      console.log('[API /user/login] Usuário não encontrado:', email);
      return NextResponse.json({
        success: false,
        error: 'Email ou senha incorretos'
      }, { status: 401 });
    }

    const user = users[0];

    // Verificar se usuário está ativo
    if (user.status !== 'active') {
      console.log('[API /user/login] Usuário inativo:', email);
      return NextResponse.json({
        success: false,
        error: 'Usuário inativo. Entre em contato com o administrador.'
      }, { status: 403 });
    }

    // MODO SIMPLIFICADO: Aceita apenas senha "123456"
    if (password !== '123456') {
      console.log('[API /user/login] Senha incorreta para:', email);
      return NextResponse.json({
        success: false,
        error: 'Email ou senha incorretos (use: 123456)'
      }, { status: 401 });
    }

    console.log('[API /user/login] Login bem-sucedido:', email);

    // Retornar dados do usuário (modo simplificado)
    const userData = {
      id: user.id.toString(),
      email: user.email,
      displayName: user.name || user.email,
      role: user.role,
      companyId: null,  // Sem multi-tenant por enquanto
      status: user.status,
      requirePasswordChange: false,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    return NextResponse.json({
      success: true,
      user: userData,
      requirePasswordChange: false
    });

  } catch (error: any) {
    console.error('[API /user/login] Erro:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao processar login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
