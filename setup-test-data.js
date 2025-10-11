require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function setupTestData() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
    const sql = neon(DATABASE_URL);

    console.log('🚀 Configurando dados de teste...\n');

    // Verificar usuário existente
    const existingUsers = await sql`SELECT id, email, role FROM users LIMIT 1`;

    if (existingUsers.length > 0) {
      const user = existingUsers[0];
      console.log('✅ Usuário encontrado:', user.email);
      console.log('   ID:', user.id);
      console.log('   Role:', user.role);

      // Atualizar role para super_admin se necessário
      if (user.role !== 'super_admin') {
        await sql`UPDATE users SET role = 'super_admin' WHERE id = ${user.id}`;
        console.log('✅ Role atualizado para super_admin');
      }

      console.log('\n🔐 Use estas credenciais para login:');
      console.log(`   Email: ${user.email}`);
      console.log('   Senha: 123456 (temporária)\n');

      console.log('💡 O sistema está configurado em modo SIMPLIFICADO:');
      console.log('   - Login sem validação de senha hash');
      console.log('   - Senha temporária "123456" aceita para todos');
      console.log('   - Sem sistema multi-tenant (por enquanto)\n');

    } else {
      console.log('⚠️  Nenhum usuário encontrado no banco!');
      console.log('   Criando usuário de teste...\n');

      const newUser = await sql`
        INSERT INTO users (email, name, role, status)
        VALUES ('admin@test.com', 'Admin Test', 'super_admin', 'active')
        RETURNING id, email, role
      `;

      console.log('✅ Usuário criado:', newUser[0].email);
      console.log('\n🔐 Use estas credenciais para login:');
      console.log('   Email: admin@test.com');
      console.log('   Senha: 123456 (temporária)\n');
    }

    console.log('✅ Sistema pronto para teste!\n');
    console.log('📝 Próximo passo:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:3000/simple-login');
    console.log('   3. Faça login com as credenciais acima\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
  }
}

setupTestData();
