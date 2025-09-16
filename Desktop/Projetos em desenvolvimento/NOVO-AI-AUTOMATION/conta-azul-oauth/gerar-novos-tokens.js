// gerar-novos-tokens.js - Gerador automático de novos tokens
const fetch = require('node-fetch');
const fs = require('fs');

// Configurações que funcionaram antes
const CONFIG = {
  CLIENT_ID: '7f178p84rfk7phnkq2bbthk3m1',
  CLIENT_SECRET: '5cf9ij4hk7sgnuubmd8d6uo2isb5jb3mi90t7v00g8npfnq72fp',
  REDIRECT_URI: 'https://novoisrael2025-fresh.loca.lt/auth/conta-azul/callback',
  SCOPES: 'openid profile aws.cognito.signin.user.admin',
  AUTH_URL: 'https://auth.contaazul.com/mfa',
  TOKEN_URL: 'https://auth.contaazul.com/oauth2/token'
};

async function gerarNovosTokens() {
  console.log('🔄 GERANDO NOVOS TOKENS PARA CONTA AZUL');
  console.log('=' .repeat(50));
  
  // 1. Gerar URL de autorização
  const state = Math.random().toString(36).slice(2);
  const params = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    scope: CONFIG.SCOPES,
    state: state,
    response_type: 'code'
  });
  
  const authUrl = `${CONFIG.AUTH_URL}?${params.toString()}`;
  
  console.log('\n🔗 URL DE AUTORIZAÇÃO GERADA:');
  console.log(authUrl);
  console.log('\n📋 INSTRUÇÕES:');
  console.log('1. Copie a URL acima e cole no navegador');
  console.log('2. Faça login na Conta Azul');
  console.log('3. Autorize o acesso');
  console.log('4. Copie o código de autorização da URL de retorno');
  console.log('5. Cole o código aqui quando solicitado');
  
  // Simular entrada do usuário (você pode modificar para entrada real)
  console.log('\n⏳ Aguardando código de autorização...');
  console.log('💡 Para automatizar, você pode:');
  console.log('   - Usar o servidor automático: node servidor-automatico.js');
  console.log('   - Acessar: http://localhost:5053/auth/start');
  console.log('   - Ou fazer manualmente no painel da Conta Azul');
  
  return authUrl;
}

// Função para trocar código por tokens
async function trocarCodigoPorTokens(code) {
  console.log('\n🔄 TROCANDO CÓDIGO POR TOKENS...');
  
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: CONFIG.CLIENT_ID,
      client_secret: CONFIG.CLIENT_SECRET,
      redirect_uri: CONFIG.REDIRECT_URI
    });

    const response = await fetch(CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Erro na troca de tokens:', response.status, errorText);
      return null;
    }

    const tokens = await response.json();
    console.log('✅ Tokens recebidos com sucesso!');
    
    // Salvar tokens
    const tokensToSave = {
      ...tokens,
      saved_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
    };
    
    fs.writeFileSync('./tokens.json', JSON.stringify(tokensToSave, null, 2));
    console.log('💾 Tokens salvos em tokens.json');
    
    return tokens;
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    return null;
  }
}

// Função para testar tokens
async function testarTokens() {
  console.log('\n🧪 TESTANDO NOVOS TOKENS...');
  
  try {
    const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
    
    const response = await fetch('https://api.contaazul.com/v1/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Tokens funcionando perfeitamente!');
      console.log('📋 Dados recebidos:', JSON.stringify(data, null, 2));
      return true;
    } else {
      console.log('❌ Tokens ainda não funcionam:', response.status);
      return false;
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
    return false;
  }
}

// Executar
if (require.main === module) {
  gerarNovosTokens().catch(console.error);
}

module.exports = { gerarNovosTokens, trocarCodigoPorTokens, testarTokens };
