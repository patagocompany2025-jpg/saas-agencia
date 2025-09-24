require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const sql = neon(process.env.DATABASE_URL);

async function adaptTables() {
  try {
    console.log('🔧 Adaptando tabelas existentes...');

    // Verificar estrutura da tabela users
    const usersStructure = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
    `;
    
    console.log('📋 Estrutura da tabela users:');
    usersStructure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    // Adicionar colunas necessárias se não existirem
    const requiredColumns = [
      { name: 'password', type: 'TEXT' },
      { name: 'role', type: 'TEXT DEFAULT \'vendedor\'' },
      { name: 'isActive', type: 'BOOLEAN DEFAULT true' },
      { name: 'permissions', type: 'JSONB' },
      { name: 'createdAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' }
    ];

    for (const col of requiredColumns) {
      const exists = usersStructure.some(c => c.column_name === col.name);
      if (!exists) {
        try {
          await sql.unsafe(`ALTER TABLE users ADD COLUMN "${col.name}" ${col.type}`);
          console.log(`✅ Coluna ${col.name} adicionada`);
        } catch (error) {
          console.log(`⚠️ Coluna ${col.name} já existe ou erro: ${error.message}`);
        }
      }
    }

    // Criar usuários de teste
    console.log('👥 Criando usuários de teste...');
    
    const socioPassword = await bcrypt.hash('123456', 12);
    const vendedorPassword = await bcrypt.hash('123456', 12);

    // Inserir usuário sócio
    await sql`
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES (
        'João Silva',
        'joao@socio.com',
        ${socioPassword},
        'socio',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;

    // Inserir usuário vendedor
    await sql`
      INSERT INTO users (name, email, password, role, created_at, updated_at)
      VALUES (
        'Maria Santos',
        'maria@vendedor.com',
        ${vendedorPassword},
        'vendedor',
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING
    `;

    console.log('✅ Usuários criados com sucesso!');
    console.log('📧 Sócio: joao@socio.com / 123456');
    console.log('📧 Vendedor: maria@vendedor.com / 123456');

  } catch (error) {
    console.error('❌ Erro na adaptação:', error);
  }
}

adaptTables();
