const express = require('express');
const app = express();
const PORT = 80; // Porta padrão para HTTPS

console.log('🌐 SERVIDOR DE CALLBACK PRODUÇÃO - lojanovoisrael.com.br');
console.log('=======================================================');
console.log('');

app.get('/oauth/callback', (req, res) => {
  const { code, state, error } = req.query;
  
  console.log('📥 CALLBACK RECEBIDO:');
  console.log('Code:', code ? code.substring(0, 20) + '...' : 'não fornecido');
  console.log('State:', state);
  console.log('Error:', error);
  console.log('');
  
  if (error) {
    console.log('❌ ERRO NO CALLBACK:', error);
    return res.status(400).send(`
      <h2>❌ Erro de Autorização</h2>
      <p>Erro: ${error}</p>
      <p>State: ${state}</p>
    `);
  }
  
  if (!code) {
    console.log('❌ CÓDIGO NÃO FORNECIDO');
    return res.status(400).send(`
      <h2>❌ Código não fornecido</h2>
      <p>Não foi possível obter o código de autorização.</p>
    `);
  }
  
  console.log('✅ CÓDIGO OBTIDO COM SUCESSO!');
  console.log('📋 CÓDIGO COMPLETO:', code);
  console.log('');
  console.log('🔄 PRÓXIMO PASSO:');
  console.log('Execute: node resolver-tokens-conta-azul.js');
  console.log('E cole este código quando solicitado.');
  
  res.send(`
    <h2>✅ Código Obtido com Sucesso!</h2>
    <p><strong>Código:</strong> ${code}</p>
    <p><strong>State:</strong> ${state}</p>
    <hr>
    <h3>Próximo Passo:</h3>
    <p>Execute no terminal:</p>
    <code>node resolver-tokens-conta-azul.js</code>
    <p>E cole este código quando solicitado.</p>
  `);
});

// Para desenvolvimento local, usar porta 3000
const devPort = 3000;
app.listen(devPort, () => {
  console.log(`🚀 Servidor de callback rodando em http://localhost:${devPort}`);
  console.log(`📡 Aguardando callback em http://localhost:${devPort}/oauth/callback`);
  console.log('');
  console.log('⚠️ IMPORTANTE:');
  console.log('Para usar com https://lojanovoisrael.com.br/oauth/callback');
  console.log('você precisa configurar um proxy ou usar ngrok');
  console.log('');
  console.log('🌐 TESTE A URL DE AUTORIZAÇÃO:');
  console.log('Execute: node test-working-config.js');
  console.log('E abra a URL gerada no navegador');
});
