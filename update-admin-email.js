import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateAdminEmail() {
  try {
    console.log('🔍 Verificando usuários existentes...');

    // Verificar se já existe usuário com email antigo
    const existingUsers = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE email IN ('admin@patagonian.com', 'negreirosalex@gmail.com')
    `;

    console.log('Usuários encontrados:', existingUsers);

    if (existingUsers.length > 0) {
      // Atualizar o email do usuário existente
      console.log('\n📝 Atualizando email do usuário...');
      const updated = await sql`
        UPDATE users
        SET email = 'negreirosalex@gmail.com',
            name = 'Alex Negreiros'
        WHERE email = 'admin@patagonian.com'
        RETURNING id, name, email, role
      `;
      console.log('✅ Usuário atualizado:', updated);
    } else {
      // Criar novo usuário
      console.log('\n➕ Criando novo usuário...');
      const newUser = await sql`
        INSERT INTO users (name, email, role, created_at, updated_at)
        VALUES ('Alex Negreiros', 'negreirosalex@gmail.com', 'socio', NOW(), NOW())
        RETURNING id, name, email, role
      `;
      console.log('✅ Usuário criado:', newUser);
    }

    // Verificar resultado final
    console.log('\n🔍 Verificando usuário final...');
    const finalUser = await sql`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE email = 'negreirosalex@gmail.com'
    `;

    console.log('✅ Usuário configurado:', finalUser);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

updateAdminEmail();
