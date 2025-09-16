require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5050;
const TOKENS_FILE = './tokens.json';

// Configurações hardcoded para garantir funcionamento
const CONFIG = {
  CLIENT_ID: '3p4m8aht6lvqgmsri1p12pko26',
  CLIENT_SECRET: 'jhfqsrgjda8oroiqaccgoqhpu3eopm1pfektjfo1sls8hb51mbs',
  REDIRECT_URI: 'https://novoisrael2025-fresh.loca.lt/auth/conta-azul/callback',
  SCOPES: 'openid profile aws.cognito.signin.user.admin',
  AUTH_URL: 'https://auth.contaazul.com/mfa',
  TOKEN_URL: 'https://auth.contaazul.com/oauth2/token',
  API_BASE: 'https://api.contaazul.com'
};

let state = Math.random().toString(36).slice(2);

// Função para carregar tokens com melhor tratamento de erro
function loadTokens() {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      const content = fs.readFileSync(TOKENS_FILE, 'utf8');
      console.log('📄 Carregando tokens do arquivo...');
      console.log('Tamanho do arquivo:', content.length, 'caracteres');
      
      const tokens = JSON.parse(content);
      console.log('✅ Tokens carregados com sucesso!');
      console.log('Access Token presente:', !!tokens.access_token);
      console.log('Refresh Token presente:', !!tokens.refresh_token);
      console.log('Token Type:', tokens.token_type);
      console.log('Expires In:', tokens.expires_in);
      
      return tokens;
    }
  } catch (error) {
    console.log('❌ Erro ao carregar tokens:', error.message);
    console.log('Tentando corrigir arquivo...');
    
    // Tentar corrigir arquivo corrompido
    try {
      const content = fs.readFileSync(TOKENS_FILE, 'utf8');
      console.log('Conteúdo do arquivo:', content.substring(0, 200));
    } catch (readError) {
      console.log('Erro ao ler arquivo:', readError.message);
    }
  }
  return null;
}

// Função para salvar tokens
function saveTokens(tokens) {
  try {
    const jsonContent = JSON.stringify(tokens, null, 2);
    fs.writeFileSync(TOKENS_FILE, jsonContent, 'utf8');
    console.log('✅ Tokens salvos com sucesso!');
    console.log('Tamanho do arquivo salvo:', jsonContent.length, 'caracteres');
    return true;
  } catch (error) {
    console.log('❌ Erro ao salvar tokens:', error.message);
    return false;
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
    console.log('Refresh token:', tokens.refresh_token.substring(0, 50) + '...');
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokens.refresh_token,
      client_id: CONFIG.CLIENT_ID,
      client_secret: CONFIG.CLIENT_SECRET
    });

    console.log('Enviando requisição para:', CONFIG.TOKEN_URL);
    console.log('Body:', body.toString());

    const response = await fetch(CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const newTokens = await response.json();
      console.log('✅ Tokens renovados com sucesso!');
      console.log('Novos tokens recebidos:', Object.keys(newTokens));
      saveTokens(newTokens);
      return true;
    } else {
      const errorText = await response.text();
      console.log('❌ Erro ao renovar tokens:', response.status, errorText);
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

  console.log('🔗 Fazendo chamada para API:', endpoint);
  console.log('Access token:', tokens.access_token.substring(0, 50) + '...');

  // Primeira tentativa
  let response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  console.log('Status da resposta:', response.status);

  // Se token expirado, tentar renovar
  if (response.status === 401) {
    console.log('🔄 Token expirado, renovando...');
    const renewed = await refreshTokens();
    
    if (renewed) {
      tokens = loadTokens();
      console.log('🔄 Tentando novamente com token renovado...');
      response = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      console.log('Status da segunda tentativa:', response.status);
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
    status: 'Conta Azul OAuth Server - FIXED',
    version: '2.0.0',
    hasTokens: !!tokens,
    tokensValid: !!(tokens && tokens.access_token),
    endpoints: {
      auth: '/auth/start',
      callback: '/callback',
      contacts: '/api/contacts',
      refresh: '/refresh',
      status: '/status',
      test: '/test'
    }
  });
});

