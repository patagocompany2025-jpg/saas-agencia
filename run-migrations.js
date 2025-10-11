require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    const sql = neon(DATABASE_URL);

    console.log('🚀 Executando Migrations...\n');

    // Migration 001
    console.log('📝 Executando Migration 001: Multi-Tenant Setup...');
    const migration001 = fs.readFileSync(
      path.join(__dirname, 'database', 'migrations', '001_multi_tenant_setup.sql'),
      'utf-8'
    );

    try {
      await sql.unsafe(migration001);
      console.log('✅ Migration 001 executada!\n');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.error('⚠️  Aviso na Migration 001:', error.message);
      } else {
        console.log('✅ Migration 001 já foi executada anteriormente\n');
      }
    }

    // Migration 002
    console.log('📝 Executando Migration 002: Seed Initial Data...');
    const migration002 = fs.readFileSync(
      path.join(__dirname, 'database', 'migrations', '002_seed_initial_data.sql'),
      'utf-8'
    );

    try {
      await sql.unsafe(migration002);
      console.log('✅ Migration 002 executada!\n');
    } catch (error) {
      if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
        console.error('⚠️  Aviso na Migration 002:', error.message);
      } else {
        console.log('✅ Migration 002 já foi executada anteriormente\n');
      }
    }

    // Verificar resultado
    console.log('🔍 Verificando resultado...\n');

    const companies = await sql`SELECT COUNT(*) as count FROM companies`;
    console.log('📊 Empresas criadas:', companies[0].count);

    const users = await sql`SELECT email, role FROM users ORDER BY created_at`;
    console.log('👥 Usuários no sistema:');
    users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

    const pending = await sql`SELECT COUNT(*) as count FROM pending_users WHERE status = 'pending'`;
    console.log('⏳ Usuários pendentes:', pending[0].count);

    console.log('\n✅ Migrations executadas com sucesso!');
    console.log('\n🔐 Credenciais de acesso:');
    console.log('   Email: admin@patagonian.com');
    console.log('   Senha: 123456 (temporária)\n');

  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error.message);
    console.error(error);
  }
}

runMigrations();
