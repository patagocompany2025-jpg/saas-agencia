require('dotenv').config({ path: './env.dev' });

console.log('🎯 SOLUÇÃO FINAL OAUTH - CONTA AZUL');
console.log('===================================');
console.log('');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const SCOPES = process.env.SCOPES;

console.log('📋 CONFIGURAÇÃO ATUAL:');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? '***' + CLIENT_SECRET.slice(-4) : 'undefined');
console.log('REDIRECT_URI:', REDIRECT_URI);
console.log('SCOPES:', SCOPES);
console.log('');

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
  console.log('❌ ERRO: Configuração incompleta!');
  process.exit(1);
}

// Gerar URLs de teste
const state = Math.random().toString(36).slice(2);

console.log('🌐 URLS DE TESTE:');
console.log('');

// URL 1: Configuração atual
const url1 = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;
console.log('1️⃣ CONFIGURAÇÃO ATUAL:');
console.log(url1);
console.log('');

// URL 2: Sem redirect_uri
const url2 = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;
console.log('2️⃣ SEM REDIRECT_URI:');
console.log(url2);
console.log('');

// URL 3: Escopo simples
const url3 = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=openid&state=${state}`;
console.log('3️⃣ ESCOPO SIMPLES:');
console.log(url3);
console.log('');

// URL 4: Com localhost
const localhostUri = 'http://localhost:5000/oauth/callback';
const url4 = `https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(localhostUri)}&scope=${encodeURIComponent(SCOPES)}&state=${state}`;
console.log('4️⃣ COM LOCALHOST:');
console.log(url4);
console.log('');

console.log('📋 INSTRUÇÕES:');
console.log('1. Teste cada URL acima no navegador');
console.log('2. Use a que funcionar sem erro');
console.log('3. Copie o código da URL de redirecionamento');
console.log('');

console.log('🔄 DEPOIS DE OBTER O CÓDIGO:');
console.log('Execute: node exchange-tokens.js');
console.log('');

console.log('⚠️ POSSÍVEIS PROBLEMAS:');
console.log('- Se todas derem erro, o client_id pode estar incorreto');
console.log('- Se der "redirect_mismatch", a URL não está registrada no Conta Azul');
console.log('- Se der "invalid_request", há problema com os parâmetros');
console.log('');

console.log('💡 SOLUÇÃO ALTERNATIVA:');
console.log('Se nada funcionar, use o script resolver-tokens-conta-azul.js');
console.log('que tem as configurações hardcoded que funcionam');
