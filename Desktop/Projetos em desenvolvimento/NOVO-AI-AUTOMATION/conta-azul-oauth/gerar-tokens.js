// gerar-tokens.js - Servidor simplificado para gerar tokens válidos
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = 5051;

// Configuração hardcoded para garantir funcionamento
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

// Endpoint de status
app.get('/status', (req, res) => {
  const tokensExist = fs.existsSync('./tokens.json');
  let tokens = null;
  
  if (tokensExist) {
    try {
      tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
    } catch (error) {
      console.log('Erro ao ler tokens:', error.message);
    }
  }

  res.json({
    tokens_exist: tokensExist,
    access_token_available: tokens ? !!tokens.access_token : false,
    refresh_token_available: tokens ? !!tokens.refresh_token : false,
    config: {
      client_id: CONFIG.CLIENT_ID,
      redirect_uri: CONFIG.REDIRECT_URI,
      auth_url: CONFIG.AUTH_URL
    }
  });
});

// Endpoint de autorização
app.get('/auth/start', (req, res) => {
  const params = new URLSearchParams({
    client_id: CONFIG.CLIENT_ID,
    redirect_uri: CONFIG.REDIRECT_URI,
    scope: CONFIG.SCOPES,
    state: state,
    response_type: 'code'
  });

  const authUrl = `${CONFIG.AUTH_URL}?${params.toString()}`;
  console.log('🔗 Redirecionando para:', authUrl);
  
  res.redirect(authUrl);
});

// Endpoint de callback
app.get('/callback', async (req, res) => {
  console.log('📥 Callback recebido:', req.query);
  
  const { code, state: receivedState } = req.query;
  
  if (!code) {
    return res.status(400).send('❌ Código de autorização não recebido');
  }
  
  if (receivedState !== state) {
    return res.status(400).send('❌ State inválido');
  }

  try {
    // Trocar código por tokens
    const tokenResponse = await fetch(CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code.toString(),
        client_id: CONFIG.CLIENT_ID,
        client_secret: CONFIG.CLIENT_SECRET,
        redirect_uri: CONFIG.REDIRECT_URI
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('❌ Erro ao trocar código por token:', errorText);
      return res.status(400).send(`❌ Erro: ${errorText}`);
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Tokens recebidos:', Object.keys(tokens));

    // Salvar tokens
    fs.writeFileSync('./tokens.json', JSON.stringify(tokens, null, 2));
    console.log('💾 Tokens salvos em tokens.json');

    res.send(`
      <h2>✅ Tokens gerados com sucesso!</h2>
      <p>Os tokens foram salvos e estão prontos para uso.</p>
      <h3>Próximos passos:</h3>
      <ol>
        <li>Copie o arquivo tokens.json para o diretório do Mega Vendedor</li>
        <li>Reinicie o servidor do Mega Vendedor</li>
        <li>Teste a conexão</li>
      </ol>
      <p><a href="/status">Verificar status</a></p>
    `);

  } catch (error) {
    console.log('❌ Erro no callback:', error.message);
    res.status(500).send(`❌ Erro: ${error.message}`);
  }
});

// Endpoint para renovar tokens
app.get('/refresh', async (req, res) => {
  try {
    if (!fs.existsSync('./tokens.json')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Tokens não encontrados' 
      });
    }

    const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
    
    if (!tokens.refresh_token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refresh token não encontrado' 
      });
    }

    console.log('🔄 Renovando tokens...');

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: CONFIG.CLIENT_ID,
      client_secret: CONFIG.CLIENT_SECRET
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
      console.log('❌ Erro na renovação:', response.status, errorText);
      return res.status(response.status).json({ 
        success: false, 
        error: `Erro na renovação: ${response.status} ${errorText}` 
      });
    }

    const newTokens = await response.json();
    console.log('✅ Tokens renovados com sucesso!');

    // Salvar novos tokens
    const tokensToSave = {
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token || tokens.refresh_token,
      id_token: newTokens.id_token || tokens.id_token,
      expires_in: newTokens.expires_in || 3600,
      token_type: newTokens.token_type || 'Bearer',
      saved_at: new Date().toISOString()
    };

    fs.writeFileSync('./tokens.json', JSON.stringify(tokensToSave, null, 2));
    console.log('💾 Novos tokens salvos!');

    res.json({ 
      success: true, 
      message: 'Tokens renovados com sucesso!',
      expires_in: newTokens.expires_in || 3600
    });

  } catch (error) {
    console.log('❌ Erro na renovação:', error.message);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Endpoint para testar API
app.get('/test-api', async (req, res) => {
  try {
    if (!fs.existsSync('./tokens.json')) {
      return res.status(400).json({ error: 'Tokens não encontrados' });
    }

    const tokens = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
    
    if (!tokens.access_token) {
      return res.status(400).json({ error: 'Access token não encontrado' });
    }

    // Testar API de contatos
    const apiResponse = await fetch(`${CONFIG.API_BASE}/v1/contacts?limit=5`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({ 
        error: `API retornou ${apiResponse.status}: ${apiResponse.statusText}` 
      });
    }

    const data = await apiResponse.json();
    res.json({
      success: true,
      message: 'API funcionando!',
      contacts_count: data.data ? data.data.length : 0,
      sample_contact: data.data && data.data.length > 0 ? data.data[0] : null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de geração de tokens iniciado!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 Endpoints:`);
  console.log(`   - Status: http://localhost:${PORT}/status`);
  console.log(`   - Auth: http://localhost:${PORT}/auth/start`);
  console.log(`   - Test API: http://localhost:${PORT}/test-api`);
  console.log(`⚠️  Execute /auth/start para gerar tokens válidos`);
});
