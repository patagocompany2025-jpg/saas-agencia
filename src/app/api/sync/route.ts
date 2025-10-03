import { NextRequest, NextResponse } from 'next/server';

// Simulação de banco de dados em memória
// Em produção, isso seria um banco de dados real
interface ServerDataItem {
  data: unknown;
  timestamp?: string;
  lastModified: string;
}
const serverData: Record<string, ServerDataItem> = {};

export async function POST(request: NextRequest) {
  try {
    const { key, data, userId, timestamp } = await request.json();

    if (!key || !data) {
      return NextResponse.json({ error: 'Key e data são obrigatórios' }, { status: 400 });
    }

    // Salvar dados no "servidor"
    const serverKey = userId ? `${userId}_${key}` : key;
    serverData[serverKey] = {
      data,
      timestamp,
      lastModified: new Date().toISOString()
    };

    console.log(`✅ Dados sincronizados: ${key} para usuário ${userId || 'anônimo'}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Dados sincronizados com sucesso',
      timestamp 
    });

  } catch (error) {
    console.error('Erro na API de sincronização:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const userId = searchParams.get('userId');

    if (!key) {
      return NextResponse.json({ error: 'Key é obrigatório' }, { status: 400 });
    }

    const serverKey = userId ? `${userId}_${key}` : key;
    const data = serverData[serverKey];

    if (!data) {
      return NextResponse.json({ error: 'Dados não encontrados' }, { status: 404 });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Endpoint para listar todos os dados de um usuário
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    // Retornar todos os dados do usuário
    const userData: Record<string, ServerDataItem> = {};
    Object.keys(serverData).forEach(key => {
      if (key.startsWith(`${userId}_`)) {
        const originalKey = key.replace(`${userId}_`, '');
        userData[originalKey] = serverData[key];
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: userData,
      count: Object.keys(userData).length
    });

  } catch (error) {
    console.error('Erro ao listar dados do usuário:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
