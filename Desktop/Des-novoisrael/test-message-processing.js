const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testMessageProcessing() {
  console.log('🧪 TESTANDO PROCESSAMENTO DE MENSAGENS');
  console.log('=====================================\n');

  try {
    // Teste 1: Simular mensagem de pastor
    console.log('1️⃣ Testando mensagem de pastor...');
    const pastorResponse = await axios.post(`${BASE_URL}/test-message-processing`, {
      customerId: '5511999999999@s.whatsapp.net',
      message: 'Preciso de 50 bíblias para igreja'
    });
    console.log('✅ Pastor:', pastorResponse.data.data.profile.profile);
    console.log(`   Desconto: ${(pastorResponse.data.data.profile.discount * 100).toFixed(0)}%\n`);

    // Teste 2: Simular mensagem de jovem
    console.log('2️⃣ Testando mensagem de jovem...');
    const jovemResponse = await axios.post(`${BASE_URL}/test-message-processing`, {
      customerId: '5511888888888@s.whatsapp.net',
      message: 'Essa camiseta de fé tá quanto?'
    });
    console.log('✅ Jovem:', jovemResponse.data.data.profile.profile);
    console.log(`   Desconto: ${(jovemResponse.data.data.profile.discount * 100).toFixed(0)}%\n`);

    // Teste 3: Simular mensagem de mãe
    console.log('3️⃣ Testando mensagem de mãe...');
    const maeResponse = await axios.post(`${BASE_URL}/test-message-processing`, {
      customerId: '5511777777777@s.whatsapp.net',
      message: 'Materiais para batismo do meu filho'
    });
    console.log('✅ Mãe:', maeResponse.data.data.profile.profile);
    console.log(`   Desconto: ${(maeResponse.data.data.profile.discount * 100).toFixed(0)}%\n`);

    // Teste 4: Verificar status do sistema
    console.log('4️⃣ Verificando status do sistema...');
    const statusResponse = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status:', statusResponse.data.whatsapp);
    console.log(`   Perfis ativos: ${statusResponse.data.activeProfiles}`);
    console.log(`   Carrinhos ativos: ${statusResponse.data.activeCarts}\n`);

    console.log('🎉 TESTE DE PROCESSAMENTO CONCLUÍDO!');
    console.log('📱 Agora envie uma mensagem real para o WhatsApp conectado');
    console.log('📊 Monitore os logs no console para ver o processamento');

  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    
    process.exit(1);
  }
}

// Executar testes
testMessageProcessing();
