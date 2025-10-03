import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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

    // Buscar usuário no Neon DB pelo email
    const user = await prisma.user.findUnique({
      where: { email: stack_user_id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: true,
        user: null 
      });
    }

    // Converter para formato esperado pelo frontend
    const userData = {
      id: user.id.toString(),
      email: user.email,
      displayName: user.name,
      role: user.role || 'cliente',
      status: 'active', // Default status
      createdAt: user.created_at
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