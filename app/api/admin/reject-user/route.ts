// ═══════════════════════════════════════════════════════════════════
// API: REJEITAR USUÁRIO PENDENTE
// ═══════════════════════════════════════════════════════════════════
// Atualiza status em pending_users para 'rejected'
// Apenas company_admin ou super_admin podem rejeitar
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function POST(request: NextRequest) {
  try {
    const { adminUserId, pendingUserId, reason } = await request.json();

    console.log('[API /admin/reject-user] Rejeição solicitada por:', adminUserId, 'para:', pendingUserId);

    // Validações
    if (!adminUserId || !pendingUserId) {
      return NextResponse.json({
        success: false,
        error: 'Dados incompletos'
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /admin/reject-user] DATABASE_URL não configurado');
      return NextResponse.json({
        success: false,
        error: 'Erro de configuração do servidor'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar admin que está rejeitando
    const adminUsers = await sql`
      SELECT id, email, role, company_id, status
      FROM users
      WHERE id = ${adminUserId}
      LIMIT 1
    `;

    if (adminUsers.length === 0) {
      console.log('[API /admin/reject-user] Admin não encontrado:', adminUserId);
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
      console.log('[API /admin/reject-user] Usuário sem permissão:', admin.email, admin.role);
      return NextResponse.json({
        success: false,
        error: 'Sem permissão para rejeitar usuários'
      }, { status: 403 });
    }

    // Buscar usuário pendente
    const pendingUsers = await sql`
      SELECT id, company_id, name, email, status
      FROM pending_users
      WHERE id = ${pendingUserId}
      LIMIT 1
    `;

    if (pendingUsers.length === 0) {
      console.log('[API /admin/reject-user] Pending user não encontrado:', pendingUserId);
      return NextResponse.json({
        success: false,
        error: 'Solicitação não encontrada'
      }, { status: 404 });
    }

    const pendingUser = pendingUsers[0];

    // Verificar se pending user pertence à empresa do admin (exceto super_admin)
    if (admin.role === 'company_admin' && admin.company_id !== pendingUser.company_id) {
      console.log('[API /admin/reject-user] Tentativa de rejeitar usuário de outra empresa');
      return NextResponse.json({
        success: false,
        error: 'Sem permissão para rejeitar este usuário'
      }, { status: 403 });
    }

    // Verificar se já foi processado
    if (pendingUser.status !== 'pending') {
      return NextResponse.json({
        success: false,
        error: 'Esta solicitação já foi processada'
      }, { status: 409 });
    }

    // Atualizar status em pending_users para 'rejected'
    await sql`
      UPDATE pending_users
      SET
        status = 'rejected',
        reviewed_by = ${adminUserId},
        reviewed_at = NOW(),
        rejection_reason = ${reason || null}
      WHERE id = ${pendingUserId}
    `;

    console.log('[API /admin/reject-user] Usuário rejeitado:', pendingUser.email);

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
        'reject_user',
        'pending_user',
        ${pendingUserId},
        ${JSON.stringify({
          email: pendingUser.email,
          name: pendingUser.name,
          reason: reason || 'Não especificado'
        })}
      )
    `;

    return NextResponse.json({
      success: true,
      message: 'Solicitação rejeitada',
      user: {
        email: pendingUser.email,
        name: pendingUser.name
      }
    });

  } catch (error: any) {
    console.error('[API /admin/reject-user] Erro:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao rejeitar usuário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
