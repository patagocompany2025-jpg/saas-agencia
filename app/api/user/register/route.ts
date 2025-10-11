// ═══════════════════════════════════════════════════════════════════
// API: REGISTRO DE NOVO USUÁRIO
// ═══════════════════════════════════════════════════════════════════
// Cria solicitação de acesso em pending_users
// Aguarda aprovação do admin da empresa
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hashPassword, validatePasswordStrength } from '@/lib/utils/password';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, companySlug } = await request.json();

    console.log('[API /user/register] Solicitação de cadastro:', email, 'para empresa:', companySlug);

    // Validações
    if (!name || !email || !password || !companySlug) {
      return NextResponse.json({
        success: false,
        error: 'Todos os campos são obrigatórios'
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

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Senha inválida',
        details: passwordValidation.errors
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /user/register] DATABASE_URL não configurado');
      return NextResponse.json({
        success: false,
        error: 'Erro de configuração do servidor'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Verificar se empresa existe
    const companies = await sql`
      SELECT id, name, status
      FROM companies
      WHERE slug = ${companySlug}
      LIMIT 1
    `;

    if (companies.length === 0) {
      console.log('[API /user/register] Empresa não encontrada:', companySlug);
      return NextResponse.json({
        success: false,
        error: 'Empresa não encontrada. Verifique o código da empresa.'
      }, { status: 404 });
    }

    const company = companies[0];

    // Verificar se empresa está ativa
    if (company.status !== 'active') {
      console.log('[API /user/register] Empresa inativa:', companySlug);
      return NextResponse.json({
        success: false,
        error: 'Esta empresa não está aceitando novos cadastros no momento.'
      }, { status: 403 });
    }

    // Verificar se email já existe em users
    const existingUsers = await sql`
      SELECT id FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      console.log('[API /user/register] Email já cadastrado em users:', email);
      return NextResponse.json({
        success: false,
        error: 'Este email já está cadastrado no sistema'
      }, { status: 409 });
    }

    // Verificar se já existe solicitação pendente
    const pendingUsers = await sql`
      SELECT id, status FROM pending_users
      WHERE email = ${email} AND company_id = ${company.id}
      LIMIT 1
    `;

    if (pendingUsers.length > 0) {
      const pending = pendingUsers[0];

      if (pending.status === 'pending') {
        return NextResponse.json({
          success: false,
          error: 'Já existe uma solicitação pendente para este email nesta empresa'
        }, { status: 409 });
      }

      if (pending.status === 'rejected') {
        return NextResponse.json({
          success: false,
          error: 'Sua solicitação anterior foi rejeitada. Entre em contato com o administrador.'
        }, { status: 403 });
      }
    }

    // Gerar hash da senha
    const passwordHash = await hashPassword(password);

    // Criar solicitação em pending_users
    await sql`
      INSERT INTO pending_users (
        company_id,
        name,
        email,
        password_hash,
        status
      )
      VALUES (
        ${company.id},
        ${name},
        ${email},
        ${passwordHash},
        'pending'
      )
    `;

    console.log('[API /user/register] Solicitação criada com sucesso:', email);

    return NextResponse.json({
      success: true,
      message: 'Solicitação enviada com sucesso! Aguarde a aprovação do administrador.',
      companyName: company.name
    });

  } catch (error: any) {
    console.error('[API /user/register] Erro:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao processar cadastro',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
