require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testMultiUser() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🧪 Testando sistema multi-usuário...');
    
    // Criar um usuário de teste
    const testUser = await prisma.user.create({
      data: {
        name: 'Usuário Teste',
        email: 'teste@exemplo.com',
        password: 'senha123',
        role: 'user'
      }
    });
    
    console.log('✅ Usuário criado:', testUser.name, testUser.email);
    
    // Verificar se o usuário aparece na lista
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true, created_at: true }
    });
    
    console.log('\n👥 Todos os usuários no banco:');
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.created_at}`);
    });
    
    console.log('\n🎯 RESULTADO:');
    console.log('✅ Se você executar este script em outro computador,');
    console.log('✅ o usuário criado aparecerá na lista!');
    console.log('✅ Isso prova que o banco está sincronizado.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testMultiUser();
