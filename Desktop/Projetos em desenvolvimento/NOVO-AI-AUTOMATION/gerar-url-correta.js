const crypto = require('crypto');

console.log('🎯 GERANDO URL OAUTH CORRETA - APLICAÇÃO DE PRODUÇÃO\n');

// Aplicação de produção
const CLIENT_ID = '5jn2mdbh7v0n4er527men441ar';
const CLIENT_SECRET = 'qn6d2bkpviitlq43p3g7lkivd2cpm69emv2kmhtmtot6bsbnvkh';

// URL de redirecionamento (primeira opção)
const REDIRECT_URI = 'https://lojanovoisrael.com.br/oauth/callback';

// Gerar state aleatório
const state = crypto.randomBytes(16).toString('hex');

console.log('📋 CONFIGURAÇÃO:');
console.log(`CLIENT_ID: ${CLIENT_ID}`);
console.log(`CLIENT_SECRET: ${CLIENT_SECRET}`);
console.log(`REDIRECT_URI: ${REDIRECT_URI}`);
console.log(`STATE: ${state}\n`);

// URL base do OAuth
const baseURL = 'https://auth.contaazul.com/oauth2/authorize';

// Parâmetros obrigatórios
const params = new URLSearchParams({
  response_type: 'code',
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  state: state,
  scope: 'openid profile aws.cognito.signin.user.admin'
});

// URL final
const oauthURL = `${baseURL}?${params.toString()}`;

console.log('🔗 URL OAUTH CORRETA:');
console.log(oauthURL);
console.log('\n📝 INSTRUÇÕES:');
console.log('1. Copie a URL acima COMPLETA');
console.log('2. Cole no navegador');
console.log('3. Faça login no Conta Azul');
console.log('4. Autorize a aplicação');
console.log('5. Copie o código da URL de redirecionamento');
console.log('\n⚠️ IMPORTANTE:');
console.log('- A URL deve começar com: https://auth.contaazul.com/oauth2/authorize?');
console.log('- Deve conter todos os parâmetros: response_type, client_id, redirect_uri, state, scope');
console.log('- NÃO deve ter dois pontos (:) no meio da URL');
