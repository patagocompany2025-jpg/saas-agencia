// servidor-funcionando.js - Usando a configuração que funcionou antes
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();

// CONFIGURAÇÃO QUE FUNCIONOU ANTES (baseada no que o usuário disse que funcionou)
const CONFIG = {
  CLIENT_ID: '7f178p84rfk7phnkq2bbthk3m1',
  CLIENT_SECRET: '5cf9ij4hk7sgnuubmd8d6uo2isb5jb3mi90t7v00g8npfnq72fp',
  REDIRECT_URI: 'https://novoisrael2025-fresh.loca.lt/auth/conta-azul/callback',
  SCOPES: 'openid profile aws.cognito.signin.user.admin',
  AUTH_URL: 'https://auth.contaazul.com/mfa',
  TOKEN_URL: 'https://auth.contaazul.com/oauth2/token',
  API_BASE: 'https://api.contaazul.com'
};

let state = Math.random().toString(36).slice(2);

// Função para carregar tokens
function loadTokens() {
  try {
    if (fs.existsSync('./tokens.json')) {
      const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
      console.log('✅ Tokens carregados:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiresIn: tokens.expires_in
      });
      return tokens;
    }
  } catch (error) {
    console.log('⚠️ Erro ao carregar tokens:', error.message);
  }
  return null;
}

// Função para salvar tokens
function saveTokens(tokens) {
  try {
    const tokensToSave = {
      ...tokens,
      saved_at: new Date().toISOString()
    };
    fs.writeFileSync('./tokens.json', JSON.stringify(tokensToSave, null, 2));
    console.log('💾 Tokens salvos com sucesso!');
    return true;
  } catch (error) {
    console.log('❌ Erro ao salvar tokens:', error.message);
    return false;
  }
}

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Endpoint de status
app.get('/status', (req, res) => {
  const tokens = loadTokens();
  res.json({
    server: 'running',
    tokens: {
      exists: !!tokens,
      hasAccessToken: !!(tokens && tokens.access_token),
      hasRefreshToken: !!(tokens && tokens.refresh_token),
      tokenType: tokens?.token_type || null,
      expiresIn: tokens?.expires_in || null
    },
    config: {
      clientId: CONFIG.CLIENT_ID,
      redirectUri: CONFIG.REDIRECT_URI,
      scopes: CONFIG.SCOPES
    }
  });
});

// Endpoint de autorização
app.get('/auth/start', (req, res) => {
  const params = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    scope: CONFIG.SCOPES,
    state,
    response_type: 'code'
  });

  const authUrl = `${CONFIG.AUTH_URL}?${params.toString()}`;
  console.log('🔗 Redirecionando para:', authUrl);
  
  res.redirect(authUrl);
});

// Endpoint de callback
app.get('/callback', async (req, res) => {
  console.log('📞 Callback recebido:', req.query);
  
  const { code, state: receivedState } = req.query;
  
  if (!code) {
    return res.status(400).send('❌ Código de autorização não encontrado');
  }
  
  if (receivedState !== state) {
    return res.status(400).send('❌ State inválido');
  }

  try {
    console.log('🔄 Trocando código por tokens...');
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code.toString(),
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
      return res.status(response.status).send(`❌ Erro: ${errorText}`);
    }

    const tokens = await response.json();
    console.log('✅ Tokens recebidos:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    });

    // Salvar tokens
    if (saveTokens(tokens)) {
      res.send(`
        <h2>✅ Tokens salvos com sucesso!</h2>
        <p>Access Token: ${tokens.access_token ? '✅ Presente' : '❌ Ausente'}</p>
        <p>Refresh Token: ${tokens.refresh_token ? '✅ Presente' : '❌ Ausente'}</p>
        <p>Expires In: ${tokens.expires_in} segundos</p>
        <hr>
        <p><a href="/status">Ver Status</a> | <a href="/test-api">Testar API</a></p>
      `);
    } else {
      res.status(500).send('❌ Erro ao salvar tokens');
    }

  } catch (error) {
    console.log('❌ Erro no callback:', error.message);
    res.status(500).send(`❌ Erro: ${error.message}`);
  }
});

// Endpoint para testar API
app.get('/test-api', async (req, res) => {
  const tokens = loadTokens();
  
  if (!tokens || !tokens.access_token) {
    return res.status(400).json({
      success: false,
      error: 'Nenhum token disponível'
    });
  }

  try {
    console.log('🧪 Testando API da Conta Azul...');
    
    const response = await fetch(`${CONFIG.API_BASE}/v1/contacts?limit=1`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando!');
      res.json({
        success: true,
        message: 'API funcionando corretamente',
        data: data
      });
    } else {
      const errorText = await response.text();
      console.log('❌ Erro na API:', response.status, errorText);
      res.status(response.status).json({
        success: false,
        error: `Erro na API: ${response.status} ${errorText}`
      });
    }

  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Iniciar servidor
const PORT = 5052;
app.listen(PORT, () => {
  console.log('🚀 Servidor funcionando iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('🔗 Endpoints:');
  console.log(`   - Status: http://localhost:${PORT}/status`);
  console.log(`   - Auth: http://localhost:${PORT}/auth/start`);
  console.log(`   - Test API: http://localhost:${PORT}/test-api`);
  
  const tokens = loadTokens();
  if (tokens && tokens.access_token) {
    console.log('✅ Tokens já disponíveis!');
  } else {
    console.log('⚠️ Execute /auth/start para gerar tokens');
  }
});
