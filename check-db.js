require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando conexão com o banco de dados...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configurado' : '❌ Não configurado');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida!');
    
    // Verificar tabelas
    const userCount = await prisma.user.count();
    const customerCount = await prisma.customers.count();
    const bookingCount = await prisma.bookings.count();
    
    console.log('\n📈 Estatísticas do banco:');
    console.log(`👥 Usuários: ${userCount}`);
    console.log(`👤 Clientes: ${customerCount}`);
    console.log(`📅 Reservas: ${bookingCount}`);
    
    // Verificar últimos registros
    const lastUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { created_at: 'desc' },
      select: { id: true, name: true, email: true, created_at: true }
    });
    
    console.log('\n🕒 Últimos usuários cadastrados:');
    lastUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao conectar com o banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();