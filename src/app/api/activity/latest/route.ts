import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    // Buscar atividades recentes
    const activities = await prisma.activityLog.findMany({
      where: since ? {
        createdAt: {
          gt: new Date(since)
        }
      } : {},
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

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
