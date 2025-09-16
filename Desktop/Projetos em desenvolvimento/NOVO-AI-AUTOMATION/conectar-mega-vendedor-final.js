const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🎯 CONECTAR MEGA VENDEDOR AI - MÉTODO FINAL SIMPLES\n');

// Configurações da aplicação de desenvolvimento
const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';
const CLIENT_SECRET = 'qh1e56gc0p59hum3v9i4eomifu93vhuropis5ela0bcrvcfh9nm';

console.log('📋 CONFIGURAÇÃO:');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET.substring(0, 10) + '...');
console.log('');

console.log('🎯 URL OAUTH FINAL:');
const authUrl = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Foauth%2Fcallback&scope=openid+profile+aws.cognito.signin.user.admin`;
console.log(authUrl);
console.log('');

console.log('📋 INSTRUÇÕES PARA INICIANTES:');
console.log('1. Abra a URL acima no navegador');
console.log('2. Faça login no Conta Azul');
console.log('3. Autorize a aplicação');
console.log('4. Você será redirecionado para uma página com erro (normal)');
console.log('5. COPIE o código da URL (parâmetro ?code=...)');
console.log('6. Cole o código aqui para obter os tokens');
console.log('');

// Função para trocar código por tokens
async function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      grant_type: 'authorization_code',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      redirect_uri: 'http://localhost:3001/oauth/callback'
    });

    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('🔄 Trocando código por tokens...');

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const tokens = JSON.parse(data);
          if (tokens.access_token) {
            console.log('✅ Tokens obtidos com sucesso!');
            resolve(tokens);
          } else {
            console.log('❌ Erro na resposta:', data);
            reject(new Error('Resposta inválida da API: ' + data));
          }
        } catch (e) {
          console.log('❌ Erro ao parsear resposta:', data);
          reject(new Error('Erro ao parsear resposta: ' + data));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Erro na requisição:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Função para salvar tokens no Mega Vendedor
function saveTokensToMegaVendedor(tokens) {
  const megaVendedorTokensPath = path.join(__dirname, 'agentes/dev1_alex/mega_vendedor_ai/tokens.json');
  
  try {
    fs.writeFileSync(megaVendedorTokensPath, JSON.stringify(tokens, null, 2));
    console.log('✅ Tokens salvos em:', megaVendedorTokensPath);
    return true;
  } catch (error) {
    console.log('❌ Erro ao salvar tokens:', error.message);
    return false;
  }
}

// Função para testar conexão
async function testConnection(accessToken) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.contaazul.com',
      port: 443,
      path: '/v1/contacts?limit=1',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Teste de conexão: SUCESSO!');
          console.log('🎉 MEGA VENDEDOR AI ESTÁ CONECTADO À CONTA AZUL!');
          resolve(true);
        } else {
          console.log(`❌ Teste de conexão: Status ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Erro no teste de conexão:', error.message);
      resolve(false);
    });

    req.end();
  });
}

// Aguardar input do usuário
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n📝 Cole o código OAuth aqui (ou "sair" para cancelar): ', async (code) => {
  if (code.toLowerCase() === 'sair') {
    console.log('❌ Operação cancelada');
    rl.close();
    return;
  }

  if (!code || code.trim() === '') {
    console.log('❌ Código não fornecido');
    rl.close();
    return;
  }

  try {
    // Trocar código por tokens
    const tokens = await exchangeCodeForTokens(code.trim());
    
    // Salvar tokens no Mega Vendedor
    const saved = saveTokensToMegaVendedor(tokens);
    
    if (saved) {
      console.log('\n🎉 SUCESSO! MEGA VENDEDOR AI CONECTADO!');
      console.log('📊 Tokens obtidos:');
      console.log('   Access Token:', tokens.access_token.substring(0, 50) + '...');
      console.log('   Refresh Token:', tokens.refresh_token.substring(0, 50) + '...');
      console.log('   Expires in:', tokens.expires_in, 'segundos');
      console.log('   Token Type:', tokens.token_type);
      
      // Testar conexão
      console.log('\n🧪 Testando conexão com API...');
      const isConnected = await testConnection(tokens.access_token);
      
      if (isConnected) {
        console.log('\n✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
        console.log('🎯 O Mega Vendedor AI está pronto para usar!');
      } else {
        console.log('\n⚠️ Tokens salvos, mas conexão com API falhou');
        console.log('🔧 Pode ser necessário reiniciar o Mega Vendedor AI');
      }
    }
    
  } catch (error) {
    console.log('\n❌ Erro ao obter tokens:', error.message);
    console.log('🔧 Verifique se o código está correto e tente novamente');
  }
  
  rl.close();
});
