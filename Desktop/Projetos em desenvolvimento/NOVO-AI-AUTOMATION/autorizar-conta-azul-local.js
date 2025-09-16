require("dotenv").config();
const fetch = require('node-fetch');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 AUTORIZAÇÃO CONTA AZUL - SERVIDOR LOCAL');
console.log('==========================================');

console.log('\n📋 INSTRUÇÕES:');
console.log('1. O servidor local está rodando em http://localhost:5000');
console.log('2. Abra esta URL no navegador:');
console.log('   http://localhost:5000/auth/start');
console.log('3. Faça login na Conta Azul');
console.log('4. Autorize a aplicação');
console.log('5. Você será redirecionado para localhost:5000');
console.log('6. Na URL de redirecionamento, procure por: ?code=XXXXX');
console.log('7. Copie APENAS o código (parte após code=)\n');

rl.question('🔑 Cole o código aqui: ', async (code) => {
  if (!code || code.trim() === '') {
    console.log('❌ Código não fornecido');
    rl.close();
    return;
  }

  try {
    console.log('\n🔄 Trocando código por tokens...');
    
    const tokenResponse = await fetch('http://localhost:5000/oauth/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: code.trim() })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Erro HTTP ${tokenResponse.status}: ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    
    console.log('\n🎉 SUCESSO! TOKENS OBTIDOS!');
    console.log('   Access Token:', tokens.access_token ? tokens.access_token.substring(0, 50) + '...' : 'N/A');
    console.log('   Refresh Token:', tokens.refresh_token ? tokens.refresh_token.substring(0, 50) + '...' : 'N/A');
    console.log('   Expires in:', tokens.expires_in, 'segundos');
    console.log('   Token Type:', tokens.token_type);
    
    console.log('\n🎯 Agora você pode conectar o Mega Vendedor AI com o Conta Azul!');
    
  } catch (error) {
    console.error('\n❌ Erro ao obter tokens:', error.message);
    console.error('🔧 Verifique se o servidor está rodando e tente novamente.');
  } finally {
    rl.close();
  }
});
