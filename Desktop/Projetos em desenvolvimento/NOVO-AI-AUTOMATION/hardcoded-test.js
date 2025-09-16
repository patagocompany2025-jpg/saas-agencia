const express = require('express');

const app = express();

app.get('/test', (req, res) => {
  console.log('=== TESTE COM VALORES HARDCODED ===');
  
  const response = {
    client_id: '7f178p84rfk7phnkq2bbthk3m1',
    redirect_uri: 'https://75d955dfdd07.ngrok-free.app/callback',
    scopes: 'openid profile aws.cognito.signin.user.admin',
    port: '5000'
  };
  
  console.log('Resposta:', response);
  res.json(response);
});

app.get('/auth/start', (req, res) => {
  console.log('=== TESTE AUTORIZAÇÃO HARDCODED ===');
  
  const params = new URLSearchParams({
    client_id: '7f178p84rfk7phnkq2bbthk3m1',
    redirect_uri: 'https://75d955dfdd07.ngrok-free.app/callback',
    scope: 'openid profile aws.cognito.signin.user.admin',
    state: 'test123',
    response_type: 'code'
  });
  
  const authUrl = `https://auth.contaazul.com/oauth2/authorize?${params.toString()}`;
  console.log('AUTH URL:', authUrl);
  
  res.redirect(authUrl);
});

app.listen(5003, () => {
  console.log('Servidor hardcoded rodando em http://localhost:5003');
  console.log('Teste: http://localhost:5003/test');
  console.log('Auth: http://localhost:5003/auth/start');
});
