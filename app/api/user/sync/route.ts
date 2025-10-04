import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { stack_user_id } = await request.json();

    if (!stack_user_id) {
      return NextResponse.json({
        success: false,
        error: 'stack_user_id é obrigatório'
      }, { status: 400 });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(stack_user_id)) {
      return NextResponse.json({
        success: false,
        error: 'Formato de email inválido'
      }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Buscar usuário no Neon DB pelo email
    const user = await sql`
      SELECT id, name, email, role, "createdAt", "updatedAt"
      FROM users
      WHERE email = ${stack_user_id}
      LIMIT 1
    `;

    if (user.length === 0) {
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
      createdAt: user[0].createdAt
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