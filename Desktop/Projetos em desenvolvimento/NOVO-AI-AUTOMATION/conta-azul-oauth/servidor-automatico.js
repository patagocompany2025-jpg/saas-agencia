// servidor-automatico.js - Servidor com Gerenciamento Automático de Tokens
require('dotenv').config();
const express = require('express');
const tokenManager = require('./token-manager');

const app = express();

// CONFIGURAÇÃO QUE FUNCIONOU ANTES
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

// Middleware para logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Endpoint de status com informações detalhadas
app.get('/status', (req, res) => {
  const tokenStatus = tokenManager.getTokenStatus();
  
  res.json({
    server: 'running',
    tokenManager: tokenStatus,
    config: {
      clientId: CONFIG.CLIENT_ID,
      redirectUri: CONFIG.REDIRECT_URI,
      scopes: CONFIG.SCOPES
    },
    features: [
      '🔄 Renovação automática de tokens',
      '⏰ Verificação de expiração',
      '🛡️ Retry automático em caso de erro 401',
      '📊 Status detalhado dos tokens'
    ]
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
    console.log('✅ Tokens recebidos!');

    // Salvar tokens usando o TokenManager
    if (tokenManager.saveTokens(tokens)) {
      res.send(`
        <h2>✅ Tokens salvos com sucesso!</h2>
        <p>🎉 <strong>Sistema automático ativado!</strong></p>
        <p>🔄 Os tokens serão renovados automaticamente quando necessário</p>
        <p>⏰ Você não precisa mais se preocupar com expiração</p>
        <hr>
        <p><strong>Informações dos tokens:</strong></p>
        <p>Access Token: ${tokens.access_token ? '✅ Presente' : '❌ Ausente'}</p>
        <p>Refresh Token: ${tokens.refresh_token ? '✅ Presente' : '❌ Ausente'}</p>
        <p>Expires In: ${tokens.expires_in} segundos</p>
        <hr>
        <p><a href="/status">Ver Status</a> | <a href="/test-api">Testar API</a> | <a href="/api/contacts">Ver Contatos</a></p>
      `);
    } else {
      res.status(500).send('❌ Erro ao salvar tokens');
    }

  } catch (error) {
    console.log('❌ Erro no callback:', error.message);
    res.status(500).send(`❌ Erro: ${error.message}`);
  }
});

// Endpoint para testar API com gerenciamento automático
app.get('/test-api', async (req, res) => {
  try {
    console.log('🧪 Testando API com gerenciamento automático de tokens...');
    
    const data = await tokenManager.makeApiRequest('/v1/contacts?limit=1');
    
    res.json({
      success: true,
      message: 'API funcionando com gerenciamento automático!',
      data: data,
      tokenStatus: tokenManager.getTokenStatus()
    });

  } catch (error) {
    console.log('❌ Erro no teste da API:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      tokenStatus: tokenManager.getTokenStatus()
    });
  }
});

// Endpoint para listar contatos
app.get('/api/contacts', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    console.log(`📋 Listando contatos (limite: ${limit})...`);
    
    const data = await tokenManager.makeApiRequest(`/v1/contacts?limit=${limit}`);
    
    res.json({
      success: true,
      message: `Contatos listados com sucesso!`,
      count: data.data ? data.data.length : 0,
      data: data,
      tokenStatus: tokenManager.getTokenStatus()
    });

  } catch (error) {
    console.log('❌ Erro ao listar contatos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      tokenStatus: tokenManager.getTokenStatus()
    });
  }
});

// Endpoint para listar produtos
app.get('/api/products', async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    console.log(`📦 Listando produtos (limite: ${limit})...`);
    
    const data = await tokenManager.makeApiRequest(`/v1/products?limit=${limit}`);
    
    res.json({
      success: true,
      message: `Produtos listados com sucesso!`,
      count: data.data ? data.data.length : 0,
      data: data,
      tokenStatus: tokenManager.getTokenStatus()
    });

  } catch (error) {
    console.log('❌ Erro ao listar produtos:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      tokenStatus: tokenManager.getTokenStatus()
    });
  }
});

// Endpoint para informações da empresa
app.get('/api/company', async (req, res) => {
  try {
    console.log('🏢 Buscando informações da empresa...');
    
    const data = await tokenManager.makeApiRequest('/v1/company');
    
    res.json({
      success: true,
      message: 'Informações da empresa obtidas com sucesso!',
      data: data,
      tokenStatus: tokenManager.getTokenStatus()
    });

  } catch (error) {
    console.log('❌ Erro ao buscar empresa:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      tokenStatus: tokenManager.getTokenStatus()
    });
  }
});

// Endpoint para forçar renovação manual
app.get('/refresh', async (req, res) => {
  try {
    console.log('🔄 Renovação manual solicitada...');
    
    await tokenManager.refreshToken();
    
    res.json({
      success: true,
      message: 'Token renovado com sucesso!',
      tokenStatus: tokenManager.getTokenStatus()
    });

  } catch (error) {
    console.log('❌ Erro na renovação manual:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      tokenStatus: tokenManager.getTokenStatus()
    });
  }
});

// Iniciar servidor
const PORT = 5053;
app.listen(PORT, () => {
  console.log('🚀 Servidor Automático de Tokens iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('🔗 Endpoints disponíveis:');
  console.log(`   - Status: http://localhost:${PORT}/status`);
  console.log(`   - Auth: http://localhost:${PORT}/auth/start`);
  console.log(`   - Test API: http://localhost:${PORT}/test-api`);
  console.log(`   - Contatos: http://localhost:${PORT}/api/contacts`);
  console.log(`   - Produtos: http://localhost:${PORT}/api/products`);
  console.log(`   - Empresa: http://localhost:${PORT}/api/company`);
  console.log(`   - Refresh: http://localhost:${PORT}/refresh`);
  console.log('');
  console.log('🎉 RECURSOS AUTOMÁTICOS:');
  console.log('   🔄 Renovação automática de tokens');
  console.log('   ⏰ Verificação de expiração (5 min antes)');
  console.log('   🛡️ Retry automático em caso de erro 401');
  console.log('   📊 Status detalhado dos tokens');
  console.log('');
  
  // Carregar tokens existentes
  tokenManager.loadTokens();
  const status = tokenManager.getTokenStatus();
  
  if (status.hasTokens) {
    console.log('✅ Tokens já disponíveis!');
    console.log(`   Status: ${status.status}`);
    console.log(`   Expira em: ${status.expiresAt}`);
  } else {
    console.log('⚠️ Execute /auth/start para gerar tokens');
  }
});
