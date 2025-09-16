const https = require('https');
const crypto = require('crypto');

console.log('🔍 INVESTIGAÇÃO COMPLETA - TODAS AS URLs FALHANDO\n');

// Lista de aplicações para testar
const aplicacoes = [
  {
    nome: 'Desenvolvimento',
    client_id: '5k3net0533tbg4ng5cl0311r3i',
    client_secret: 'qh1e56gc0p59hum3v9i4eomifu93vhuropis5ela0bcrvcfh9nm',
    redirect_uris: [
      'http://localhost:3001/oauth/callback',
      'http://localhost:8080/oauth/callback',
      'http://localhost:5173/oauth/callback'
    ]
  },
  {
    nome: 'Produção',
    client_id: '5jn2mdbh7v0n4er527men441ar',
    client_secret: 'qn6d2bkpviitlq43p3g7lkivd2cpm69emv2kmhtmtot6bsbnvkh',
    redirect_uris: [
      'https://lojanovoisrael.com.br/oauth/callback',
      'https://24a9c751850a.ngrok-free.app/oauth/callback'
    ]
  }
];

async function testarAplicacao(aplicacao) {
  console.log(`\n🧪 TESTANDO APLICAÇÃO: ${aplicacao.nome}`);
  console.log(`CLIENT_ID: ${aplicacao.client_id}`);
  
  for (const redirect_uri of aplicacao.redirect_uris) {
    console.log(`\n  📍 Testando: ${redirect_uri}`);
    
    const state = crypto.randomBytes(16).toString('hex');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: aplicacao.client_id,
      redirect_uri: redirect_uri,
      state: state,
      scope: 'openid profile aws.cognito.signin.user.admin'
    });

    const url = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
    
    try {
      const resultado = await testarURL(url);
      console.log(`    Status: ${resultado.status}`);
      console.log(`    Erro: ${resultado.erro || 'Nenhum'}`);
      console.log(`    Location: ${resultado.location || 'Nenhum'}`);
      
      if (resultado.status === 200) {
        console.log(`    ✅ FUNCIONANDO!`);
        return { aplicacao, redirect_uri, url, funcionando: true };
      } else if (resultado.status === 302 && resultado.location && !resultado.location.includes('error=')) {
        console.log(`    ✅ REDIRECIONAMENTO VÁLIDO!`);
        return { aplicacao, redirect_uri, url, funcionando: true };
      } else {
        console.log(`    ❌ FALHOU`);
      }
    } catch (error) {
      console.log(`    ❌ ERRO: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return { aplicacao, funcionando: false };
}

function testarURL(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'auth.contaazul.com',
      port: 443,
      path: url.replace('https://auth.contaazul.com', ''),
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          location: res.headers.location,
          erro: data.includes('error=') ? 'redirect_mismatch' : null
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

async function investigarProblema() {
  console.log('🔍 INICIANDO INVESTIGAÇÃO COMPLETA...\n');
  
  const resultados = [];
  
  for (const aplicacao of aplicacoes) {
    const resultado = await testarAplicacao(aplicacao);
    resultados.push(resultado);
  }
  
  console.log('\n📋 RESUMO DA INVESTIGAÇÃO:');
  console.log('='.repeat(50));
  
  const funcionando = resultados.filter(r => r.funcionando);
  
  if (funcionando.length > 0) {
    console.log('✅ APLICAÇÕES FUNCIONANDO:');
    funcionando.forEach(r => {
      console.log(`  - ${r.aplicacao.nome}: ${r.redirect_uri}`);
      console.log(`    URL: ${r.url}`);
    });
  } else {
    console.log('❌ NENHUMA APLICAÇÃO FUNCIONANDO!');
    console.log('\n🎯 POSSÍVEIS CAUSAS:');
    console.log('1. Todas as aplicações estão desativadas');
    console.log('2. Problema de rede/firewall');
    console.log('3. Servidor Conta Azul com problema');
    console.log('4. Credenciais incorretas');
    console.log('5. URLs de redirecionamento não configuradas');
  }
  
  console.log('\n🛠️ PRÓXIMOS PASSOS:');
  if (funcionando.length > 0) {
    console.log('1. Use uma das URLs funcionando');
    console.log('2. Configure o servidor para a URL correta');
  } else {
    console.log('1. Verificar se as aplicações estão ativas no painel');
    console.log('2. Configurar URLs de redirecionamento no painel');
    console.log('3. Verificar conectividade de rede');
    console.log('4. Tentar com aplicação diferente');
  }
}

investigarProblema().catch(console.error);
