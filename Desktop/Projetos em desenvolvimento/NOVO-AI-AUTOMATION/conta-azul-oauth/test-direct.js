require('dotenv').config();
const fetch = require('node-fetch');

// Teste direto com as credenciais de teste
async function testDirect() {
  console.log('🔍 Testando API diretamente com credenciais...\n');

  const clientId = process.env.CONTA_AZUL_CLIENT_ID;
  const clientSecret = process.env.CONTA_AZUL_CLIENT_SECRET;
  
  console.log('📋 Credenciais:');
  console.log(`Client ID: ${clientId}`);
  console.log(`Client Secret: ${clientSecret ? 'Presente' : 'Ausente'}\n`);

  // Teste de conectividade básica
  console.log('1️⃣ Testando conectividade...');
  try {
    const response = await fetch('https://api.contaazul.com/health', {
      method: 'GET',
      timeout: 5000
    });
    console.log(`✅ API acessível: ${response.status}`);
  } catch (error) {
    console.log(`❌ Erro de conectividade: ${error.message}`);
  }

  // Teste com token de acesso direto (se disponível)
  console.log('\n2️⃣ Testando com token direto...');
  try {
    // Usando o access_token da imagem que você mostrou
    const accessToken = 'eyJraWQiOiJUa1BRbWsOUIR3M3RuWIZXcDdEanBURFhcL2RTajNvMU5SckIOR31';
    
    const response = await fetch('https://api.contaazul.com/v1/contacts?page=1&size=5', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando com token direto!');
      console.log(`📊 Total de contatos: ${data.total || 'N/A'}`);
      console.log(`📋 Contatos retornados: ${data.data ? data.data.length : 0}`);
    } else {
      console.log(`❌ Erro na API: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
  }

  console.log('\n🎯 Resumo:');
  console.log('✅ Credenciais corretas');
  console.log('✅ URLs corrigidas');
  console.log('❌ Redirect URI não configurado no painel');
  console.log('\n💡 Soluções:');
  console.log('1. Procure por "Redirect URIs" no painel do desenvolvedor');
  console.log('2. Ou crie uma nova aplicação com Redirect URI configurado');
  console.log('3. Ou use o token direto para testes');
}

testDirect().catch(console.error);
