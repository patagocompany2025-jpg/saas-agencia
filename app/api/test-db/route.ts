import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TESTE DE CONEXÃO COM BANCO ===');

    const sql = neon(process.env.DATABASE_URL!);

    // Testar conexão básica
    const testConnection = await sql`SELECT 1 as test`;
    console.log('Conexão com banco OK:', testConnection);

    // Testar se a tabela users existe
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      ) as exists
    `;
    console.log('Tabela users existe:', tableExists);

    // Testar contagem de usuários
    const userCount = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('Total de usuários:', userCount);

    return NextResponse.json({
      success: true,
      message: 'Banco de dados funcionando',
      connection: testConnection,
      tableExists,
      userCount: userCount[0]?.count || 0
    });
  } catch (error) {
    console.error('Erro no teste de banco:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
