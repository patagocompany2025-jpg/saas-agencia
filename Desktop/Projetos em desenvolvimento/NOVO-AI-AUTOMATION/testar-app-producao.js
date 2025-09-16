const crypto = require('crypto');

console.log('🎯 TESTANDO APLICAÇÃO DE PRODUÇÃO\n');

// Aplicação de produção (que você mencionou antes)
const CLIENT_ID_PROD = '5jn2mdbh7v0n4er527men441ar';
const CLIENT_SECRET_PROD = 'qn6d2bkpviitlq43p3g7lkivd2cpm69emv2kmhtmtot6bsbnvkh';

// URLs que você disse que estavam configuradas
const redirectURIs = [
  'https://lojanovoisrael.com.br/oauth/callback',
  'https://24a9c751850a.ngrok-free.app/oauth/callback'
];

console.log('📋 CONFIGURAÇÃO PRODUÇÃO:');
console.log(`CLIENT_ID: ${CLIENT_ID_PROD}`);
console.log(`CLIENT_SECRET: ${CLIENT_SECRET_PROD}\n`);

// Gerar state
const state = crypto.randomBytes(16).toString('hex');

redirectURIs.forEach((redirectURI, index) => {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID_PROD,
    redirect_uri: redirectURI,
    state: state,
    scope: 'openid profile aws.cognito.signin.user.admin'
  });

  const oauthURL = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
  
  console.log(`🔗 URL ${index + 1} (${redirectURI}):`);
  console.log(oauthURL);
  console.log('');
});

console.log('📝 INSTRUÇÕES:');
console.log('1. Teste as URLs acima');
console.log('2. Se funcionar, use esta aplicação temporariamente');
console.log('3. Ou configure a aplicação de desenvolvimento no painel');
