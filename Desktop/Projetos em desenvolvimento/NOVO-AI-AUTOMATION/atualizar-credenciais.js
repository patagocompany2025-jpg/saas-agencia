const fs = require('fs');
const readline = require('readline');

console.log('🔧 ATUALIZANDO CREDENCIAIS DA CONTA AZUL');
console.log('========================================');
console.log('');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('📋 Cole as novas credenciais da aplicação criada no painel:');
console.log('');

rl.question('🔑 Client ID: ', (clientId) => {
  if (!clientId || clientId.trim() === '') {
    console.log('❌ Client ID não fornecido');
    rl.close();
    return;
  }

  rl.question('🔐 Client Secret: ', (clientSecret) => {
    if (!clientSecret || clientSecret.trim() === '') {
      console.log('❌ Client Secret não fornecido');
      rl.close();
      return;
    }

    try {
      console.log('');
      console.log('🔄 Atualizando arquivos...');

      // Atualizar resolver-tokens-conta-azul.js
      const resolverPath = './resolver-tokens-conta-azul.js';
      let resolverContent = fs.readFileSync(resolverPath, 'utf8');
      
      resolverContent = resolverContent.replace(
        /const CLIENT_ID = '.*';/,
        `const CLIENT_ID = '${clientId.trim()}';`
      );
      
      resolverContent = resolverContent.replace(
        /const CLIENT_SECRET = '.*';/,
        `const CLIENT_SECRET = '${clientSecret.trim()}';`
      );
      
      fs.writeFileSync(resolverPath, resolverContent);
      console.log('✅ resolver-tokens-conta-azul.js atualizado');

      // Atualizar resolver-tokens-original.js
      const originalPath = './resolver-tokens-original.js';
      let originalContent = fs.readFileSync(originalPath, 'utf8');
      
      originalContent = originalContent.replace(
        /const CLIENT_ID = '.*';/,
        `const CLIENT_ID = '${clientId.trim()}';`
      );
      
      originalContent = originalContent.replace(
        /const CLIENT_SECRET = '.*';/,
        `const CLIENT_SECRET = '${clientSecret.trim()}';`
      );
      
      fs.writeFileSync(originalPath, originalContent);
      console.log('✅ resolver-tokens-original.js atualizado');

      // Atualizar resolver-tokens-ngrok.js
      const ngrokPath = './resolver-tokens-ngrok.js';
      let ngrokContent = fs.readFileSync(ngrokPath, 'utf8');
      
      ngrokContent = ngrokContent.replace(
        /const CLIENT_ID = '.*';/,
        `const CLIENT_ID = '${clientId.trim()}';`
      );
      
      ngrokContent = ngrokContent.replace(
        /const CLIENT_SECRET = '.*';/,
        `const CLIENT_SECRET = '${clientSecret.trim()}';`
      );
      
      fs.writeFileSync(ngrokPath, ngrokContent);
      console.log('✅ resolver-tokens-ngrok.js atualizado');

      // Atualizar diagnostico-oauth-completo.js
      const diagnosticoPath = './diagnostico-oauth-completo.js';
      let diagnosticoContent = fs.readFileSync(diagnosticoPath, 'utf8');
      
      diagnosticoContent = diagnosticoContent.replace(
        /const CLIENT_ID = '.*';/,
        `const CLIENT_ID = '${clientId.trim()}';`
      );
      
      diagnosticoContent = diagnosticoContent.replace(
        /const CLIENT_SECRET = '.*';/,
        `const CLIENT_SECRET = '${clientSecret.trim()}';`
      );
      
      fs.writeFileSync(diagnosticoPath, diagnosticoContent);
      console.log('✅ diagnostico-oauth-completo.js atualizado');

      console.log('');
      console.log('✅ TODAS AS CREDENCIAIS ATUALIZADAS!');
      console.log('');
      console.log('🚀 PRÓXIMO PASSO:');
      console.log('Execute: node resolver-tokens-original.js');
      console.log('E teste a nova configuração.');
      console.log('');

    } catch (error) {
      console.log('❌ Erro ao atualizar arquivos:', error.message);
    }

    rl.close();
  });
});