// Rota de teste
app.get('/test', (req, res) => {
  const tokens = loadTokens();
  res.json({
    message: 'Teste do servidor',
    tokens: {
      fileExists: fs.existsSync(TOKENS_FILE),
      loaded: !!tokens,
      hasAccessToken: !!(tokens && tokens.access_token),
      hasRefreshToken: !!(tokens && tokens.refresh_token),
      tokenType: tokens?.token_type,
      expiresIn: tokens?.expires_in
    },
    config: CONFIG
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
      scopes: CONFIG.SCOPES,
      authUrl: CONFIG.AUTH_URL
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
    console.log('❌ Erro na autorização:', error);
    return res.status(400).send(`Erro na autorização: ${error}`);
  }
  
  if (!code) {
    console.log('❌ Código de autorização não recebido');
    return res.status(400).send('Código de autorização não recebido');
  }
  
  if (receivedState !== state) {
    console.log('❌ State inválido');
    return res.status(400).send('State inválido');
  }

  try {
    console.log('🔄 Trocando código por tokens...');
    console.log('Code:', code);
    console.log('Client ID:', CONFIG.CLIENT_ID);
    console.log('Redirect URI:', CONFIG.REDIRECT_URI);

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code.toString(),
      client_id: CONFIG.CLIENT_ID,
      client_secret: CONFIG.CLIENT_SECRET,
      redirect_uri: CONFIG.REDIRECT_URI
    });

    console.log('Enviando requisição para:', CONFIG.TOKEN_URL);
    console.log('Body:', body.toString());

    const response = await fetch(CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body
    });

    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const tokens = await response.json();
      console.log('✅ Tokens recebidos com sucesso!');
      console.log('Tokens recebidos:', Object.keys(tokens));
      
      const saved = saveTokens(tokens);
      if (saved) {
        res.send(`
          <h2>✅ Autorização Concluída!</h2>
          <p>Tokens salvos com sucesso!</p>
          <p><a href="/status">Ver Status</a> | <a href="/api/contacts">Testar API</a></p>
          <pre>${JSON.stringify(tokens, null, 2)}</pre>
        `);
      } else {
        res.status(500).send('Erro ao salvar tokens');
      }
    } else {
      const error = await response.text();
      console.log('❌ Erro ao obter tokens:', response.status, error);
      res.status(response.status).send(`Erro ao obter tokens: ${error}`);
    }
  } catch (error) {
    console.log('❌ Erro no callback:', error.message);
    res.status(500).send(`Erro no callback: ${error.message}`);
  }
});

// Renovar tokens manualmente
app.get('/refresh', async (req, res) => {
  console.log('🔄 Iniciando renovação manual de tokens...');
  const success = await refreshTokens();
  res.json({
    success,
    message: success ? 'Tokens renovados com sucesso' : 'Falha ao renovar tokens'
  });
});

// API - Listar contatos
app.get('/api/contacts', async (req, res) => {
  try {
    console.log('📞 Chamando API de contatos...');
    const response = await apiCall('/v1/contacts?limit=10');
    
    if (!response) {
      return res.status(500).json({ error: 'Nenhum token disponível' });
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API de contatos funcionando!');
      console.log('Contatos encontrados:', data.length || 0);
      res.json({
        success: true,
        count: data.length || 0,
        contacts: data.slice(0, 5) // Primeiros 5 contatos
      });
    } else {
      const error = await response.text();
      console.log('❌ Erro na API de contatos:', response.status, error);
      res.status(response.status).json({ error: `API Error: ${error}` });
    }
  } catch (error) {
    console.log('❌ Erro na chamada da API:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// API - Informações da empresa
app.get('/api/company', async (req, res) => {
  try {
    console.log('🏢 Chamando API da empresa...');
    const response = await apiCall('/v1/company');
    
    if (!response) {
      return res.status(500).json({ error: 'Nenhum token disponível' });
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API da empresa funcionando!');
      res.json({
        success: true,
        company: data
      });
    } else {
      const error = await response.text();
      console.log('❌ Erro na API da empresa:', response.status, error);
      res.status(response.status).json({ error: `API Error: ${error}` });
    }
  } catch (error) {
    console.log('❌ Erro na chamada da API:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🚀 Servidor Conta Azul OAuth FIXED iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('🔗 Endpoints disponíveis:');
  console.log(`   - Status: http://localhost:${PORT}/status`);
  console.log(`   - Test: http://localhost:${PORT}/test`);
  console.log(`   - Auth: http://localhost:${PORT}/auth/start`);
  console.log(`   - Contacts: http://localhost:${PORT}/api/contacts`);
  console.log(`   - Company: http://localhost:${PORT}/api/company`);
  console.log(`   - Refresh: http://localhost:${PORT}/refresh`);
  
  // Verificar tokens existentes
  console.log('\n🔍 Verificando tokens existentes...');
  const tokens = loadTokens();
  if (tokens) {
    console.log('✅ Tokens encontrados! Sistema pronto para uso.');
  } else {
    console.log('⚠️  Nenhum token encontrado. Execute /auth/start para autorizar.');
  }
});
