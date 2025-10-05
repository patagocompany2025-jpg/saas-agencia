import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require');

async function updateToPatagonianEmail() {
  try {
    console.log('📝 Atualizando email para patagocompany2025@gmail.com...');

    const updated = await sql`
      UPDATE users
      SET email = 'patagocompany2025@gmail.com',
          updated_at = NOW()
      WHERE email = 'negreirosalex@gmail.com'
      RETURNING id, name, email, role
    `;

    console.log('✅ Usuário atualizado:', updated);

    // Verificar resultado final
    const finalUser = await sql`
      SELECT id, name, email, role, created_at
      FROM users
      WHERE email = 'patagocompany2025@gmail.com'
    `;

    console.log('✅ Verificação final:', finalUser);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

updateToPatagonianEmail();
