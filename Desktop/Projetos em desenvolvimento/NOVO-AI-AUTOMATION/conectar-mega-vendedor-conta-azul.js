require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';
const CLIENT_SECRET = 'qh1e56gc0p59hum3v9i4eomifu93vhuropis5ela0bcrvcfh9nm';
const REDIRECT_URI = 'https://lojanovoisrael.com.br/oauth/callback';
const SCOPES = 'openid profile aws.cognito.signin.user.admin';

console.log('🚀 CONECTANDO MEGA VENDEDOR COM CONTA AZUL');
console.log('==========================================');
console.log('');

// Gerar URL de autorização
const state = Math.random().toString(36).slice(2);
const authUrl = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;

console.log('🌐 PASSO 1: Abra esta URL no navegador:');
console.log(authUrl);
console.log('');
console.log('📝 PASSO 2: Após autorizar, você será redirecionado para lojanovoisrael.com.br');
console.log('    Na URL de redirecionamento, procure por: ?code=XXXXX&state=YYYYY');
console.log('    Copie apenas o código (parte após code=)');
console.log('');

// Aguardar input do usuário
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Cole o código OAuth aqui: ', async (code) => {
  if (!code || code.trim() === '') {
    console.log('❌ Código não fornecido');
    rl.close();
    return;
  }

  try {
    console.log('');
    console.log('🔄 PASSO 3: Trocando código por tokens...');
    
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
    
    console.log('✅ Tokens obtidos com sucesso!');
    console.log('📄 Access Token:', tokens.access_token.substring(0, 50) + '...');
    console.log('⏰ Válido por:', tokens.expires_in, 'segundos');
    console.log('');
    
    // Salvar tokens no Mega Vendedor
    const megaVendedorPath = './agentes/dev1_alex/mega_vendedor_ai/tokens.json';
    fs.writeFileSync(megaVendedorPath, JSON.stringify(tokens, null, 2));
    console.log('📁 Tokens salvos no Mega Vendedor AI');
    
    // Atualizar o arquivo de configuração do Mega Vendedor
    const configPath = './agentes/dev1_alex/mega_vendedor_ai/env.config';
    let config = fs.readFileSync(configPath, 'utf8');
    
    // Substituir o refresh_token no arquivo de configuração
    config = config.replace(
      /CONTA_AZUL_REFRESH_TOKEN=.*/,
      `CONTA_AZUL_REFRESH_TOKEN=${tokens.refresh_token}`
    );
    
    fs.writeFileSync(configPath, config);
    console.log('🔧 Configuração do Mega Vendedor atualizada');
    
    // Testar conexão com a API do Conta Azul
    console.log('');
    console.log('🧪 PASSO 4: Testando conexão com API do Conta Azul...');
    
    const testResponse = await fetch('https://api.contaazul.com/v1/customers', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Conexão com Conta Azul estabelecida!');
      console.log('📊 Clientes encontrados:', data.length || 'N/A');
    } else {
      console.log('⚠️ Conexão estabelecida, mas API retornou:', testResponse.status);
    }
    
    console.log('');
    console.log('🎉 MEGA VENDEDOR CONECTADO COM CONTA AZUL!');
    console.log('🚀 Agora você pode iniciar o Mega Vendedor AI');
    console.log('');
    console.log('Para iniciar:');
    console.log('cd agentes/dev1_alex/mega_vendedor_ai');
    console.log('npm start');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('🔧 Verifique se o código está correto e tente novamente');
  }
  
  rl.close();
});
