const fetch = require('node-fetch');

async function diagnosticarOAuth() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO OAUTH CONTA AZUL');
  console.log('===========================================');
  console.log('');

  const CLIENT_ID = '3p4m8aht6lvqgmsri1p12pko26';
  const CLIENT_SECRET = 'jhfqsrgjda8oroiqaccgoqhpu3eopm1pfektjfo1sls8hb51mbs';
  const REDIRECT_URI = 'https://lojanovoisrael.com.br/oauth/callback';

  console.log('📋 CONFIGURAÇÕES ATUAIS:');
  console.log('Client ID:', CLIENT_ID);
  console.log('Client Secret:', CLIENT_SECRET.substring(0, 10) + '...');
  console.log('Redirect URI:', REDIRECT_URI);
  console.log('');

  // Teste 1: Verificar se as credenciais são válidas
  console.log('🧪 TESTE 1: Verificando credenciais...');
  try {
    const testResponse = await fetch('https://auth.contaazul.com/oauth2/token', {
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

  console.log('Status:', testResponse.status);
  if (testResponse.ok) {
    console.log('✅ Credenciais válidas');
  } else {
    const error = await testResponse.text();
    console.log('❌ Erro nas credenciais:', error);
  }
} catch (error) {
  console.log('❌ Erro de conexão:', error.message);
}

console.log('');

// Teste 2: Verificar URL de autorização
console.log('🧪 TESTE 2: Verificando URL de autorização...');
const state = Math.random().toString(36).slice(2);
const authUrl = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid%20profile%20aws.cognito.signin.user.admin&state=${state}`;

console.log('URL gerada:', authUrl);
console.log('');

// Teste 3: Verificar se a aplicação existe
console.log('🧪 TESTE 3: Verificando aplicação...');
try {
  const appResponse = await fetch(`https://api.contaazul.com/v1/applications/${CLIENT_ID}`, {
    headers: {
      'Authorization': `Bearer ${CLIENT_SECRET}`,
      'Content-Type': 'application/json'
    }
  });

  console.log('Status da aplicação:', appResponse.status);
  if (appResponse.ok) {
    const appData = await appResponse.json();
    console.log('✅ Aplicação encontrada');
    console.log('Nome:', appData.name);
    console.log('Redirect URIs:', appData.redirect_uris);
  } else {
    console.log('❌ Aplicação não encontrada ou credenciais inválidas');
  }
} catch (error) {
  console.log('❌ Erro ao verificar aplicação:', error.message);
}

  console.log('');
  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('1. Verifique se a aplicação existe no painel da Conta Azul');
  console.log('2. Confirme se as credenciais estão corretas');
  console.log('3. Verifique se a redirect_uri está registrada');
  console.log('4. Tente criar uma nova aplicação se necessário');
}

// Executar diagnóstico
diagnosticarOAuth().catch(console.error);
