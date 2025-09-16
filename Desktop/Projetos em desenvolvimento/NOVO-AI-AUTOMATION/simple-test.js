require('dotenv').config();
const express = require('express');

const app = express();

app.get('/test', (req, res) => {
  console.log('=== DEBUG VARIÁVEIS ===');
  console.log('CLIENT_ID:', process.env.CONTA_AZUL_CLIENT_ID);
  console.log('REDIRECT_URI:', process.env.CONTA_AZUL_REDIRECT_URI);
  console.log('SCOPES:', process.env.CONTA_AZUL_SCOPES);
  
  const response = {
    client_id: process.env.CONTA_AZUL_CLIENT_ID,
    redirect_uri: process.env.CONTA_AZUL_REDIRECT_URI,
    scopes: process.env.CONTA_AZUL_SCOPES,
    port: process.env.PORT
  };
  
  console.log('Resposta:', response);
  res.json(response);
});

app.listen(5002, () => {
  console.log('Servidor simples rodando em http://localhost:5002');
  console.log('Teste: http://localhost:5002/test');
});
