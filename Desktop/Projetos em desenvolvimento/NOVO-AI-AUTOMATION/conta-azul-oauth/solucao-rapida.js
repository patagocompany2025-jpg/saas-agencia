// solucao-rapida.js - Solução rápida para tokens expirados
const fs = require('fs');
const fetch = require('node-fetch');

async function solucaoRapida() {
  console.log('🚀 SOLUÇÃO RÁPIDA PARA TOKENS EXPIRADOS');
  console.log('=' .repeat(50));
  
  // 1. Verificar se existe backup de tokens
  const backupFiles = [
    './tokens-backup.json',
    '../agentes/dev1_alex/mega_vendedor_ai/tokens.json',
    './tokens.json'
  ];
  
  console.log('\n📁 VERIFICANDO BACKUPS DE TOKENS...');
  
  for (const file of backupFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ Encontrado: ${file}`);
      try {
        const tokens = JSON.parse(fs.readFileSync(file, 'utf8'));
        console.log(`   - Access Token: ${tokens.access_token ? '✅' : '❌'}`);
        console.log(`   - Refresh Token: ${tokens.refresh_token ? '✅' : '❌'}`);
        console.log(`   - Expires In: ${tokens.expires_in || 'N/A'} segundos`);
      } catch (error) {
        console.log(`   - Erro ao ler: ${error.message}`);
      }
    } else {
      console.log(`❌ Não encontrado: ${file}`);
    }
  }
  
  // 2. Tentar usar tokens de backup
  console.log('\n🔄 TENTANDO USAR TOKENS DE BACKUP...');
  
  if (fs.existsSync('./tokens-backup.json')) {
    try {
      const backupTokens = JSON.parse(fs.readFileSync('./tokens-backup.json', 'utf8'));
      
      // Testar se funcionam
      const response = await fetch('https://api.contaazul.com/v1/contacts?limit=1', {
        headers: {
          'Authorization': `Bearer ${backupTokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Tokens de backup funcionam!');
        fs.writeFileSync('./tokens.json', JSON.stringify(backupTokens, null, 2));
        console.log('💾 Tokens de backup copiados para tokens.json');
        return true;
      } else {
        console.log('❌ Tokens de backup também expirados');
      }
    } catch (error) {
      console.log('❌ Erro ao testar backup:', error.message);
    }
  }
  
  // 3. Gerar URL de autorização
  console.log('\n🔗 GERANDO NOVA AUTORIZAÇÃO...');
  
  const CONFIG = {
    CLIENT_ID: '7f178p84rfk7phnkq2bbthk3m1',
    CLIENT_SECRET: '5cf9ij4hk7sgnuubmd8d6uo2isb5jb3mi90t7v00g8npfnq72fp',
    REDIRECT_URI: 'https://novoisrael2025-fresh.loca.lt/auth/conta-azul/callback',
    SCOPES: 'openid profile aws.cognito.signin.user.admin',
    AUTH_URL: 'https://auth.contaazul.com/mfa'
  };
  
  const state = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    scope: CONFIG.SCOPES,
    state: state,
    response_type: 'code'
  });
  
  const authUrl = `${CONFIG.AUTH_URL}?${params.toString()}`;
  
  console.log('\n🎯 SOLUÇÕES DISPONÍVEIS:');
  console.log('1. 🚀 AUTOMÁTICA (Recomendada):');
  console.log('   - Execute: node servidor-automatico.js');
  console.log('   - Acesse: http://localhost:5053/auth/start');
  console.log('   - Faça login e autorize');
  
  console.log('\n2. 🔗 MANUAL:');
  console.log('   - URL:', authUrl);
  console.log('   - Copie e cole no navegador');
  console.log('   - Faça login na Conta Azul');
  console.log('   - Autorize o acesso');
  
  console.log('\n3. 📱 PAINEL DA CONTA AZUL:');
  console.log('   - Acesse: https://app.contaazul.com');
  console.log('   - Vá em Configurações > Integrações');
  console.log('   - Gere novos tokens de API');
  
  return false;
}

// Executar
if (require.main === module) {
  solucaoRapida().catch(console.error);
}

module.exports = { solucaoRapida };
