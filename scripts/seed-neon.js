require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL);

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuários de teste
    const socioPassword = await bcrypt.hash('123456', 12);
    const vendedorPassword = await bcrypt.hash('123456', 12);

    // Inserir usuário sócio
    await sql`
      INSERT INTO "User" (id, name, email, password, role, "isActive", permissions, "createdAt", "updatedAt")
      VALUES (
        ${uuidv4()},
        'João Silva',
        'joao@socio.com',
        ${socioPassword},
        'socio',
        true,
        ${JSON.stringify({
          dashboard: true,
          crm: true,
          pipeline: true,
          pipelineVendas: true,
          pipelineEntrega: true,
          pipelinePosVenda: true,
          calculadora: true,
          financeiro: true,
          relatorios: true,
          configuracoes: true,
          configuracoesPerfil: true,
          configuracoesEmpresa: true,
          configuracoesNotificacoes: true,
          configuracoesSeguranca: true,
          configuracoesAparencia: true,
          configuracoesDados: true,
          gerenciarUsuarios: true,
        })},
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;

    // Inserir usuário vendedor
    await sql`
      INSERT INTO "User" (id, name, email, password, role, "isActive", permissions, "createdAt", "updatedAt")
      VALUES (
        ${uuidv4()},
        'Maria Santos',
        'maria@vendedor.com',
        ${vendedorPassword},
        'vendedor',
        true,
        ${JSON.stringify({
          dashboard: true,
          crm: true,
          pipeline: true,
          pipelineVendas: true,
          pipelineEntrega: false,
          pipelinePosVenda: false,
          calculadora: true,
          financeiro: false,
          relatorios: false,
          configuracoes: true,
          configuracoesPerfil: true,
          configuracoesEmpresa: false,
          configuracoesNotificacoes: true,
          configuracoesSeguranca: true,
          configuracoesAparencia: true,
          configuracoesDados: false,
          gerenciarUsuarios: false,
        })},
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('✅ Usuários criados com sucesso!');
    console.log('📧 Sócio: joao@socio.com / 123456');
    console.log('📧 Vendedor: maria@vendedor.com / 123456');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
  }
}

seedDatabase();
