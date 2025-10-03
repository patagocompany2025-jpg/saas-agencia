import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Verificar se usuário já existe pelo email
    console.log('Verificando se usuário já existe...');
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Usuário já existe:', existingUser);
      return NextResponse.json({ 
        success: false,
        error: 'Usuário já existe' 
      }, { status: 409 });
    }

    // Criar usuário no Neon DB
    console.log('Criando usuário no banco...');
    const user = await prisma.user.create({
      data: {
        email,
        name: name.trim(),
        role,
        password: 'N/A' // Password is managed by Stack Auth
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });
    console.log('Usuário criado com sucesso:', user);

    // Converter para formato esperado pelo frontend
    const userData = {
      id: user.id.toString(),
      email: user.email,
      displayName: user.name,
      role: user.role || 'cliente',
      status: 'active', // Default status
      createdAt: user.created_at
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