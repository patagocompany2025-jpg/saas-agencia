const crypto = require('crypto');

console.log('🎯 GERANDO URL OAUTH OFICIAL - CONTA AZUL\n');

// Configurações
const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';
const REDIRECT_URI = 'http://localhost:3001/oauth/callback';
const SCOPE = 'openid profile aws.cognito.signin.user.admin';

// Gerar state aleatório (OBRIGATÓRIO)
const state = crypto.randomBytes(16).toString('hex');

console.log('📋 CONFIGURAÇÃO:');
console.log(`CLIENT_ID: ${CLIENT_ID}`);
console.log(`REDIRECT_URI: ${REDIRECT_URI}`);
console.log(`SCOPE: ${SCOPE}`);
console.log(`STATE: ${state}\n`);

// URL base
const baseURL = 'https://auth.contaazul.com/oauth2/authorize';

// Parâmetros obrigatórios
const params = new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  state: state,
  scope: SCOPE
});

// URL final
const oauthURL = `${baseURL}?${params.toString()}`;

console.log('🔗 URL OAUTH OFICIAL:');
console.log(oauthURL);
console.log('\n📝 INSTRUÇÕES:');
console.log('1. Copie a URL acima');
console.log('2. Cole no navegador');
console.log('3. Faça login no Conta Azul');
console.log('4. Autorize a aplicação');
console.log('5. Copie o código da URL de redirecionamento');
console.log('\n⚠️ IMPORTANTE:');
console.log('- O parâmetro STATE é obrigatório para segurança');
console.log('- A URL deve ser acessada EXATAMENTE como mostrada');
console.log('- Não modifique nenhum parâmetro');

