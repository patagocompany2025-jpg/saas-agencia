import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET - Listar todas as tarefas de pós-venda (compartilhadas)
export async function GET(request: NextRequest) {
  try {
    const sql = neon(process.env.DATABASE_URL!);

    const postSaleTasks = await sql`
      SELECT
        pst.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.email,
          'phone', c.phone,
          'company', c.company,
          'createdAt', c.created_at,
          'updatedAt', c.updated_at
        ) as client,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM post_sale_tasks pst
      LEFT JOIN clients c ON pst.client_id = c.id
      LEFT JOIN users u ON pst.user_id = u.id
      ORDER BY pst.created_at DESC
    `;

    // Mapear snake_case para camelCase para o frontend
    const formattedTasks = postSaleTasks.map((task: any) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      clientId: task.client_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      client: task.client,
      user: task.user
    }));

    return NextResponse.json({ success: true, data: formattedTasks });
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

    const sql = neon(process.env.DATABASE_URL!);

    const postSaleTaskResult = await sql`
      INSERT INTO post_sale_tasks (title, description, status, priority, due_date, client_id, user_id)
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

    const createdTask = postSaleTaskResult[0];

    // Buscar client e user relacionados
    const taskWithRelations = await sql`
      SELECT
        pst.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.email,
          'phone', c.phone,
          'company', c.company,
          'createdAt', c.created_at,
          'updatedAt', c.updated_at
        ) as client,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM post_sale_tasks pst
      LEFT JOIN clients c ON pst.client_id = c.id
      LEFT JOIN users u ON pst.user_id = u.id
      WHERE pst.id = ${createdTask.id}
    `;

    const task = taskWithRelations[0];

    const postSaleTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      clientId: task.client_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      client: task.client,
      user: task.user
    };

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", record_id, data, user_id)
      VALUES (
        'create',
        'post_sale',
        ${postSaleTask.id},
        ${JSON.stringify(postSaleTask)},
        ${userId}
      )
    `;

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

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      UPDATE post_sale_tasks
      SET
        title = ${title},
        description = ${description},
        status = ${status},
        priority = ${priority},
        due_date = ${dueDate ? new Date(dueDate) : null},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    // Buscar task atualizada com relações
    const taskWithRelations = await sql`
      SELECT
        pst.*,
        json_build_object(
          'id', c.id,
          'name', c.name,
          'email', c.email,
          'phone', c.phone,
          'company', c.company,
          'createdAt', c.created_at,
          'updatedAt', c.updated_at
        ) as client,
        json_build_object(
          'id', u.id,
          'name', u.name,
          'email', u.email
        ) as user
      FROM post_sale_tasks pst
      LEFT JOIN clients c ON pst.client_id = c.id
      LEFT JOIN users u ON pst.user_id = u.id
      WHERE pst.id = ${id}
    `;

    const task = taskWithRelations[0];

    const postSaleTask = {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.due_date,
      clientId: task.client_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      client: task.client,
      user: task.user
    };

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", record_id, data, user_id)
      VALUES (
        'update',
        'post_sale',
        ${postSaleTask.id},
        ${JSON.stringify(postSaleTask)},
        ${userId}
      )
    `;

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

    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      DELETE FROM post_sale_tasks
      WHERE id = ${id}
    `;

    // Log da atividade
    await sql`
      INSERT INTO activity_logs (action, "table", record_id, data, user_id)
      VALUES (
        'delete',
        'post_sale',
        ${id},
        ${JSON.stringify({ id })},
        ${userId}
      )
    `;

    return NextResponse.json({ success: true, message: 'Tarefa excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir tarefa de pós-venda:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
