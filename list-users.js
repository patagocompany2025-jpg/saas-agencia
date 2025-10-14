// Script para listar todos os usuários do banco Neon
const https = require('https');
const http = require('http');

console.log('📋 Listando todos os usuários do banco...\n');

// Fazer requisição para buscar usuários via SQL direto
const data = JSON.stringify({
  query: 'SELECT * FROM users ORDER BY id'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/list-users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('Resposta:', response);
    } catch (e) {
      console.log('Resposta raw:', body);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Erro na requisição:', error.message);
});

req.end();
