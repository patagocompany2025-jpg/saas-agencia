const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

async function createAdmin() {
  const sql = neon(DATABASE_URL);

  try {
    console.log('🔍 Verificando se usuário admin já existe...');

    const existingUser = await sql`
      SELECT id, email, name, role
      FROM users
      WHERE email = 'admin@patagonian.com'
      LIMIT 1
    `;

    if (existingUser.length > 0) {
      console.log('✅ Usuário admin já existe:', existingUser[0]);
      return;
    }

    console.log('📝 Criando usuário admin...');

    const result = await sql`
      INSERT INTO users (email, name, role, status, created_at, updated_at)
      VALUES (
        'admin@patagonian.com',
        'Admin Patagonian',
        'socio',
        'active',
        NOW(),
        NOW()
      )
      RETURNING id, email, name, role, created_at
    `;

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email:', result[0].email);
    console.log('👤 Nome:', result[0].name);
    console.log('🎭 Role:', result[0].role);
    console.log('🆔 ID:', result[0].id);
    console.log('\n🔑 Use estas credenciais para login:');
    console.log('   Email: admin@patagonian.com');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    console.error('Detalhes:', error.message);
  }
}

createAdmin();
