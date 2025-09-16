require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const BASE = 'https://api.contaazul.com';
const TOKENS_FILE = './tokens.json';

async function testAPI() {
  console.log('🔍 Testando conectividade com API do Conta Azul...\n');

  // 1. Verificar se tokens existem
  console.log('1️⃣ Verificando tokens...');
  if (fs.existsSync(TOKENS_FILE)) {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    console.log('✅ Arquivo tokens.json encontrado');
    console.log(`📅 Salvo em: ${tokens.saved_at}`);
    console.log(`🔑 Access Token: ${tokens.access_token ? 'Presente' : 'Ausente'}`);
    console.log(`🔄 Refresh Token: ${tokens.refresh_token ? 'Presente' : 'Ausente'}\n`);

    // 2. Testar API com access token
    console.log('2️⃣ Testando API com access token...');
    try {
      const response = await fetch(`${BASE}/v1/contacts?page=1&size=5`, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funcionando!');
        console.log(`📊 Total de contatos: ${data.total || 'N/A'}`);
        console.log(`📋 Contatos retornados: ${data.data ? data.data.length : 0}`);
        
        if (data.data && data.data.length > 0) {
          console.log('\n📝 Primeiros contatos:');
          data.data.slice(0, 3).forEach((contact, index) => {
            console.log(`   ${index + 1}. ${contact.name || 'Sem nome'} (ID: ${contact.id})`);
          });
        }
      } else {
        console.log(`❌ Erro na API: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`📄 Detalhes: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Erro de conexão: ${error.message}`);
    }
  } else {
    console.log('❌ Arquivo tokens.json não encontrado');
    console.log('💡 Execute o fluxo OAuth primeiro: http://localhost:5050/auth/start\n');
  }

  // 3. Testar conectividade básica
  console.log('3️⃣ Testando conectividade básica...');
  try {
    const response = await fetch(`${BASE}/health`, {
      method: 'GET',
      timeout: 5000
    });
    console.log(`✅ Servidor Conta Azul acessível: ${response.status}`);
  } catch (error) {
    console.log(`❌ Erro de conectividade: ${error.message}`);
  }

  // 4. Verificar configurações
  console.log('\n4️⃣ Verificando configurações...');
  console.log(`🔧 Client ID: ${process.env.CONTA_AZUL_CLIENT_ID ? 'Configurado' : 'Ausente'}`);
  console.log(`🔧 Client Secret: ${process.env.CONTA_AZUL_CLIENT_SECRET ? 'Configurado' : 'Ausente'}`);
  console.log(`🔧 Redirect URI: ${process.env.CONTA_AZUL_REDIRECT_URI || 'Ausente'}`);
  console.log(`🔧 Scopes: ${process.env.CONTA_AZUL_SCOPES || 'Ausente'}`);
  console.log(`🔧 Port: ${process.env.PORT || 'Ausente'}`);

  console.log('\n🎯 Resumo:');
  if (fs.existsSync(TOKENS_FILE)) {
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
}

testAPI().catch(console.error);
