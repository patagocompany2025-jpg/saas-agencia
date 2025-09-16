require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();
const API_BASE = 'https://api.contaazul.com';
const AUTH_URL = 'https://auth.contaazul.com/oauth2/authorize';
const TOKEN_URL = 'https://auth.contaazul.com/oauth2/token';
const TOKENS_FILE = './tokens.json';
let state = Math.random().toString(36).slice(2);

// --- Diagnóstico: quem sou eu?
app.get('/whoami', (req, res) => {
  res.json({
    cwd: process.cwd(),
    file: __filename,
    node: process.version,
    env_loaded: Boolean(process.env.CONTA_AZUL_CLIENT_ID),
  });
});

// --- Diagnóstico: ver .env (sem expor segredo)
app.get('/debug/env', (req, res) => {
  const mask = (s) => (s ? s.slice(0,4) + '...' + s.slice(-4) : null);
  res.json({
    client_id: mask(process.env.CONTA_AZUL_CLIENT_ID || null),
    redirect_uri: process.env.CONTA_AZUL_REDIRECT_URI || null,
    scopes: process.env.CONTA_AZUL_SCOPES || null,
    port: process.env.PORT || 5050
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, tokens_file_exists: fs.existsSync(TOKENS_FILE) });
});

// ===== /auth/start =====
app.get('/auth/start', (req, res) => {
  const p = new URLSearchParams({
    client_id: process.env.CONTA_AZUL_CLIENT_ID,
    redirect_uri: process.env.CONTA_AZUL_REDIRECT_URI,
    scope: (process.env.CONTA_AZUL_SCOPES || 'sales').trim(),
    state,
    response_type: 'code'
  });
  const urlAuth = `${AUTH_URL}?${p.toString()}`;
  console.log('AUTH URL =>', urlAuth);
  res.redirect(urlAuth);
});

// ===== /callback =====
app.get('/callback', async (req, res) => {
  console.log('DEBUG callback:', req.url, req.query);
  const { code, state: st } = req.query;

  if (!code) return res.status(400).send('Faltou code na URL. Inicie por /auth/start.');
  if (st !== state) return res.status(400).send('State inválido. Recomece por /auth/start.');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code.toString(),
    client_id: process.env.CONTA_AZUL_CLIENT_ID,
    client_secret: process.env.CONTA_AZUL_CLIENT_SECRET,
    redirect_uri: process.env.CONTA_AZUL_REDIRECT_URI
  });

  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    });
    if (!r.ok) return res.status(r.status).send(`Falha ao trocar code por token: ${await r.text()}`);

    const json = await r.json();
    fs.writeFileSync(TOKENS_FILE, JSON.stringify({
      access_token: json.access_token,
      refresh_token: json.refresh_token,
      saved_at: new Date().toISOString()
    }, null, 2));

    res.send(`<h2>✅ Tokens salvos no arquivo tokens.json</h2><pre>${JSON.stringify(json, null, 2)}</pre>`);
  } catch (e) {
    res.status(500).send(`Erro no callback: ${e.message}`);
  }
});

// ===== Start =====
const PORT = process.env.PORT || 5050;

// Para desenvolvimento, vamos usar HTTP mesmo
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Abra /whoami e /debug/env para diagnosticar; depois /auth/start.');
  console.log('\n🔧 Para HTTPS, use uma das opções:');
  console.log('1. ngrok: npx ngrok http 5050');
  console.log('2. Ou configure um domínio temporário');
});
