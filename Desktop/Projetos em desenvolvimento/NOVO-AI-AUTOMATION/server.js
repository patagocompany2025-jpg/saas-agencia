require("dotenv").config({ path: './env.dev' });
const express = require("express");
const fetch = require('node-fetch');
const fs = require('fs');
const { startRefreshJob } = require("./src/jobs/refreshCron");
const { getAccessToken } = require("./src/lib/tokenManager");

const app = express();
const AUTH_URL = 'https://auth.contaazul.com/oauth2/authorize';
const TOKEN_URL = 'https://auth.contaazul.com/oauth2/token';
const TOKENS_FILE = './tokens.json';
let state = Math.random().toString(36).slice(2);
let accessToken = null, refreshToken = null;

// Iniciar job de renovação automática
startRefreshJob();

app.get('/auth/start', (req, res) => {
  console.log('DEBUG - Variáveis de ambiente:');
  console.log('CLIENT_ID:', process.env.CLIENT_ID);
  console.log('REDIRECT_URI:', process.env.REDIRECT_URI);
  console.log('SCOPES:', process.env.SCOPES);
  
  const p = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.REDIRECT_URI,
    scope: (process.env.SCOPES || 'sales').trim(),
    state,
    response_type: 'code'
  });
  
  const authUrl = `${AUTH_URL}?${p.toString()}`;
  console.log('AUTH URL:', authUrl);
  
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code, state: st } = req.query;
  if (!code) return res.status(400).send('Faltou code');
  if (st !== state) return res.status(400).send('State inválido');

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code.toString(),
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uri: process.env.REDIRECT_URI
  });

  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!r.ok) {
    return res.status(r.status).send(await r.text());
  }
  const json = await r.json();
  accessToken = json.access_token;
  refreshToken = json.refresh_token;

  fs.writeFileSync(TOKENS_FILE, JSON.stringify({
    access_token: accessToken,
    refresh_token: refreshToken,
    saved_at: new Date().toISOString()
  }, null, 2));

  res.send(`
    <h2>✅ Tokens salvos!</h2>
    <p>Arquivo: <code>tokens.json</code></p>
    <pre>${JSON.stringify(json, null, 2)}</pre>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    has_access_token: Boolean(accessToken),
    has_refresh_token: Boolean(refreshToken),
  });
});

// Novas rotas OAuth
app.get("/health/oauth", async (_req, res) => {
  try {
    const token = await getAccessToken();
    res.json({ ok: true, tokenPreview: token?.slice?.(0, 12) + "..." });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/oauth/dev-url", (_req, res) => {
  if (!process.env.AUTH_URL) return res.status(500).send("Defina AUTH_URL no .env");
  const u = new URL(process.env.AUTH_URL);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", process.env.CLIENT_ID);
  u.searchParams.set("redirect_uri", process.env.REDIRECT_URI);
  if (process.env.SCOPES) u.searchParams.set("scope", process.env.SCOPES);
  return res.send(u.toString());
});

const PORT = process.env.APP_PORT || 5000;
app.listen(PORT, () => {
  console.log(`API on http://localhost:${PORT}`);
  console.log('Abra /auth/start para autorizar.');
  console.log('Rotas OAuth: /health/oauth, /oauth/dev-url');
});
