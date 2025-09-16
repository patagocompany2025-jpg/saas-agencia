const express = require('express');

const app = express();

app.get('/test', (req, res) => {
  console.log('=== TESTE COM LOCALHOST ===');
  
  const response = {
    client_id: '7f178p84rfk7phnkq2bbthk3m1',
    redirect_uri: 'http://localhost:5003/callback',
    scopes: 'openid profile aws.cognito.signin.user.admin',
    port: '5003'
  };
  
  console.log('Resposta:', response);
  res.json(response);
});

app.get('/auth/start', (req, res) => {
  console.log('=== TESTE AUTORIZAÇÃO LOCALHOST ===');
  
  const params = new URLSearchParams({
    client_id: '7f178p84rfk7phnkq2bbthk3m1',
    redirect_uri: 'http://localhost:5003/callback',
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
  console.log('Servidor localhost rodando em http://localhost:5003');
  console.log('Teste: http://localhost:5003/test');
  console.log('Auth: http://localhost:5003/auth/start');
  console.log('Callback: http://localhost:5003/callback');
});
