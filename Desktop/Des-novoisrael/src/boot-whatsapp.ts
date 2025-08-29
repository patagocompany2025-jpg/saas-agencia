import { 
  default as makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { existsSync, mkdirSync } from 'fs';
import pino from 'pino';
import qrcode from 'qrcode-terminal';

// Configurar logger
const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// Garantir que o diretório auth existe
const authDir = './auth/mega_vendedor';
if (!existsSync(authDir)) {
  mkdirSync(authDir, { recursive: true });
}

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  
  // Obter versão mais recente do Baileys
  const { version, isLatest } = await fetchLatestBaileysVersion();
  logger.info(`📱 Baileys versão: ${version} (${isLatest ? 'mais recente' : 'atualização disponível'})`);

  // Configurar conexão
  const sock = makeWASocket({
    version,
    logger,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    browser: Browsers.appropriate('Mega Vendedor AI'),
    connectTimeoutMs: 60_000,
    keepAliveIntervalMs: 30_000,
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (_key) => {
      return {
        conversation: 'Mensagem não encontrada'
      };
    },
  });

  // Configurar handlers de eventos
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      // Gerar QR code no terminal
      qrcode.generate(qr, { small: true });
      logger.info('📱 QR Code gerado! Escaneie com seu WhatsApp');
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
      logger.info(`❌ Conexão fechada devido a ${lastDisconnect?.error}, reconectando: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        connectToWhatsApp();
      }
    } else if (connection === 'open') {
      logger.info('✅ Conexão estabelecida!');
    }
  });

  // Handler para mensagens recebidas
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    
    if (!msg.key.fromMe && m.type === 'notify') {
      logger.info(`📨 Mensagem recebida de ${msg.key.remoteJid}: ${msg.message?.conversation || 'Mídia'}`);
      
      // Responder automaticamente
      const response = "Olá! Sou seu bot 🤖. Como posso ajudar?";
      
      await sock.sendMessage(msg.key.remoteJid!, {
        text: response
      });
      
      logger.info(`✅ Resposta enviada: ${response}`);
    }
  });

  // Salvar credenciais quando atualizadas
  sock.ev.on('creds.update', saveCreds);

  return sock;
}

// Iniciar conexão
logger.info('🚀 Iniciando Mega Vendedor AI...');
connectToWhatsApp().catch(err => {
  logger.error('❌ Erro ao conectar:', err);
  process.exit(1);
});

// Manter o processo ativo
process.on('SIGINT', () => {
  logger.info('🛑 Encerrando...');
  process.exit(0);
});
