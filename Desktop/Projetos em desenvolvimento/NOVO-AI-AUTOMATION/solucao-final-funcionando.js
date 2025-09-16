const readline = require('readline');
const fs = require('fs');
const path = require('path');
const https = require('https');

console.log('🎯 SOLUÇÃO FINAL - FUNCIONANDO 100%\n');

// Configurações
const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';
const CLIENT_SECRET = 'qh1e56gc0p59hum3v9i4eomifu93vhuropis5ela0bcrvcfh9nm';

console.log('📋 CONFIGURAÇÃO:');
console.log(`CLIENT_ID: ${CLIENT_ID}`);
console.log(`CLIENT_SECRET: ${CLIENT_SECRET}\n`);

// Interface para input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function fazerPergunta(pergunta) {
  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => {
      resolve(resposta);
    });
  });
}

async function solucaoFinal() {
  console.log('🔍 MÉTODO DEFINITIVO - SEM DEPENDÊNCIAS\n');
  
  console.log('📝 INSTRUÇÕES SIMPLIFICADAS:');
  console.log('1. Acesse: https://desenvolvedor.contaazul.com/');
  console.log('2. Faça login');
  console.log('3. Vá em "Aplicações"');
  console.log('4. Encontre: 5k3net0533tbg4ng5cl0311r3i');
  console.log('5. Clique em "Editar" ou "Configurar"');
  console.log('6. Na seção "URLs de Redirecionamento":');
  console.log('   - Adicione: http://localhost:3001/oauth/callback');
  console.log('   - Clique em "Adicionar" ou "+"');
  console.log('7. Clique em "Salvar" ou "Atualizar"');
  console.log('8. Volte aqui e pressione ENTER\n');
  
  await fazerPergunta('Pressione ENTER quando tiver configurado a URL...');
  
  console.log('\n🎯 TESTANDO SE A CONFIGURAÇÃO FUNCIONOU...');
  
  // Testar se a URL está funcionando
  const state = require('crypto').randomBytes(16).toString('hex');
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: 'http://localhost:3001/oauth/callback',
    state: state,
    scope: 'openid profile aws.cognito.signin.user.admin'
  });
  
  const oauthURL = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
  
  console.log('🔗 URL OAUTH:');
  console.log(oauthURL);
  console.log('\n📝 AGORA:');
  console.log('1. Copie a URL acima');
  console.log('2. Cole no navegador');
  console.log('3. Faça login no Conta Azul');
  console.log('4. Autorize a aplicação');
  console.log('5. Você será redirecionado para uma URL como:');
  console.log('   http://localhost:3001/oauth/callback?code=ABC123...');
  console.log('6. Copie a URL COMPLETA (com ?code=...) e cole aqui\n');
  
  const codigo = await fazerPergunta('Cole a URL completa com o código aqui: ');
  
  if (codigo.toLowerCase() === 'sair') {
    console.log('❌ Operação cancelada.');
    rl.close();
    return;
  }
  
  if (!codigo.includes('code=')) {
    console.log('❌ URL inválida. Deve conter "code="');
    console.log('Exemplo correto: http://localhost:3001/oauth/callback?code=ABC123...');
    rl.close();
    return;
  }
  
  // Extrair código da URL
  let code;
  try {
    const urlParts = codigo.split('?');
    if (urlParts.length > 1) {
      const urlParams = new URLSearchParams(urlParts[1]);
      code = urlParams.get('code');
    } else {
      // Se não tem ?, talvez o código esteja direto
      code = codigo;
    }
  } catch (error) {
    console.log('❌ Erro ao extrair código:', error.message);
    rl.close();
    return;
  }
  
  if (!code) {
    console.log('❌ Não foi possível extrair o código da URL');
    console.log('Certifique-se de que a URL contém "code="');
    rl.close();
    return;
  }
  
  console.log(`\n✅ Código extraído: ${code.substring(0, 20)}...`);
  
  // Trocar código por token
  await trocarCodigoPorToken(code);
}

async function trocarCodigoPorToken(code) {
  console.log('\n🔄 TROCANDO CÓDIGO POR TOKEN...');
  
  const tokenURL = 'https://auth.contaazul.com/oauth2/token';
  const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
  
  const postData = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'http://localhost:3001/oauth/callback'
  }).toString();
  
  const options = {
    hostname: 'auth.contaazul.com',
    port: 443,
    path: '/oauth2/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        
        if (response.access_token) {
          console.log('✅ TOKENS OBTIDOS COM SUCESSO!');
          console.log(`Access Token: ${response.access_token.substring(0, 20)}...`);
          console.log(`Refresh Token: ${response.refresh_token.substring(0, 20)}...`);
          console.log(`Expires In: ${response.expires_in} segundos`);
          
          // Salvar tokens
          salvarTokens(response);
        } else {
          console.log('❌ Erro ao obter tokens:');
          console.log(JSON.stringify(response, null, 2));
        }
      } catch (error) {
        console.log('❌ Erro ao processar resposta:');
        console.log('Resposta bruta:', data);
      }
      
      rl.close();
    });
  });
  
  req.on('error', (error) => {
    console.log('❌ Erro na requisição:', error.message);
    rl.close();
  });
  
  req.write(postData);
  req.end();
}

function salvarTokens(tokens) {
  console.log('\n💾 SALVANDO TOKENS...');
  
  // Salvar em tokens.json
  const tokensPath = path.join(__dirname, 'agentes', 'dev1_alex', 'mega_vendedor_ai', 'tokens.json');
  const tokensDir = path.dirname(tokensPath);
  
  if (!fs.existsSync(tokensDir)) {
    fs.mkdirSync(tokensDir, { recursive: true });
  }
  
  const tokensData = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    token_type: tokens.token_type,
    created_at: new Date().toISOString()
  };
  
  fs.writeFileSync(tokensPath, JSON.stringify(tokensData, null, 2));
  console.log(`✅ Tokens salvos em: ${tokensPath}`);
  
  // Atualizar env.config
  const envConfigPath = path.join(__dirname, 'agentes', 'dev1_alex', 'mega_vendedor_ai', 'env.config');
  if (fs.existsSync(envConfigPath)) {
    let envContent = fs.readFileSync(envConfigPath, 'utf8');
    envContent = envContent.replace(/CONTA_AZUL_CLIENT_ID=.*/, `CONTA_AZUL_CLIENT_ID=${CLIENT_ID}`);
    envContent = envContent.replace(/CONTA_AZUL_CLIENT_SECRET=.*/, `CONTA_AZUL_CLIENT_SECRET=${CLIENT_SECRET}`);
    fs.writeFileSync(envConfigPath, envContent);
    console.log(`✅ env.config atualizado: ${envConfigPath}`);
  }
  
  console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
  console.log('O Mega Vendedor AI agora está conectado ao Conta Azul.');
  console.log('\n📋 RESUMO:');
  console.log('- Tokens salvos com sucesso');
  console.log('- Configuração atualizada');
  console.log('- Sistema pronto para uso');
}

// Iniciar processo
solucaoFinal().catch(console.error);
