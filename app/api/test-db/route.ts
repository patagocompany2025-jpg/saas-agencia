import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('=== TESTE DE CONEXÃO COM BANCO ===');
    
    // Testar conexão básica
    const testConnection = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Conexão com banco OK:', testConnection);
    
    // Testar se a tabela users existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists;
    `;
    console.log('Tabela users existe:', tableExists);
    
    // Testar contagem de usuários
    const userCount = await prisma.user.count();
    console.log('Total de usuários:', userCount);
    
    return NextResponse.json({ 
      success: true,
      message: 'Banco de dados funcionando',
      connection: testConnection,
      tableExists,
      userCount
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
