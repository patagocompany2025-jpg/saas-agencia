import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET - Listar todas as tarefas de entrega (compartilhadas)
export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const deliveryTasks = await sql`
      SELECT
        dt.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.email,
          'phone', c.phone,
          'company', c.company,
          'createdAt', c."createdAt",
          'updatedAt', c."updatedAt"
        ) as client,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM delivery_tasks dt
      LEFT JOIN clients c ON dt."clientId" = c.id
      LEFT JOIN users u ON dt."userId" = u.id
      ORDER BY dt."createdAt" DESC
    `;

    // Banco já retorna em camelCase, não precisa transformar
    const formattedTasks = deliveryTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      clientId: task.clientId,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      client: task.client,
      user: task.user
    }));

    return NextResponse.json({ success: true, data: formattedTasks });
  } catch (error) {
    console.error('Erro ao buscar tarefas de entrega:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova tarefa de entrega
export async function POST(request: NextRequest) {
  try {
    const { title, description, status, priority, dueDate, clientId, userId } = await request.json();

    if (!title || !userId) {
      return NextResponse.json({ error: 'Título e userId são obrigatórios' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const deliveryTaskResult = await sql`
      INSERT INTO delivery_tasks (title, description, status, priority, "dueDate", "clientId", "userId")
      VALUES (
        ${title},
        ${description || null},
        ${status || 'pending'},
        ${priority || 'medium'},
        ${dueDate ? new Date(dueDate) : null},
        ${clientId || null},
        ${userId}
      )
      RETURNING *
    `;

    const createdTask = deliveryTaskResult[0];

    // Buscar client e user relacionados
    const taskWithRelations = await sql`
      SELECT
        dt.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.email,
          'phone', c.phone,
          'company', c.company,
          'createdAt', c."createdAt",
          'updatedAt', c."updatedAt"
        ) as client,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM delivery_tasks dt
      LEFT JOIN clients c ON dt."clientId" = c.id
      LEFT JOIN users u ON dt."userId" = u.id
      WHERE dt.id = ${createdTask.id}
    `;

    const task = taskWithRelations[0];

    const deliveryTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      clientId: task.clientId,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      client: task.client,
      user: task.user
    };

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", "recordId", data, "userId")
      VALUES (
        'create',
        'delivery',
        ${deliveryTask.id},
        ${JSON.stringify(deliveryTask)},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, data: deliveryTask });
  } catch (error) {
    console.error('Erro ao criar tarefa de entrega:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar tarefa de entrega
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, status, priority, dueDate, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID e userId são obrigatórios' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE delivery_tasks
      SET
        title = ${title},
        description = ${description},
        status = ${status},
        priority = ${priority},
        "dueDate" = ${dueDate ? new Date(dueDate) : null},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Buscar task atualizada com relações
    const taskWithRelations = await sql`
      SELECT
        dt.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.email,
          'phone', c.phone,
          'company', c.company,
          'createdAt', c."createdAt",
          'updatedAt', c."updatedAt"
        ) as client,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM delivery_tasks dt
      LEFT JOIN clients c ON dt."clientId" = c.id
      LEFT JOIN users u ON dt."userId" = u.id
      WHERE dt.id = ${id}
    `;

    const task = taskWithRelations[0];

    const deliveryTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      clientId: task.clientId,
      userId: task.userId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      client: task.client,
      user: task.user
    };

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", "recordId", data, "userId")
      VALUES (
        'update',
        'delivery',
        ${deliveryTask.id},
        ${JSON.stringify(deliveryTask)},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, data: deliveryTask });
  } catch (error) {
    console.error('Erro ao atualizar tarefa de entrega:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir tarefa de entrega
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID e userId são obrigatórios' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      DELETE FROM delivery_tasks
      WHERE id = ${id}
    `;

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", "recordId", data, "userId")
      VALUES (
        'delete',
        'delivery',
        ${id},
        ${JSON.stringify({ id })},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa de entrega:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
