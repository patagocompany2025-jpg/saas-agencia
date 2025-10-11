// ═══════════════════════════════════════════════════════════════════
// API: LISTAR USUÁRIOS PENDENTES
// ═══════════════════════════════════════════════════════════════════
// Retorna lista de pending_users da empresa do admin
// Apenas company_admin ou super_admin podem acessar
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    // Pegar adminUserId dos query params
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get('adminUserId');

    console.log('[API /admin/pending-users] Listagem solicitada por:', adminUserId);

    // Validações
    if (!adminUserId) {
      return NextResponse.json({
        success: false,
        error: 'adminUserId é obrigatório'
      }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      console.error('[API /admin/pending-users] DATABASE_URL não configurado');
      return NextResponse.json({
        success: false,
        error: 'Erro de configuração do servidor'
      }, { status: 500 });
    }

    const sql = neon(process.env.DATABASE_URL);

    // Buscar admin
    const adminUsers = await sql`
      SELECT id, email, role, company_id, status
      FROM users
      WHERE id = ${adminUserId}
      LIMIT 1
    `;

    if (adminUsers.length === 0) {
      console.log('[API /admin/pending-users] Admin não encontrado:', adminUserId);
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
      console.log('[API /admin/pending-users] Usuário sem permissão:', admin.email, admin.role);
      return NextResponse.json({
        success: false,
        error: 'Sem permissão para visualizar solicitações'
      }, { status: 403 });
    }

    // Buscar pending_users
    let pendingUsers;

    if (admin.role === 'super_admin') {
      // Super admin vê de todas as empresas
      pendingUsers = await sql`
        SELECT
          p.id,
          p.company_id,
          p.name,
          p.email,
          p.status,
          p.created_at,
          p.reviewed_at,
          p.rejection_reason,
          c.name as company_name,
          c.slug as company_slug
        FROM pending_users p
        LEFT JOIN companies c ON p.company_id = c.id
        WHERE p.status = 'pending'
        ORDER BY p.created_at DESC
      `;
    } else {
      // Company admin vê apenas da sua empresa
      pendingUsers = await sql`
        SELECT
          p.id,
          p.company_id,
          p.name,
          p.email,
          p.status,
          p.created_at,
          p.reviewed_at,
          p.rejection_reason,
          c.name as company_name,
          c.slug as company_slug
        FROM pending_users p
        LEFT JOIN companies c ON p.company_id = c.id
        WHERE p.company_id = ${admin.company_id}
        AND p.status = 'pending'
        ORDER BY p.created_at DESC
      `;
    }

    console.log('[API /admin/pending-users] Retornando', pendingUsers.length, 'solicitações');

    return NextResponse.json({
      success: true,
      pendingUsers: pendingUsers.map(user => ({
        id: user.id,
        companyId: user.company_id,
        companyName: user.company_name,
        companySlug: user.company_slug,
        name: user.name,
        email: user.email,
        status: user.status,
        requestedAt: user.created_at,
        reviewedAt: user.reviewed_at,
        rejectionReason: user.rejection_reason
      }))
    });

  } catch (error: any) {
    console.error('[API /admin/pending-users] Erro:', error);

    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar solicitações',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
