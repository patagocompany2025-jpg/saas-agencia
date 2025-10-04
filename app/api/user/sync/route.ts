import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { stack_user_id } = await request.json();

    // Log para debug
    console.log('[API /user/sync] Iniciando sincronização para:', stack_user_id);
    console.log('[API /user/sync] DATABASE_URL está definido:', !!process.env.DATABASE_URL);
    console.log('[API /user/sync] DATABASE_URL preview:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 50) + '...' : 'UNDEFINED');

    if (!stack_user_id) {
      console.log('[API /user/sync] Erro: stack_user_id não fornecido');
      return NextResponse.json({
        success: false,
        error: 'stack_user_id é obrigatório'
      }, { status: 400 });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(stack_user_id)) {
      console.log('[API /user/sync] Erro: formato de email inválido:', stack_user_id);
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /user/sync] ERRO CRÍTICO: DATABASE_URL não está definido!');
      return NextResponse.json({
        success: false,
        error: 'Configuração do banco de dados não encontrada'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar usuário no Neon DB pelo email
    console.log('[API /user/sync] Executando query no banco para email:', stack_user_id);
    const user = await sql`
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE email = ${stack_user_id}
      LIMIT 1
    `;

    console.log('[API /user/sync] Resultado da query - Usuários encontrados:', user.length);
    if (user.length > 0) {
      console.log('[API /user/sync] Dados do usuário:', { id: user[0].id, email: user[0].email, role: user[0].role });
    }

    if (user.length === 0) {
      console.log('[API /user/sync] Nenhum usuário encontrado para:', stack_user_id);
      return NextResponse.json({
        success: true,
        user: null
      });
    }

    // Converter para formato esperado pelo frontend
    const userData = {
      id: user[0].id.toString(),
      email: user[0].email,
      displayName: user[0].name,
      role: user[0].role || 'cliente',
      status: 'active',
      createdAt: user[0].created_at
    };

    console.log('Usuário encontrado no Neon DB:', userData);
    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Erro ao sincronizar usuário:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}