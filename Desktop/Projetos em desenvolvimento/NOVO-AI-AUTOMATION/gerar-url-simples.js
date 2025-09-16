const CLIENT_ID = '5k3net0533tbg4ng5cl0311r3i';
const REDIRECT_URI = 'https://lojanovoisrael.com.br/oauth/callback';
const SCOPES = 'openid profile aws.cognito.signin.user.admin';

// Gerar URL mais simples
const state = Math.random().toString(36).slice(2);
const authUrl = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;

console.log('🔗 URL DE AUTORIZAÇÃO:');
console.log('====================');
console.log('');
console.log('Copie e cole esta URL no navegador:');
console.log('');
console.log(authUrl);
console.log('');
console.log('📋 INSTRUÇÕES:');
console.log('1. Copie a URL acima');
console.log('2. Cole no navegador (Chrome, Firefox, Edge)');
console.log('3. Faça login na Conta Azul');
console.log('4. Autorize a aplicação');
console.log('5. Você será redirecionado para lojanovoisrael.com.br');
console.log('6. Na URL de redirecionamento, procure por: ?code=XXXXX');
console.log('7. Copie APENAS o código (parte após code=)');
console.log('');
console.log('💡 DICA: Se não funcionar, tente:');
console.log('- Usar outro navegador');
console.log('- Limpar cache do navegador');
console.log('- Desabilitar extensões temporariamente');
console.log('');
console.log('🔑 Depois que conseguir o código, execute:');
console.log('node resolver-tokens-conta-azul.js');
