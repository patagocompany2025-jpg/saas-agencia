import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET - Listar todas as tarefas de vendas (compartilhadas)
export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const salesTasks = await sql`
      SELECT
        st.*,
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
      FROM sales_tasks st
      LEFT JOIN clients c ON st."clientId" = c.id
      LEFT JOIN users u ON st."userId" = u.id
      ORDER BY st."createdAt" DESC
    `;

    // Banco já retorna em camelCase, não precisa transformar
    const formattedTasks = salesTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      value: task.value,
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
    console.error('Erro ao buscar tarefas de vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar nova tarefa de vendas
export async function POST(request: NextRequest) {
  try {
    const { title, description, status, value, priority, dueDate, clientId, userId } = await request.json();

    if (!title || !userId) {
      return NextResponse.json({ error: 'Título e userId são obrigatórios' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const salesTaskResult = await sql`
      INSERT INTO sales_tasks (title, description, status, value, priority, "dueDate", "clientId", "userId")
      VALUES (
        ${title},
        ${description || null},
        ${status || 'prospecting'},
        ${value ? parseFloat(value) : null},
        ${priority || 'medium'},
        ${dueDate ? new Date(dueDate) : null},
        ${clientId || null},
        ${userId}
      )
      RETURNING *
    `;

    const createdTask = salesTaskResult[0];

    // Buscar client e user relacionados
    const taskWithRelations = await sql`
      SELECT
        st.*,
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
      FROM sales_tasks st
      LEFT JOIN clients c ON st."clientId" = c.id
      LEFT JOIN users u ON st."userId" = u.id
      WHERE st.id = ${createdTask.id}
    `;

    const task = taskWithRelations[0];

    const salesTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      value: task.value,
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
        'sales',
        ${salesTask.id},
        ${JSON.stringify(salesTask)},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, data: salesTask });
  } catch (error) {
    console.error('Erro ao criar tarefa de vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar tarefa de vendas
export async function PUT(request: NextRequest) {
  try {
    const { id, title, description, status, value, priority, dueDate, userId } = await request.json();

    if (!id || !userId) {
      return NextResponse.json({ error: 'ID e userId são obrigatórios' }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE sales_tasks
      SET
        title = ${title},
        description = ${description},
        status = ${status},
        value = ${value ? parseFloat(value) : null},
        priority = ${priority},
        "dueDate" = ${dueDate ? new Date(dueDate) : null},
        "updatedAt" = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Buscar task atualizada com relações
    const taskWithRelations = await sql`
      SELECT
        st.*,
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
      FROM sales_tasks st
      LEFT JOIN clients c ON st."clientId" = c.id
      LEFT JOIN users u ON st."userId" = u.id
      WHERE st.id = ${id}
    `;

    const task = taskWithRelations[0];

    const salesTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      value: task.value,
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
        'sales',
        ${salesTask.id},
        ${JSON.stringify(salesTask)},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, data: salesTask });
  } catch (error) {
    console.error('Erro ao atualizar tarefa de vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir tarefa de vendas
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
      DELETE FROM sales_tasks
      WHERE id = ${id}
    `;

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", "recordId", data, "userId")
      VALUES (
        'delete',
        'sales',
        ${id},
        ${JSON.stringify({ id })},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa de vendas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
