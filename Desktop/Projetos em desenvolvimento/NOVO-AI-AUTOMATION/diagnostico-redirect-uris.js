const https = require('https');

console.log('🔍 DIAGNÓSTICO REDIRECT_URIs - CONTA AZUL\n');

// Lista de URLs para testar
const redirectURIs = [
  'http://localhost:3001/oauth/callback',
  'http://localhost:8080/oauth/callback', 
  'http://localhost:5173/oauth/callback',
  'http://localhost:3000/oauth/callback',
  'https://lojanovoisrael.com.br/oauth/callback',
  'https://24a9c751850a.ngrok-free.app/oauth/callback',
  'http://127.0.0.1:3001/oauth/callback',
  'http://127.0.0.1:8080/oauth/callback'
];

const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';

console.log('🧪 TESTANDO DIFERENTES REDIRECT_URIs...\n');

async function testRedirectURI(redirectURI, index) {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: redirectURI,
      state: 'test123',
      scope: 'openid profile aws.cognito.signin.user.admin'
    });

    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: `/oauth2/authorize?${params.toString()}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 302) {
          const location = res.headers.location;
          if (location && location.includes('error=redirect_mismatch')) {
            console.log(`❌ ${index + 1}. ${redirectURI} - redirect_mismatch`);
          } else if (location && location.includes('code=')) {
            console.log(`✅ ${index + 1}. ${redirectURI} - FUNCIONANDO!`);
          } else {
            console.log(`⚠️  ${index + 1}. ${redirectURI} - Status ${res.statusCode}`);
          }
        } else if (res.statusCode === 200) {
          console.log(`✅ ${index + 1}. ${redirectURI} - Status 200 (página de login)`);
        } else {
          console.log(`❌ ${index + 1}. ${redirectURI} - Status ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${index + 1}. ${redirectURI} - Erro de conexão`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  for (let i = 0; i < redirectURIs.length; i++) {
    await testRedirectURI(redirectURIs[i], i);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📋 RESULTADO:');
  console.log('✅ = URL aceita pela aplicação');
  console.log('❌ = redirect_mismatch (não configurada)');
  console.log('⚠️  = Outro erro');
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('1. Identifique qual URL retornou ✅');
  console.log('2. Use essa URL na configuração');
  console.log('3. Ou configure a URL desejada no painel da Conta Azul');
}

runTests().catch(console.error);
