const http = require('http');

console.log('🔍 Obtendo URL do ngrok...');

// Fazer requisição para a API do ngrok
const options = {
  hostname: 'localhost',
  port: 4040,
  path: '/api/tunnels',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.tunnels && response.tunnels.length > 0) {
        const tunnel = response.tunnels[0];
        const publicUrl = tunnel.public_url;
        
        console.log('✅ URL do ngrok obtida:');
        console.log('🌐 URL Pública:', publicUrl);
        console.log('');
        console.log('📋 Agora você pode usar esta URL como redirect_uri');
        console.log('🔗 Callback URL:', publicUrl + '/oauth/callback');
        console.log('');
        console.log('🚀 Próximo passo:');
        console.log('1. Abra o painel da Conta Azul');
        console.log('2. Vá em Configurações > OAuth');
        console.log('3. Adicione esta URL como redirect_uri:');
        console.log('   ' + publicUrl + '/oauth/callback');
        console.log('4. Salve as configurações');
        console.log('5. Execute: node resolver-tokens-ngrok.js');
        
      } else {
        console.log('❌ Nenhum túnel encontrado');
        console.log('Verifique se o ngrok está rodando');
      }
    } catch (error) {
      console.log('❌ Erro ao processar resposta:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Erro ao conectar com ngrok:', error.message);
  console.log('Verifique se o ngrok está rodando na porta 4040');
});

req.end();
