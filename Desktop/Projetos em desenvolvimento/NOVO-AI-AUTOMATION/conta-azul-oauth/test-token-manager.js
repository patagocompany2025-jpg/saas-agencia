// test-token-manager.js - Teste direto do sistema de gerenciamento automático
const tokenManager = require('./token-manager');

async function testTokenManager() {
  console.log('🧪 TESTANDO SISTEMA DE GERENCIAMENTO AUTOMÁTICO DE TOKENS');
  console.log('=' .repeat(60));
  
  // 1. Verificar status inicial
  console.log('\n📊 1. STATUS INICIAL DOS TOKENS:');
  const initialStatus = tokenManager.getTokenStatus();
  console.log(JSON.stringify(initialStatus, null, 2));
  
  // 2. Carregar tokens existentes
  console.log('\n📁 2. CARREGANDO TOKENS EXISTENTES:');
  const loaded = tokenManager.loadTokens();
  console.log(`Tokens carregados: ${loaded ? '✅ Sim' : '❌ Não'}`);
  
  // 3. Verificar status após carregamento
  console.log('\n📊 3. STATUS APÓS CARREGAMENTO:');
  const statusAfterLoad = tokenManager.getTokenStatus();
  console.log(JSON.stringify(statusAfterLoad, null, 2));
  
  if (!statusAfterLoad.hasTokens) {
    console.log('\n❌ NENHUM TOKEN DISPONÍVEL');
    console.log('💡 Para testar o sistema automático, você precisa:');
    console.log('   1. Executar o servidor: node servidor-automatico.js');
    console.log('   2. Acessar: http://localhost:5053/auth/start');
    console.log('   3. Fazer login na Conta Azul');
    console.log('   4. Executar este teste novamente');
    return;
  }
  
  // 4. Testar obtenção de token válido
  console.log('\n🔑 4. TESTANDO OBTENÇÃO DE TOKEN VÁLIDO:');
  try {
    const validToken = await tokenManager.getValidToken();
    console.log(`✅ Token obtido: ${validToken ? 'Sim' : 'Não'}`);
    console.log(`🔑 Token (primeiros 20 chars): ${validToken ? validToken.substring(0, 20) + '...' : 'N/A'}`);
  } catch (error) {
    console.log(`❌ Erro ao obter token: ${error.message}`);
  }
  
  // 5. Testar requisição para API
  console.log('\n🌐 5. TESTANDO REQUISIÇÃO PARA API:');
  try {
    const apiData = await tokenManager.makeApiRequest('/v1/contacts?limit=1');
    console.log('✅ Requisição bem-sucedida!');
    console.log('📋 Dados recebidos:', JSON.stringify(apiData, null, 2));
  } catch (error) {
    console.log(`❌ Erro na requisição: ${error.message}`);
  }
  
  // 6. Verificar status final
  console.log('\n📊 6. STATUS FINAL DOS TOKENS:');
  const finalStatus = tokenManager.getTokenStatus();
  console.log(JSON.stringify(finalStatus, null, 2));
  
  console.log('\n🎉 TESTE CONCLUÍDO!');
  console.log('=' .repeat(60));
}

// Executar teste
testTokenManager().catch(console.error);
