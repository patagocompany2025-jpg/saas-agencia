const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando conteúdo do banco de dados...\n');
    
    // Verificar usuários
    const users = await prisma.user.findMany();
    console.log(`👥 Usuários: ${users.length}`);
    if (users.length > 0) {
      console.log('   Dados dos usuários:');
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Nome: ${user.name}, Email: ${user.email}`);
      });
    }
    
    // Verificar clientes
    const customers = await prisma.customers.findMany();
    console.log(`\n👤 Clientes: ${customers.length}`);
    if (customers.length > 0) {
      console.log('   Dados dos clientes:');
      customers.forEach(customer => {
        console.log(`   - ID: ${customer.id}, Nome: ${customer.name}, Email: ${customer.email}`);
      });
    }
    
    // Verificar reservas
    const bookings = await prisma.bookings.findMany();
    console.log(`\n📅 Reservas: ${bookings.length}`);
    if (bookings.length > 0) {
      console.log('   Dados das reservas:');
      bookings.forEach(booking => {
        console.log(`   - ID: ${booking.id}, Viajantes: ${booking.travelers}, Preço: ${booking.total_price}`);
      });
    }
    
    // Verificar pacotes
    const packages = await prisma.travel_packages.findMany();
    console.log(`\n✈️ Pacotes de Viagem: ${packages.length}`);
    if (packages.length > 0) {
      console.log('   Dados dos pacotes:');
      packages.forEach(pkg => {
        console.log(`   - ID: ${pkg.id}, Título: ${pkg.title}, Destino: ${pkg.destination}`);
      });
    }
    
    console.log('\n📊 RESUMO:');
    console.log(`   Total de registros: ${users.length + customers.length + bookings.length + packages.length}`);
    
    if (users.length + customers.length + bookings.length + packages.length === 0) {
      console.log('   ✅ Banco está vazio - seguro para reset');
    } else {
      console.log('   ⚠️ Banco tem dados - reset apagará tudo');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
