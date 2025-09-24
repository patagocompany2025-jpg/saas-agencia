import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '../../../../lib/validations/auth'
import { hashPassword, validatePasswordStrength } from '../../../../lib/auth/security'
import { prisma } from '../../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../../lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificar se o usuário está autenticado e é sócio
    if (!session || session.user.role !== 'socio') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas sócios podem criar usuários.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar dados de entrada
    const validatedData = registerSchema.parse(body)
    
    // Verificar força da senha
    const passwordValidation = validatePasswordStrength(validatedData.password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Senha não atende aos critérios de segurança', details: passwordValidation.errors },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const hashedPassword = await hashPassword(validatedData.password)

    // Criar usuário
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', user: newUser },
      { status: 201 }
    )

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
