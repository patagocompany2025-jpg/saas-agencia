const express = require('express');
const https = require('https');

const app = express();
const PORT = 3000;

// Endpoint para capturar o código OAuth
app.get('/oauth/callback', (req, res) => {
  const code = req.query.code;
  const error = req.query.error;
  
  console.log('\n=== OAUTH CALLBACK RECEBIDO ===');
  console.log('Código:', code);
  console.log('Erro:', error);
  console.log('Query completa:', req.query);
  console.log('===============================\n');
  
  if (error) {
    res.send(`
      <h1>Erro OAuth</h1>
      <p>Erro: ${error}</p>
      <p>Descrição: ${req.query.error_description || 'N/A'}</p>
    `);
    return;
  }
  
  if (code) {
    // Aqui você pode trocar o código por tokens
    console.log('✅ Código OAuth recebido com sucesso!');
    console.log('Código:', code);
    
    res.send(`
      <h1>✅ OAuth Autorizado com Sucesso!</h1>
      <p><strong>Código:</strong> ${code}</p>
      <p>O código foi capturado e está sendo processado...</p>
    `);
  } else {
    res.send(`
      <h1>❌ Erro: Código não encontrado</h1>
      <p>Nenhum código foi recebido na URL.</p>
    `);
  }
});

// Endpoint de teste
app.get('/', (req, res) => {
  res.send(`
    <h1>Servidor OAuth Callback</h1>
    <p>Servidor rodando na porta ${PORT}</p>
    <p>Endpoint: <code>/oauth/callback</code></p>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor OAuth rodando em http://localhost:${PORT}`);
  console.log(`📡 Callback: http://localhost:${PORT}/oauth/callback`);
});
