// gerar-url-oauth.js - Gera URL de autorização OAuth para Conta Azul
const CONFIG = {
  CLIENT_ID: '3p4m8aht6lvqgmsri1p12pko26',
  CLIENT_SECRET: 'jhfqsrgjda8oroiqaccgoqhpu3eopm1pfektjfo1sls8hb51mbs',
  REDIRECT_URI: 'https://novoisrael2025-fresh.loca.lt/auth/conta-azul/callback',
  SCOPES: 'openid profile aws.cognito.signin.user.admin',
  AUTH_URL: 'https://auth.contaazul.com/mfa',
  TOKEN_URL: 'https://auth.contaazul.com/oauth2/token',
  API_BASE: 'https://api.contaazul.com'
};

function gerarUrlAutorizacao() {
  const state = Math.random().toString(36).slice(2);
  
  const params = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    scope: CONFIG.SCOPES,
    state,
    response_type: 'code'
  });

  const authUrl = `${CONFIG.AUTH_URL}?${params.toString()}`;
  
  console.log('🔑 URL DE AUTORIZAÇÃO OAUTH - CONTA AZUL');
  console.log('='.repeat(60));
  console.log('📋 Instruções:');
  console.log('1. Acesse a URL abaixo no seu navegador');
  console.log('2. Faça login com suas credenciais do Conta Azul');
  console.log('3. Autorize o acesso da aplicação');
  console.log('4. Aguarde o redirecionamento automático');
  console.log('');
  console.log('🌐 URL:');
  console.log(authUrl);
  console.log('');
  console.log('⚠️  IMPORTANTE:');
  console.log('- Configure um túnel ngrok para expor o localhost');
  console.log('- Ou atualize o redirect URI no painel do Conta Azul');
  console.log('- O redirect URI atual é:', CONFIG.REDIRECT_URI);
  console.log('');
  console.log('🔄 State gerado:', state);
  console.log('⏰ URL válida por alguns minutos');
  
  return authUrl;
}

// Executar
gerarUrlAutorizacao();
