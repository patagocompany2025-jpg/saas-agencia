require('dotenv').config();
const express = require('express');

const app = express();

app.get('/test', (req, res) => {
  console.log('=== DEBUG VARIÁVEIS ===');
  console.log('CLIENT_ID:', process.env.CONTA_AZUL_CLIENT_ID);
  console.log('REDIRECT_URI:', process.env.CONTA_AZUL_REDIRECT_URI);
  console.log('SCOPES:', process.env.CONTA_AZUL_SCOPES);
  
  res.json({
    client_id: process.env.CONTA_AZUL_CLIENT_ID,
    redirect_uri: process.env.CONTA_AZUL_REDIRECT_URI,
    scopes: process.env.CONTA_AZUL_SCOPES,
    port: process.env.PORT
  });
});

app.get('/auth/start', (req, res) => {
  console.log('=== DEBUG AUTORIZAÇÃO ===');
  console.log('CLIENT_ID:', process.env.CONTA_AZUL_CLIENT_ID);
  console.log('REDIRECT_URI:', process.env.CONTA_AZUL_REDIRECT_URI);
  
  const params = new URLSearchParams({
    client_id: process.env.CONTA_AZUL_CLIENT_ID,
    redirect_uri: process.env.CONTA_AZUL_REDIRECT_URI,
    scope: process.env.CONTA_AZUL_SCOPES || 'sales',
    state: 'test123',
    response_type: 'code'
  });
  
  const authUrl = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
  console.log('AUTH URL:', authUrl);
  
  res.redirect(authUrl);
});

app.listen(5001, () => {
  console.log('Servidor de teste rodando em http://localhost:5001');
  console.log('Teste: http://localhost:5001/test');
  console.log('Auth: http://localhost:5001/auth/start');
});
