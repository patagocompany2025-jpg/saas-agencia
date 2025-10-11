require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testDatabase() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

    console.log('📡 Conectando ao banco...');
    const sql = neon(DATABASE_URL);

    console.log('🔍 Verificando tabelas...\n');

    // Verificar tabelas
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'companies', 'pending_users', 'audit_logs')
      ORDER BY table_name
    `;

    console.log('✅ Tabelas encontradas:', tables.map(t => t.table_name).join(', '));

    // Verificar colunas da tabela users
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('company_id', 'password_hash', 'require_password_change')
    `;

    console.log('✅ Colunas adicionadas em users:', columns.map(c => c.column_name).join(', '));

    // Contar usuários
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    console.log('👥 Total de usuários:', users[0].count);

    // Verificar se existe admin
    const admin = await sql`
      SELECT email, role, require_password_change
      FROM users
      WHERE email = 'admin@patagonian.com'
    `;

    if (admin.length > 0) {
      console.log('✅ Admin encontrado:', admin[0].email, '- Role:', admin[0].role);
      console.log('   Requer troca de senha:', admin[0].require_password_change);
    } else {
      console.log('⚠️  Admin não encontrado - execute as migrations!');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testDatabase();
