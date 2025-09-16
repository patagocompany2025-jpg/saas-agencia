const fs = require('fs');
const fetch = require('node-fetch');

// Carregar tokens existentes
const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));

console.log('=== TESTANDO TOKENS EXISTENTES ===');
console.log('Access Token:', tokens.access_token ? '✅ Presente' : '❌ Ausente');
console.log('Refresh Token:', tokens.refresh_token ? '✅ Presente' : '❌ Ausente');
console.log('Token Type:', tokens.token_type);
console.log('Expires In:', tokens.expires_in);

// Testar API com token existente
async function testAPI() {
  try {
    console.log('\n=== TESTANDO API CONTA AZUL ===');
    
    const response = await fetch('https://api.contaazul.com/v1/contacts?limit=5', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando!');
      console.log('Contatos encontrados:', data.length || 0);
      if (data.length > 0) {
        console.log('Primeiro contato:', data[0].name || 'Nome não disponível');
      }
    } else {
      const error = await response.text();
      console.log('❌ Erro na API:', error);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

testAPI();
