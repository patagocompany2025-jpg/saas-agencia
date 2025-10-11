// ═══════════════════════════════════════════════════════════════════
// API: APROVAR USUÁRIO PENDENTE
// ═══════════════════════════════════════════════════════════════════
// Move usuário de pending_users para users
// Apenas company_admin ou super_admin podem aprovar
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { adminUserId, pendingUserId } = await request.json();

    console.log('[API /admin/approve-user] Aprovação solicitada por:', adminUserId, 'para:', pendingUserId);

    // Validações
    if (!adminUserId || !pendingUserId) {
      return NextResponse.json({
        success: false,
        error: 'Dados incompletos'
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /admin/approve-user] DATABASE_URL não configurado');
      return NextResponse.json({
        success: false,
        error: 'Erro de configuração do servidor'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar admin que está aprovando
    const adminUsers = await sql`
      SELECT id, email, role, company_id, status
      FROM users
      WHERE id = ${adminUserId}
      LIMIT 1
    `;

    if (adminUsers.length === 0) {
      console.log('[API /admin/approve-user] Admin não encontrado:', adminUserId);
      return NextResponse.json({
        success: false,
        error: 'Usuário não autorizado'
      }, { status: 401 });
    }

    const admin = adminUsers[0];

    // Verificar se admin está ativo
    if (admin.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Usuário inativo'
      }, { status: 403 });
    }

    // Verificar permissão (apenas company_admin ou super_admin)
    if (admin.role !== 'company_admin' && admin.role !== 'super_admin') {
      console.log('[API /admin/approve-user] Usuário sem permissão:', admin.email, admin.role);
      return NextResponse.json({
        success: false,
        error: 'Sem permissão para aprovar usuários'
      }, { status: 403 });
    }

    // Buscar usuário pendente
    const pendingUsers = await sql`
      SELECT id, company_id, name, email, password_hash, status
      FROM pending_users
      WHERE id = ${pendingUserId}
      LIMIT 1
    `;

    if (pendingUsers.length === 0) {
      console.log('[API /admin/approve-user] Pending user não encontrado:', pendingUserId);
      return NextResponse.json({
        success: false,
        error: 'Solicitação não encontrada'
      }, { status: 404 });
    }

    const pendingUser = pendingUsers[0];

    // Verificar se pending user pertence à empresa do admin (exceto super_admin)
    if (admin.role === 'company_admin' && admin.company_id !== pendingUser.company_id) {
      console.log('[API /admin/approve-user] Tentativa de aprovar usuário de outra empresa');
      return NextResponse.json({
        success: false,
        error: 'Sem permissão para aprovar este usuário'
      }, { status: 403 });
    }

    // Verificar se já foi processado
    if (pendingUser.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Esta solicitação já foi processada'
      }, { status: 409 });
    }

    // Verificar se email já existe em users
    const existingUsers = await sql`
      SELECT id FROM users
      WHERE email = ${pendingUser.email}
      LIMIT 1
    `;

    if (existingUsers.length > 0) {
      console.log('[API /admin/approve-user] Email já existe em users:', pendingUser.email);
      return NextResponse.json({
        success: false,
        error: 'Este email já está cadastrado no sistema'
      }, { status: 409 });
    }

    // Criar usuário na tabela users
    await sql`
      INSERT INTO users (
        company_id,
        email,
        name,
        password_hash,
        role,
        status,
        require_password_change,
        created_at,
        updated_at
      )
      VALUES (
        ${pendingUser.company_id},
        ${pendingUser.email},
        ${pendingUser.name},
        ${pendingUser.password_hash},
        'company_user',
        'active',
        FALSE,
        NOW(),
        NOW()
      )
    `;

    // Atualizar status em pending_users para 'approved'
    await sql`
      UPDATE pending_users
      SET
        status = 'approved',
        reviewed_by = ${adminUserId},
        reviewed_at = NOW()
      WHERE id = ${pendingUserId}
    `;

    console.log('[API /admin/approve-user] Usuário aprovado com sucesso:', pendingUser.email);

    // Registrar no audit log
    await sql`
      INSERT INTO audit_logs (
        company_id,
        user_id,
        action,
        entity_type,
        entity_id,
        details
      )
      VALUES (
        ${pendingUser.company_id},
        ${adminUserId},
        'approve_user',
        'user',
        ${pendingUserId},
        ${JSON.stringify({ email: pendingUser.email, name: pendingUser.name })}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Usuário aprovado com sucesso',
      user: {
        email: pendingUser.email,
        name: pendingUser.name
      }
    });

  } catch (error: any) {
    console.error('[API /admin/approve-user] Erro:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao aprovar usuário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
