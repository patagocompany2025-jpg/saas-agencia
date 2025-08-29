import { startAPIServer } from './api-server';

async function main() {
  console.log('🚀 Iniciando Mega Vendedor AI...');
  console.log('================================');
  
  try {
    await startAPIServer();
  } catch (error) {
    console.error('❌ Erro fatal ao iniciar sistema:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT, encerrando...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM, encerrando...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Iniciar aplicação
main();
