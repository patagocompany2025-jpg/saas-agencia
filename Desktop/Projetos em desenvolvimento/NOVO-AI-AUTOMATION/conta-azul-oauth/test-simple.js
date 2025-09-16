require('dotenv').config();
const fs = require('fs');

console.log('🔍 Verificando configuração do Conta Azul...\n');

// 1. Verificar se tokens existem
console.log('1️⃣ Verificando tokens...');
if (fs.existsSync('./tokens.json')) {
  const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
  console.log('✅ Arquivo tokens.json encontrado');
  console.log(`📅 Salvo em: ${tokens.saved_at}`);
  console.log(`🔑 Access Token: ${tokens.access_token ? 'Presente' : 'Ausente'}`);
  console.log(`🔄 Refresh Token: ${tokens.refresh_token ? 'Presente' : 'Ausente'}\n`);
} else {
  console.log('❌ Arquivo tokens.json não encontrado');
  console.log('💡 Execute o fluxo OAuth primeiro\n');
}

// 2. Verificar configurações
console.log('2️⃣ Verificando configurações...');
console.log(`🔧 Client ID: ${process.env.CONTA_AZUL_CLIENT_ID ? 'Configurado' : 'Ausente'}`);
console.log(`🔧 Client Secret: ${process.env.CONTA_AZUL_CLIENT_SECRET ? 'Configurado' : 'Ausente'}`);
console.log(`🔧 Redirect URI: ${process.env.CONTA_AZUL_REDIRECT_URI || 'Ausente'}`);
console.log(`🔧 Scopes: ${process.env.CONTA_AZUL_SCOPES || 'Ausente'}`);
console.log(`🔧 Port: ${process.env.PORT || 'Ausente'}\n`);

// 3. Verificar se servidor está rodando
console.log('3️⃣ Verificando servidor...');
try {
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: process.env.PORT || 5050,
    path: '/health',
    method: 'GET',
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Servidor rodando na porta ${process.env.PORT || 5050}`);
    console.log(`📊 Status: ${res.statusCode}`);
  });

  req.on('error', (err) => {
    console.log(`❌ Servidor não está rodando: ${err.message}`);
    console.log('💡 Execute: node server.js');
  });

  req.on('timeout', () => {
    console.log('❌ Timeout - servidor não respondeu');
    req.destroy();
  });

  req.end();
} catch (error) {
  console.log(`❌ Erro ao verificar servidor: ${error.message}`);
}

console.log('\n🎯 Resumo:');
if (fs.existsSync('./tokens.json')) {
  console.log('✅ OAuth configurado e tokens disponíveis');
  console.log('✅ Pronto para usar a API do Conta Azul');
} else {
  console.log('⚠️  OAuth não completado');
  console.log('📋 Próximos passos:');
  console.log('   1. Execute: node server.js');
  console.log('   2. Acesse: http://localhost:5050/auth/start');
  console.log('   3. Faça login e autorize a aplicação');
  console.log('   4. Execute este teste novamente');
}
