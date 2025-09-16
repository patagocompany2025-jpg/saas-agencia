// testar-tokens.js
const fs = require('fs');
const fetch = require('node-fetch');

async function testarTokens() {
  console.log('🔍 TESTANDO TOKENS APÓS LOGIN...');
  
  try {
    // Carregar tokens
    const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
    console.log('✅ Tokens carregados com sucesso');
    console.log('🔑 Access Token presente:', !!tokens.access_token);
    console.log('🔄 Refresh Token presente:', !!tokens.refresh_token);
    console.log('⏰ Expires in:', tokens.expires_in, 'segundos');
    
    if (!tokens.access_token) {
      console.log('❌ Access token não encontrado');
      return;
    }
    
    // Testar API diretamente
    console.log('\n🌐 Testando API da Conta Azul...');
    const response = await fetch('https://api.contaazul.com/v1/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando!');
      console.log('📋 Dados recebidos:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na API:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testarTokens();
