import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Listar todas as tarefas de pós-venda (compartilhadas)
export async function GET(request: NextRequest) {
  try {
    const postSaleTasks = await prisma.postSaleTask.findMany({
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: postSaleTasks });
  } catch (error) {
    console.error('Erro ao buscar tarefas de pós-venda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova tarefa de pós-venda
export async function POST(request: NextRequest) {
  try {
    const { title, description, status, priority, dueDate, clientId, userId } = await request.json();

    if (!title || !userId) {
      return NextResponse.json({ error: 'Título e userId são obrigatórios' }, { status: 400 });
    }

    const postSaleTask = await prisma.postSaleTask.create({
      data: {
        title,
        description,
        status: status || 'pending',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        clientId,
        userId
      },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        action: 'create',
        table: 'post_sale',
        recordId: postSaleTask.id,
        data: JSON.stringify(postSaleTask),
        userId
      }
    });

    return NextResponse.json({ success: true, data: postSaleTask });
  } catch (error) {
    console.error('Erro ao criar tarefa de pós-venda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar tarefa de pós-venda
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, status, priority, dueDate, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID e userId são obrigatórios' }, { status: 400 });
    }

    const postSaleTask = await prisma.postSaleTask.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        client: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        action: 'update',
        table: 'post_sale',
        recordId: postSaleTask.id,
        data: JSON.stringify(postSaleTask),
        userId
      }
    });

    return NextResponse.json({ success: true, data: postSaleTask });
  } catch (error) {
    console.error('Erro ao atualizar tarefa de pós-venda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir tarefa de pós-venda
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID e userId são obrigatórios' }, { status: 400 });
    }

    await prisma.postSaleTask.delete({
      where: { id }
    });

    // Log da atividade
    await prisma.activityLog.create({
      data: {
        action: 'delete',
        table: 'post_sale',
        recordId: id,
        data: JSON.stringify({ id }),
        userId
      }
    });

    return NextResponse.json({ success: true, message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa de pós-venda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
