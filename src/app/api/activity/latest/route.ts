import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    const sql = neon(process.env.DATABASE_URL!);

    // Buscar atividades recentes
    const activities = since
      ? await sql`
          SELECT * FROM activity_logs
          WHERE created_at > ${new Date(since)}
          ORDER BY created_at DESC
          LIMIT 10
        `
      : await sql`
          SELECT * FROM activity_logs
          ORDER BY created_at DESC
          LIMIT 10
        `;

    return NextResponse.json({
      success: true,
      data: activities,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
