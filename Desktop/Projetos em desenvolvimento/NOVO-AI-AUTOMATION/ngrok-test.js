const express = require('express');

const app = express();

app.get('/test', (req, res) => {
  console.log('=== TESTE COM NGROK ===');
  
  const response = {
    client_id: '7f178p84rfk7phnkq2bbthk3m1',
    redirect_uri: '',https://f354b32d46e1.ngrok-free.app/callback
    scopes: 'openid profile aws.cognito.signin.user.admin',
    port: '5003'
  };
  
  console.log('Resposta:', response);
  res.json(response);
});

app.get('/auth/start', (req, res) => {
  console.log('=== TESTE AUTORIZAÇÃO NGROK ===');
  
  const params = new URLSearchParams({
    client_id: '7f178p84rfk7phnkq2bbthk3m1',
    redirect_uri: 'https://f354b32d46e1.ngrok-free.app/callback',
    scope: 'openid profile aws.cognito.signin.user.admin',
    state: 'test123',
    response_type: 'code'
  });
  
  const authUrl = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
  console.log('AUTH URL:', authUrl);
  
  res.redirect(authUrl);
});

app.get('/callback', (req, res) => {
  console.log('=== CALLBACK RECEBIDO ===');
  console.log('Query params:', req.query);
  
  res.send(`
    <h2>✅ Callback recebido!</h2>
    <p>Code: ${req.query.code || 'N/A'}</p>
    <p>State: ${req.query.state || 'N/A'}</p>
    <p>Error: ${req.query.error || 'N/A'}</p>
  `);
});

app.listen(5003, () => {
  console.log('Servidor ngrok rodando em http://localhost:5003');
  console.log('URL pública: https://f354b32d46e1.ngrok-free.app');
  console.log('Teste: https://f354b32d46e1.ngrok-free.app/test');
  console.log('Auth: https://f354b32d46e1.ngrok-free.app/auth/start');
  console.log('Callback: https://f354b32d46e1.ngrok-free.app/callback');
});
