require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const CLIENT_ID = process.env.CONTA_AZUL_CLIENT_ID;
const CLIENT_SECRET = process.env.CONTA_AZUL_CLIENT_SECRET;

// Carregar tokens existentes
const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));

console.log('🔄 Renovando tokens...');
console.log('Refresh token:', tokens.refresh_token.substring(0, 50) + '...');

async function renovarTokens() {
  try {
    const response = await fetch('https://auth.contaazul.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refresh_token,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${error}`);
    }

    const novosTokens = await response.json();
    
    // Salvar novos tokens
    fs.writeFileSync('tokens.json', JSON.stringify(novosTokens, null, 2));
    
    console.log('✅ Tokens renovados com sucesso!');
    console.log('📄 Salvos em tokens.json');
    console.log('⏰ Válido por:', novosTokens.expires_in, 'segundos');
    
    // Salvar também no Mega Vendedor
    const megaVendedorPath = './agentes/dev1_alex/mega_vendedor_ai/tokens.json';
    fs.writeFileSync(megaVendedorPath, JSON.stringify(novosTokens, null, 2));
    console.log('📁 Tokens também salvos no Mega Vendedor AI');
    
    console.log('');
    console.log('🎯 Agora você pode usar no Mega Vendedor AI!');
    
  } catch (error) {
    console.log('❌ Erro ao renovar tokens:', error.message);
    console.log('🔧 Pode ser necessário fazer nova autorização');
  }
}

renovarTokens();
