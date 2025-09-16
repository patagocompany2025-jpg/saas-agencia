const fetch = require('node-fetch');

console.log('🚀 CRIANDO NOVA APLICAÇÃO CONTA AZUL');
console.log('====================================');
console.log('');

console.log('📋 INSTRUÇÕES PARA CRIAR NOVA APLICAÇÃO:');
console.log('');
console.log('1. Acesse: https://app.contaazul.com');
console.log('2. Faça login na sua conta');
console.log('3. Vá em Configurações > Integrações > OAuth');
console.log('4. Clique em "Nova Aplicação" ou "Criar Aplicação"');
console.log('5. Preencha os dados:');
console.log('');
console.log('   Nome: Mega Vendedor AI');
console.log('   Descrição: Sistema de automação de vendas');
console.log('   Redirect URI: https://lojanovoisrael.com.br/oauth/callback');
console.log('   Escopo: openid profile aws.cognito.signin.user.admin');
console.log('');
console.log('6. Salve a aplicação');
console.log('7. Copie o Client ID e Client Secret');
console.log('8. Execute: node atualizar-credenciais.js');
console.log('');

console.log('🔧 CONFIGURAÇÕES ATUAIS (PROVAVELMENTE INVÁLIDAS):');
console.log('Client ID: 3p4m8aht6lvqgmsri1p12pko26');
console.log('Client Secret: jhfqsrgjda8oroiqaccgoqhpu3eopm1pfektjfo1sls8hb51mbs');
console.log('');

console.log('⚠️ IMPORTANTE:');
console.log('As credenciais atuais estão inválidas.');
console.log('Você precisa criar uma nova aplicação no painel da Conta Azul.');
console.log('');

console.log('🌐 URL DO PAINEL:');
console.log('https://app.contaazul.com');
console.log('');

console.log('📞 SUPORTE:');
console.log('Se não conseguir acessar o painel, entre em contato com o suporte da Conta Azul.');
console.log('');

console.log('🔄 APÓS CRIAR A APLICAÇÃO:');
console.log('Execute: node atualizar-credenciais.js');
console.log('E cole as novas credenciais quando solicitado.');
