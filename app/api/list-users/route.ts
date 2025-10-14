import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'DATABASE_URL não configurado'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar todos os usuários
    const users = await sql`
      SELECT id, name, email, role, status, created_at
      FROM users
      ORDER BY id
    `;

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    });
  } catch (error: any) {
    console.error('Erro ao listar usuários:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
