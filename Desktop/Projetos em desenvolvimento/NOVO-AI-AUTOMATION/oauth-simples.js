require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const CLIENT_ID = process.env.CONTA_AZUL_CLIENT_ID;
const CLIENT_SECRET = process.env.CONTA_AZUL_CLIENT_SECRET;
const REDIRECT_URI = process.env.CONTA_AZUL_REDIRECT_URI;
const SCOPES = process.env.CONTA_AZUL_SCOPES;

console.log('🔑 Configuração OAuth:');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('REDIRECT_URI:', REDIRECT_URI);
console.log('SCOPES:', SCOPES);
console.log('');

// Gerar URL de autorização
const state = Math.random().toString(36).slice(2);
const authUrl = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;

console.log('🌐 Abra esta URL no navegador:');
console.log(authUrl);
console.log('');
console.log('📝 Depois de autorizar, cole o código aqui:');

// Aguardar input do usuário
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Código OAuth: ', async (code) => {
  if (!code || code.trim() === '') {
    console.log('❌ Código não fornecido');
    rl.close();
    return;
  }

  try {
    console.log('🔄 Trocando código por tokens...');
    
    const response = await fetch('https://auth.contaazul.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code.trim(),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Erro na API: ${response.status} - ${error}`);
    }

    const tokens = await response.json();
    
    // Salvar tokens
    fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
    
    console.log('✅ Tokens obtidos com sucesso!');
    console.log('📄 Salvos em tokens.json');
    console.log('');
    console.log('🎯 Agora você pode usar no Mega Vendedor AI!');
    
    // Salvar também no Mega Vendedor
    const megaVendedorPath = './agentes/dev1_alex/mega_vendedor_ai/tokens.json';
    fs.writeFileSync(megaVendedorPath, JSON.stringify(tokens, null, 2));
    console.log('📁 Tokens também salvos no Mega Vendedor AI');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
  
  rl.close();
});
