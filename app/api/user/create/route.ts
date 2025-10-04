import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// API endpoint para criar novos usuários no sistema
export async function POST(request: NextRequest) {
  try {
    console.log('=== INICIANDO CRIAÇÃO DE USUÁRIO ===');

    const { email, name, role = 'cliente' } = await request.json();
    console.log('Dados recebidos:', { email, name, role });

    if (!email || !name) {
      console.log('Erro: email ou name não fornecidos');
      return NextResponse.json({
        success: false,
        error: 'email e name são obrigatórios'
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

    // Validar nome
    if (name.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Nome deve ter pelo menos 2 caracteres'
      }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    // Verificar se usuário já existe pelo email
    console.log('Verificando se usuário já existe...');
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;

    if (existingUser.length > 0) {
      console.log('Usuário já existe:', existingUser[0]);
      return NextResponse.json({
        success: false,
        error: 'Usuário já existe'
      }, { status: 409 });
    }

    // Criar usuário no Neon DB
    console.log('Criando usuário no banco...');
    const user = await sql`
      INSERT INTO users (email, name, role, status, "createdAt", "updatedAt")
      VALUES (${email}, ${name.trim()}, ${role}, 'active', NOW(), NOW())
      RETURNING id, name, email, role, "createdAt", "updatedAt"
    `;
    console.log('Usuário criado com sucesso:', user[0]);

    // Converter para formato esperado pelo frontend
    const userData = {
      id: user[0].id.toString(),
      email: user[0].email,
      displayName: user[0].name,
      role: user[0].role || 'cliente',
      status: 'active',
      createdAt: user[0].createdAt
    };

    console.log('Usuário criado no Neon DB:', userData);
    return NextResponse.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 });
  }
}