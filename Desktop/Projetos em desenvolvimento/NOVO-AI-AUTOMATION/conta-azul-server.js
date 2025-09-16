require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5050;
const TOKENS_FILE = './tokens.json';

// Configurações hardcoded para garantir funcionamento
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
    if (fs.existsSync(TOKENS_FILE)) {
      return JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
    }
  } catch (error) {
    console.log('Erro ao carregar tokens:', error.message);
  }
  return null;
}

// Função para salvar tokens
function saveTokens(tokens) {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(tokens, null, 2));
    console.log('✅ Tokens salvos com sucesso!');
  } catch (error) {
    console.log('❌ Erro ao salvar tokens:', error.message);
  }
}

// Função para renovar tokens
async function refreshTokens() {
  const tokens = loadTokens();
  if (!tokens || !tokens.refresh_token) {
    console.log('❌ Nenhum refresh token disponível');
    return false;
  }

  try {
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

    if (response.ok) {
      const newTokens = await response.json();
      saveTokens(newTokens);
      console.log('✅ Tokens renovados com sucesso!');
      return true;
    } else {
      console.log('❌ Erro ao renovar tokens:', response.status, await response.text());
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na renovação:', error.message);
    return false;
  }
}

// Função para fazer chamada à API com renovação automática
async function apiCall(endpoint, options = {}) {
  let tokens = loadTokens();
  
  if (!tokens || !tokens.access_token) {
    console.log('❌ Nenhum token disponível');
    return null;
  }

  // Primeira tentativa
  let response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  // Se token expirado, tentar renovar
  if (response.status === 401) {
    console.log('🔄 Token expirado, renovando...');
    const renewed = await refreshTokens();
    
    if (renewed) {
      tokens = loadTokens();
      response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }
  }

  return response;
}

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota principal
app.get('/', (req, res) => {
  const tokens = loadTokens();
  res.json({
    status: 'Conta Azul OAuth Server',
    version: '1.0.0',
    hasTokens: !!tokens,
    endpoints: {
      auth: '/auth/start',
      callback: '/callback',
      contacts: '/api/contacts',
      refresh: '/refresh',
      status: '/status'
    }
  });
});

// Status do servidor
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

// Iniciar OAuth
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

// Callback OAuth
app.get('/callback', async (req, res) => {
  console.log('📞 Callback recebido:', req.query);
  
  const { code, state: receivedState, error } = req.query;
  
  if (error) {
    return res.status(400).send(`Erro na autorização: ${error}`);
  }
  
  if (!code) {
    return res.status(400).send('Código de autorização não recebido');
  }
  
  if (receivedState !== state) {
    return res.status(400).send('State inválido');
  }

  try {
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

    if (response.ok) {
      const tokens = await response.json();
      saveTokens(tokens);
      
      res.send(`
        <h2>✅ Autorização Concluída!</h2>
        <p>Tokens salvos com sucesso!</p>
        <p><a href="/status">Ver Status</a> | <a href="/api/contacts">Testar API</a></p>
        <pre>${JSON.stringify(tokens, null, 2)}</pre>
      `);
    } else {
      const error = await response.text();
      res.status(response.status).send(`Erro ao obter tokens: ${error}`);
    }
  } catch (error) {
    res.status(500).send(`Erro no callback: ${error.message}`);
  }
});

// Renovar tokens manualmente
app.get('/refresh', async (req, res) => {
  const success = await refreshTokens();
  res.json({
    success,
    message: success ? 'Tokens renovados com sucesso' : 'Falha ao renovar tokens'
  });
});

// API - Listar contatos
app.get('/api/contacts', async (req, res) => {
  try {
    const response = await apiCall('/v1/contacts?limit=10');
    
    if (!response) {
      return res.status(500).json({ error: 'Nenhum token disponível' });
    }
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        count: data.length || 0,
        contacts: data.slice(0, 5) // Primeiros 5 contatos
      });
    } else {
      const error = await response.text();
      res.status(response.status).json({ error: `API Error: ${error}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API - Informações da empresa
app.get('/api/company', async (req, res) => {
  try {
    const response = await apiCall('/v1/company');
    
    if (!response) {
      return res.status(500).json({ error: 'Nenhum token disponível' });
    }
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        company: data
      });
    } else {
      const error = await response.text();
      res.status(response.status).json({ error: `API Error: ${error}` });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor Conta Azul OAuth iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('🔗 Endpoints disponíveis:');
  console.log(`   - Status: http://localhost:${PORT}/status`);
  console.log(`   - Auth: http://localhost:${PORT}/auth/start`);
  console.log(`   - Contacts: http://localhost:${PORT}/api/contacts`);
  console.log(`   - Company: http://localhost:${PORT}/api/company`);
  console.log(`   - Refresh: http://localhost:${PORT}/refresh`);
  
  // Verificar tokens existentes
  const tokens = loadTokens();
  if (tokens) {
    console.log('✅ Tokens encontrados! Sistema pronto para uso.');
  } else {
    console.log('⚠️  Nenhum token encontrado. Execute /auth/start para autorizar.');
  }
});
