require('dotenv').config();
const fetch = require('node-fetch');

const CLIENT_ID = process.env.CONTA_AZUL_CLIENT_ID;
const CLIENT_SECRET = process.env.CONTA_AZUL_CLIENT_SECRET;

console.log('🧪 Testando API do Conta Azul...');

async function testarAPI() {
  try {
    // Primeiro, vamos tentar obter um novo access_token usando client_credentials
    console.log('🔄 Tentando obter token com client_credentials...');
    
    const response = await fetch('https://auth.contaazul.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: 'openid profile aws.cognito.signin.user.admin'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.log('❌ Erro ao obter token:', response.status, error);
      return;
    }

    const tokens = await response.json();
    console.log('✅ Token obtido com sucesso!');
    console.log('📄 Access token:', tokens.access_token.substring(0, 50) + '...');
    console.log('⏰ Válido por:', tokens.expires_in, 'segundos');
    
    // Salvar tokens
    const fs = require('fs');
    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    
    // Salvar também no Mega Vendedor
    const megaVendedorPath = './agentes/dev1_alex/mega_vendedor_ai/tokens.json';
    fs.writeFileSync(megaVendedorPath, JSON.stringify(tokens, null, 2));
    console.log('📁 Tokens salvos no Mega Vendedor AI');
    
    console.log('');
    console.log('🎯 Agora você pode usar no Mega Vendedor AI!');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testarAPI();
