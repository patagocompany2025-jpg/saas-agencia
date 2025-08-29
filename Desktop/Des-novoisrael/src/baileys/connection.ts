import { 
  default as makeWASocket, 
  DisconnectReason, 
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  downloadMediaMessage,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { existsSync, mkdirSync } from 'fs';
import pino from 'pino';
import { MessageHandler } from './handlers/message-handler';
import { AuthHandler } from './auth/auth-handler';
import { RateLimiter } from '../utils/rate-limiter';

export class WhatsAppConnection {
  private sock: WASocket | null = null;
  private messageHandler: MessageHandler;
  private authHandler: AuthHandler;
  private rateLimiter: RateLimiter;
  private logger: pino.Logger;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000; // 5 segundos

  constructor() {
    this.logger = pino({
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

    this.rateLimiter = new RateLimiter(50, 60000); // 50 mensagens por minuto
    this.messageHandler = new MessageHandler(this.logger);
    this.authHandler = new AuthHandler(this.logger);
  }

  async initialize(): Promise<void> {
    try {
      this.logger.info('🚀 Iniciando conexão com WhatsApp...');
      
      // Garantir que os diretórios existem
      this.ensureDirectories();
      
      // Obter versão mais recente do Baileys
      const { version, isLatest } = await fetchLatestBaileysVersion();
      this.logger.info(`📱 Baileys versão: ${version} (${isLatest ? 'mais recente' : 'atualização disponível'})`);

      // Configurar autenticação
      const authState = await this.authHandler.getAuthState();
      
      // Configurar conexão
      this.sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: true,
        auth: {
          creds: authState.state.creds,
          keys: makeCacheableSignalKeyStore(authState.state.keys, this.logger),
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
      this.setupEventHandlers();
      
      this.logger.info('✅ Conexão WhatsApp inicializada com sucesso!');
    } catch (error) {
      this.logger.error('❌ Erro ao inicializar conexão:', error);
      throw error;
    }
  }

  private ensureDirectories(): void {
    const dirs = [
      'data/sessions',
      'data/media',
      'data/logs'
    ];

    dirs.forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
        this.logger.info(`📁 Diretório criado: ${dir}`);
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.sock) return;

    // Handler de conexão
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.logger.info('📱 QR Code gerado - Escaneie com o WhatsApp');
      }

      if (connection === 'close') {
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        
        this.logger.warn(`🔌 Conexão fechada: ${lastDisconnect?.error}`);
        
        if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          this.logger.info(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          
          setTimeout(() => {
            this.initialize();
          }, this.reconnectInterval);
        } else {
          this.logger.error('❌ Máximo de tentativas de reconexão atingido');
        }
      } else if (connection === 'open') {
        this.logger.info('✅ WhatsApp conectado com sucesso!');
        this.reconnectAttempts = 0;
        
        // Salvar estado da autenticação
        await this.authHandler.saveAuthState(this.sock.authState);
      }
    });

    // Handler de mensagens
    this.sock.ev.on('messages.upsert', async (m) => {
      const msg = m.messages[0];
      
      if (!msg.key.fromMe && msg.message) {
        try {
          // Verificar rate limiting
          if (!this.rateLimiter.checkLimit(msg.key.remoteJid!)) {
            this.logger.warn(`⚠️ Rate limit atingido para ${msg.key.remoteJid}`);
            return;
          }

          // Processar mensagem
          await this.messageHandler.handleMessage(this.sock!, msg);
        } catch (error) {
          this.logger.error('❌ Erro ao processar mensagem:', error);
        }
      }
    });

    // Handler de presença
    this.sock.ev.on('presence.update', (presence) => {
      this.logger.debug(`👤 Presença atualizada: ${presence.id} - ${presence.presences}`);
    });

    // Handler de grupos
    this.sock.ev.on('groups.update', (updates) => {
      updates.forEach(update => {
        this.logger.info(`👥 Grupo atualizado: ${update.id} - ${update.subject}`);
      });
    });
  }

  async sendMessage(to: string, content: string, options?: {
    quoted?: proto.IMessage;
    media?: Buffer;
    caption?: string;
  }): Promise<void> {
    if (!this.sock) {
      throw new Error('Conexão WhatsApp não inicializada');
    }

    try {
      if (options?.media) {
        await this.sock.sendMessage(to, {
          image: options.media,
          caption: options.caption || content
        }, { quoted: options.quoted });
      } else {
        await this.sock.sendMessage(to, {
          text: content
        }, { quoted: options.quoted });
      }

      this.logger.info(`📤 Mensagem enviada para ${to}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar mensagem para ${to}:`, error);
      throw error;
    }
  }

  async downloadMediaMessage(msg: proto.IMessage): Promise<Buffer | null> {
    if (!this.sock) return null;

    try {
      const buffer = await downloadMediaMessage(
        msg,
        'buffer',
        {},
        {
          logger: this.logger,
          reuploadRequest: this.sock.updateMediaMessage
        }
      );
      
      return buffer as Buffer;
    } catch (error) {
      this.logger.error('❌ Erro ao baixar mídia:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.sock?.user !== undefined;
  }

  async disconnect(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this.logger.info('🔌 WhatsApp desconectado');
    }
  }
}
