const https = require('https');

console.log('🔍 INVESTIGAÇÃO PROFUNDA - PROBLEMA OAUTH\n');

// Testar diferentes variações da URL
const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';
const CLIENT_SECRET = 'qh1e56gc0p59hum3v9i4eomifu93vhuropis5ela0bcrvcfh9nm';

console.log('📋 TESTANDO DIFERENTES CONFIGURAÇÕES:\n');

// 1. Testar URL básica
function testBasicURL() {
  return new Promise((resolve) => {
    const url = 'https://auth.contaazul.com/oauth2/authorize';
    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: '/oauth2/authorize',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      console.log(`1. URL Básica: Status ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('   ✅ Endpoint funcionando');
      } else {
        console.log('   ❌ Endpoint com problema');
      }
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.log('1. URL Básica: ❌ Erro de conexão');
      resolve(false);
    });

    req.end();
  });
}

// 2. Testar URL com parâmetros
function testURLWithParams() {
  return new Promise((resolve) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: 'http://localhost:3001/oauth/callback',
      scope: 'openid profile aws.cognito.signin.user.admin'
    });

    const url = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
    
    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: `/oauth2/authorize?${params.toString()}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      console.log(`2. URL com Parâmetros: Status ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('   ✅ URL com parâmetros funcionando');
      } else {
        console.log('   ❌ URL com parâmetros com problema');
      }
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.log('2. URL com Parâmetros: ❌ Erro de conexão');
      resolve(false);
    });

    req.end();
  });
}

// 3. Testar CLIENT_ID específico
function testClientID() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: `/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Foauth%2Fcallback&scope=openid+profile+aws.cognito.signin.user.admin`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      console.log(`3. CLIENT_ID ${CLIENT_ID}: Status ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('   ✅ CLIENT_ID válido');
      } else if (res.statusCode === 400) {
        console.log('   ❌ CLIENT_ID inválido ou malformado');
      } else if (res.statusCode === 401) {
        console.log('   ❌ CLIENT_ID não autorizado');
      } else {
        console.log('   ⚠️ Status inesperado');
      }
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.log('3. CLIENT_ID: ❌ Erro de conexão');
      resolve(false);
    });

    req.end();
  });
}

// 4. Testar diferentes REDIRECT_URIs
function testRedirectURIs() {
  const redirectURIs = [
    'http://localhost:3001/oauth/callback',
    'http://localhost:8080/oauth/callback',
    'https://localhost:3001/oauth/callback',
    'http://127.0.0.1:3001/oauth/callback',
    'https://lojanovoisrael.com.br/oauth/callback'
  ];

  console.log('4. TESTANDO DIFERENTES REDIRECT_URIs:');
  
  redirectURIs.forEach((redirectUri, index) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      scope: 'openid profile aws.cognito.signin.user.admin'
    });

    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: `/oauth2/authorize?${params.toString()}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      console.log(`   ${index + 1}. ${redirectUri}: Status ${res.statusCode}`);
      if (res.statusCode === 200 || res.statusCode === 302) {
        console.log('      ✅ Funcionando');
      } else if (res.statusCode === 400) {
        console.log('      ❌ redirect_mismatch');
      } else {
        console.log('      ⚠️ Outro erro');
      }
    });

    req.on('error', (error) => {
      console.log(`   ${index + 1}. ${redirectUri}: ❌ Erro de conexão`);
    });

    req.end();
  });
}

// 5. Verificar se aplicação existe
function testApplicationExists() {
  return new Promise((resolve) => {
    // Tentar acessar endpoint de informações da aplicação
    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: '/oauth2/authorize?response_type=code&client_id=INVALID_ID&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Foauth%2Fcallback&scope=openid+profile+aws.cognito.signin.user.admin',
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      console.log(`5. CLIENT_ID Inválido: Status ${res.statusCode}`);
      if (res.statusCode === 400) {
        console.log('   ✅ Servidor rejeita CLIENT_ID inválido (normal)');
      } else {
        console.log('   ⚠️ Comportamento inesperado');
      }
      resolve(res.statusCode);
    });

    req.on('error', (error) => {
      console.log('5. CLIENT_ID Inválido: ❌ Erro de conexão');
      resolve(false);
    });

    req.end();
  });
}

// Executar todos os testes
async function runAllTests() {
  console.log('🧪 EXECUTANDO TESTES...\n');
  
  await testBasicURL();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testURLWithParams();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await testClientID();
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  testRedirectURIs();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await testApplicationExists();
  
  console.log('\n📋 ANÁLISE DOS RESULTADOS:');
  console.log('Se todos os testes retornarem 200/302: URL está funcionando');
  console.log('Se retornar 400: Problema com parâmetros');
  console.log('Se retornar 401: Problema de autenticação');
  console.log('Se retornar 404: Endpoint não existe');
  console.log('Se retornar erro de conexão: Problema de rede');
  
  console.log('\n🎯 POSSÍVEIS CAUSAS DO PROBLEMA:');
  console.log('1. CLIENT_ID incorreto ou expirado');
  console.log('2. Aplicação desativada no painel');
  console.log('3. Problema de rede/firewall');
  console.log('4. URL malformada');
  console.log('5. Servidor Conta Azul com problema');
  console.log('6. REDIRECT_URI não configurado corretamente');
}

runAllTests().catch(console.error);
