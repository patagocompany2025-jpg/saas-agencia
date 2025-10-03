require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.user.create({
      data: {
        name: 'Admin Local',
        email: 'admin@local.com',
        role: 'admin',
        status: 'active'
      }
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log('📧 Email: admin@local.com');
    console.log('👤 Role: admin');
    console.log('\n⚠️  IMPORTANTE: Este sistema usa Stack Auth.');
    console.log('Você precisa se registrar através da tela de sign-up do Stack Auth.');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Usuário já existe no banco!');

      const user = await prisma.user.update({
        where: { email: 'admin@local.com' },
        data: {
          role: 'admin',
          status: 'active'
        }
      });

      console.log('✅ Usuário atualizado com sucesso!');
      console.log('📧 Email: admin@local.com');
      console.log('👤 Role: admin');
    } else {
      console.error('❌ Erro:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
