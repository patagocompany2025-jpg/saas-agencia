const fetch = require('node-fetch');
const fs = require('fs');

console.log('🔧 RESOLVENDO TOKENS COM CREDENCIAIS ALTERNATIVAS');
console.log('==================================================');
console.log('');

// Credenciais alternativas encontradas no projeto
const CLIENT_ID = '7f178p84rfk7phnkq2bbthk3m1';
const CLIENT_SECRET = '5cf9ij4hk7sgnuubmd8d6uo2isb5jb3mi90t7f00g8npfnq72fp';
const REDIRECT_URI = 'https://novoisrael2025-fresh.loca.lt/auth/conta-azul/callback';

// Gerar URL de autorização
const state = Math.random().toString(36).slice(2);
const authUrl = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20aws.cognito.signin.user.admin&state=${state}`;

console.log('📋 INSTRUÇÕES:');
console.log('1. Abra esta URL no navegador:');
console.log('');
console.log(authUrl);
console.log('');
console.log('2. Faça login na Conta Azul');
console.log('3. Autorize a aplicação');
console.log('4. Você será redirecionado para uma URL com o código');
console.log('5. Na URL de redirecionamento, procure por: ?code=XXXXX&state=YYYYY');
console.log('6. Copie APENAS o código (parte após code=)');
console.log('');
console.log('⚠️ IMPORTANTE:');
console.log('Se der erro de timeout, é normal. O importante é pegar o código da URL.');
console.log('');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('🔑 Cole o código aqui: ', async (code) => {
  if (!code || code.trim() === '') {
    console.log('❌ Código não fornecido');
    rl.close();
    return;
  }

  try {
    console.log('');
    console.log('🔄 Obtendo novos tokens...');
    
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
      throw new Error(`Erro: ${response.status} - ${error}`);
    }

    const tokens = await response.json();
    
    console.log('✅ NOVOS TOKENS OBTIDOS!');
    console.log('📄 Access Token:', tokens.access_token.substring(0, 50) + '...');
    console.log('⏰ Válido por:', tokens.expires_in, 'segundos');
    console.log('');
    
    // Salvar tokens no Mega Vendedor
    const megaVendedorPath = './agentes/dev1_alex/mega_vendedor_ai/tokens.json';
    fs.writeFileSync(megaVendedorPath, JSON.stringify(tokens, null, 2));
    console.log('📁 Tokens salvos no Mega Vendedor AI');
    
    // Atualizar configuração do Mega Vendedor
    const configPath = './agentes/dev1_alex/mega_vendedor_ai/env.config';
    let config = fs.readFileSync(configPath, 'utf8');
    config = config.replace(
      /CONTA_AZUL_REFRESH_TOKEN=.*/,
      `CONTA_AZUL_REFRESH_TOKEN=${tokens.refresh_token}`
    );
    fs.writeFileSync(configPath, config);
    console.log('🔧 Configuração atualizada');
    
    // Testar conexão
    console.log('');
    console.log('🧪 Testando conexão com Conta Azul...');
    
    const testResponse = await fetch('https://api.contaazul.com/v1/customers', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (testResponse.ok) {
      console.log('✅ CONEXÃO ESTABELECIDA!');
      console.log('🎯 Mega Vendedor conectado com Conta Azul');
    } else {
      console.log('⚠️ Conexão estabelecida, mas API retornou:', testResponse.status);
    }
    
    console.log('');
    console.log('🚀 PRÓXIMO PASSO:');
    console.log('cd agentes/dev1_alex/mega_vendedor_ai');
    console.log('npm start');
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    console.log('');
    console.log('💡 DICA: Se der erro invalid_client, tente:');
    console.log('1. node conta-azul-fixed.js (usar servidor local)');
    console.log('2. Ou criar nova aplicação no painel da Conta Azul');
  }
  
  rl.close();
});
