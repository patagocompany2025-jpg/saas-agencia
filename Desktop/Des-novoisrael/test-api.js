const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 TESTANDO API MEGA VENDEDOR AI');
  console.log('================================\n');

  try {
    // Teste 1: Health Check
    console.log('1️⃣ Testando Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data.status);
    console.log(`   WhatsApp: ${health.data.whatsapp}`);
    console.log(`   Uptime: ${health.data.uptime}s`);
    console.log(`   Perfis ativos: ${health.data.activeProfiles}`);
    console.log(`   Carrinhos ativos: ${health.data.activeCarts}\n`);

    // Teste 2: Status
    console.log('2️⃣ Testando Status...');
    const status = await axios.get(`${BASE_URL}/status`);
    console.log('✅ Status:', status.data.whatsapp);
    console.log(`   Tentativas de reconexão: ${status.data.reconnectAttempts}\n`);

    // Teste 3: Estatísticas
    console.log('3️⃣ Testando Estatísticas...');
    const stats = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Estatísticas obtidas');
    console.log(`   Carrinhos abandonados: ${stats.data.stats.abandonedCarts}\n`);

    // Teste 4: Simular Mensagem
    console.log('4️⃣ Testando Simulação de Mensagem...');
    const simulateResponse = await axios.post(`${BASE_URL}/simulate-message`, {
      customerId: '5511999999999@s.whatsapp.net',
      message: 'Preciso de 50 bíblias para igreja'
    });
    console.log('✅ Simulação realizada');
    console.log(`   Perfil detectado: ${simulateResponse.data.data.profile?.profile || 'N/A'}`);
    console.log(`   Desconto: ${simulateResponse.data.data.profile?.discount ? (simulateResponse.data.data.profile.discount * 100).toFixed(0) + '%' : 'N/A'}\n`);

    // Teste 5: Perfil do Cliente
    console.log('5️⃣ Testando Perfil do Cliente...');
    const profile = await axios.get(`${BASE_URL}/profile/5511999999999@s.whatsapp.net`);
    console.log('✅ Perfil obtido');
    console.log(`   Tipo: ${profile.data.profile.profile}`);
    console.log(`   Confiança: ${(profile.data.profile.confidence * 100).toFixed(0)}%`);
    console.log(`   Desconto: ${(profile.data.profile.discount * 100).toFixed(0)}%\n`);

    // Teste 6: Carrinho do Cliente
    console.log('6️⃣ Testando Carrinho do Cliente...');
    const cart = await axios.get(`${BASE_URL}/cart/5511999999999@s.whatsapp.net`);
    console.log('✅ Carrinho obtido');
    console.log(`   Itens: ${cart.data.cart.items.length}`);
    console.log(`   Total: R$ ${cart.data.cart.total.toFixed(2)}\n`);

    // Teste 7: Carrinhos Abandonados
    console.log('7️⃣ Testando Carrinhos Abandonados...');
    const abandoned = await axios.get(`${BASE_URL}/abandoned-carts`);
    console.log('✅ Carrinhos abandonados obtidos');
    console.log(`   Quantidade: ${abandoned.data.count}\n`);

    // Teste 8: Endpoint de Teste
    console.log('8️⃣ Testando Endpoint de Teste...');
    const test = await axios.get(`${BASE_URL}/test`);
    console.log('✅ Teste:', test.data.message);
    console.log(`   Versão: ${test.data.version}\n`);

    console.log('🎉 TODOS OS TESTES PASSARAM!');
    console.log('🚀 API Mega Vendedor AI funcionando perfeitamente!');

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
testAPI();
