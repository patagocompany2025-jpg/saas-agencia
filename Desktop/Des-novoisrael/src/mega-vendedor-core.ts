import { 
  default as makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  WASocket,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  proto
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { existsSync, mkdirSync } from 'fs';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import OpenAI from 'openai';

import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

// Interfaces
interface CustomerProfile {
  id: string;
  profile: 'pastor' | 'jovem' | 'mae' | 'fiel';
  confidence: number;
  discount: number;
  lastInteraction: Date;
  totalPurchases: number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  customerId: string;
  items: CartItem[];
  total: number;
  discount: number;
  createdAt: Date;
  lastActivity: Date;
}

interface MessageContext {
  customerId: string;
  profile: CustomerProfile;
  cart: Cart;
  conversationHistory: string[];
}

// Configuração do logger
const logger = pino({
  level: process.env['LOG_LEVEL'] || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// Configuração OpenAI
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});

// Sistema de detecção de perfis
class ProfileDetector {
  private profiles: Map<string, CustomerProfile> = new Map();

  detectProfile(message: string, customerId: string): CustomerProfile {
    const lowerMessage = message.toLowerCase();
    
    logger.info(`🔍 Analisando mensagem: "${message}"`);
    logger.info(`🔍 Mensagem em lowercase: "${lowerMessage}"`);
    
    // Detecção de pastor - PRIORIDADE ALTA
    if (lowerMessage.includes('biblia') || lowerMessage.includes('bíblias') ||
        lowerMessage.includes('igreja') || lowerMessage.includes('pastor') || 
        lowerMessage.includes('50') || lowerMessage.includes('100') ||
        lowerMessage.includes('congregação') || lowerMessage.includes('ministério') ||
        lowerMessage.includes('comprar biblia') || lowerMessage.includes('preciso de biblia') ||
        lowerMessage.includes('compra biblia') || lowerMessage.includes('quero biblia') ||
        lowerMessage.includes('quero compra biblia') || lowerMessage.includes('quero compra um biblia') ||
        lowerMessage.includes('quero comprar biblia') || lowerMessage.includes('quero comprar uma biblia') ||
        lowerMessage.includes('quero compra b') || lowerMessage.includes('quero comprar b')) {
      logger.info(`👨‍💼 Perfil PASTOR detectado para: "${message}"`);
      return this.createProfile(customerId, 'pastor', 0.95, 0.20);
    }
    
    // Detecção de jovem
    if (lowerMessage.includes('camiseta') || lowerMessage.includes('tá quanto') ||
        lowerMessage.includes('legal') || lowerMessage.includes('show') ||
        lowerMessage.includes('massa') || lowerMessage.includes('top') ||
        lowerMessage.includes('quanto') || lowerMessage.includes('preço') ||
        lowerMessage.includes('valor')) {
      logger.info(`👨‍🎓 Perfil JOVEM detectado para: "${message}"`);
      return this.createProfile(customerId, 'jovem', 0.90, 0.10);
    }
    
    // Detecção de mãe
    if (lowerMessage.includes('filho') || lowerMessage.includes('batismo') ||
        lowerMessage.includes('materiais') || lowerMessage.includes('criança') ||
        lowerMessage.includes('família') || lowerMessage.includes('filha') ||
        lowerMessage.includes('batismo') || lowerMessage.includes('filho') ||
        lowerMessage.includes('filha')) {
      logger.info(`👩‍👧‍👦 Perfil MÃE detectado para: "${message}"`);
      return this.createProfile(customerId, 'mae', 0.88, 0.15);
    }
    
    // Cliente geral
    logger.info(`👤 Perfil FIEL detectado para: "${message}"`);
    return this.createProfile(customerId, 'fiel', 0.70, 0.05);
  }

  private createProfile(customerId: string, profile: CustomerProfile['profile'], confidence: number, discount: number): CustomerProfile {
    const existingProfile = this.profiles.get(customerId);
    
    const newProfile: CustomerProfile = {
      id: customerId,
      profile,
      confidence,
      discount,
      lastInteraction: new Date(),
      totalPurchases: existingProfile?.totalPurchases || 0
    };

    this.profiles.set(customerId, newProfile);
    return newProfile;
  }

  getProfile(customerId: string): CustomerProfile | undefined {
    return this.profiles.get(customerId);
  }

  updateProfile(customerId: string, updates: Partial<CustomerProfile>): void {
    const profile = this.profiles.get(customerId);
    if (profile) {
      this.profiles.set(customerId, { ...profile, ...updates });
    }
  }
}

// Sistema de carrinho
class CartManager {
  private carts: Map<string, Cart> = new Map();

  createCart(customerId: string): Cart {
    const cart: Cart = {
      customerId,
      items: [],
      total: 0,
      discount: 0,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.carts.set(customerId, cart);
    logger.info(`🛒 Carrinho criado para cliente ${customerId}`);
    return cart;
  }

  addItem(customerId: string, productId: string, name: string, price: number, quantity: number = 1): boolean {
    const cart = this.carts.get(customerId);
    if (!cart) {
      this.createCart(customerId);
      return this.addItem(customerId, productId, name, price, quantity);
    }

    cart.items.push({ productId, name, price, quantity });
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.lastActivity = new Date();

    logger.info(`🛒 Item adicionado ao carrinho: ${name} x${quantity} - R$ ${(price * quantity).toFixed(2)}`);
    return true;
  }

  getCart(customerId: string): Cart | undefined {
    return this.carts.get(customerId);
  }

  getAbandonedCarts(timeoutMs: number = 2 * 60 * 60 * 1000): Cart[] {
    const now = new Date();
    const abandoned: Cart[] = [];
    
    for (const cart of this.carts.values()) {
      const timeDiff = now.getTime() - cart.lastActivity.getTime();
      if (timeDiff > timeoutMs && cart.items.length > 0) {
        abandoned.push(cart);
      }
    }
    
    if (abandoned.length > 0) {
      logger.warn(`⚠️ ${abandoned.length} carrinho(s) abandonado(s) detectado(s)`);
    }
    
    return abandoned;
  }

  clearCart(customerId: string): boolean {
    const deleted = this.carts.delete(customerId);
    if (deleted) {
      logger.info(`🛒 Carrinho limpo para cliente ${customerId}`);
    }
    return deleted;
  }
}

// Sistema de processamento GPT
class GPTProcessor {
  private conversationHistory: Map<string, string[]> = new Map();

  async processMessage(message: string, context: MessageContext): Promise<string> {
    try {
      const history = this.conversationHistory.get(context.customerId) || [];
      history.push(`Cliente: ${message}`);
      
      // Manter apenas as últimas 10 mensagens
      if (history.length > 20) {
        history.splice(0, history.length - 10);
      }

      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(message, context, history);

      const completion = await openai.chat.completions.create({
        model: process.env['OPENAI_MODEL'] || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const response = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';
      
      history.push(`Assistente: ${response}`);
      this.conversationHistory.set(context.customerId, history);

      logger.info(`🤖 Resposta GPT gerada para ${context.customerId}: ${response.substring(0, 100)}...`);
      return response;

    } catch (error) {
      logger.error(`❌ Erro no processamento GPT: ${error}`);
      return 'Desculpe, estou enfrentando dificuldades técnicas. Tente novamente em alguns instantes.';
    }
  }

  private buildSystemPrompt(context: MessageContext): string {
    const { profile, cart } = context;
    
    return `Você é o Mega Vendedor AI da Novo Israel, uma loja cristã especializada em Bíblias, livros e materiais religiosos.

PERFIL DO CLIENTE:
- Tipo: ${profile.profile}
- Desconto aplicado: ${(profile.discount * 100).toFixed(0)}%
- Total de compras: ${profile.totalPurchases}

CARRINHO ATUAL:
${cart.items.length > 0 ? cart.items.map(item => `- ${item.name}: R$ ${item.price.toFixed(2)} x${item.quantity}`).join('\n') : 'Carrinho vazio'}
Total: R$ ${cart.total.toFixed(2)}

DIRETRIZES:
1. Use linguagem apropriada para o perfil do cliente
2. Sempre mencione o desconto disponível
3. Sugira produtos relevantes
4. Seja cordial e profissional
5. Foque em vendas e conversão
6. Use emojis moderadamente
7. Responda em português brasileiro

PRODUTOS DISPONÍVEIS:
- Bíblias (NVI, King James, Estudo): R$ 89-150
- Camisetas de fé: R$ 39,90
- Livros cristãos: R$ 25-80
- Materiais para batismo: R$ 45-120
- Envelopes de dízimo: R$ 25 (100 unidades)`;
  }

  private buildUserPrompt(message: string, _context: MessageContext, history: string[]): string {
    const recentHistory = history.slice(-6).join('\n');
    
    return `Histórico recente da conversa:
${recentHistory}

Mensagem atual do cliente: ${message}

Responda de forma natural e focada em vendas, considerando o perfil e carrinho do cliente.`;
  }

  clearHistory(customerId: string): void {
    this.conversationHistory.delete(customerId);
    logger.info(`🗑️ Histórico limpo para cliente ${customerId}`);
  }
}

// Sistema principal do Mega Vendedor
class MegaVendedorAI {
  private sock: WASocket | null = null;
  private profileDetector: ProfileDetector;
  private cartManager: CartManager;
  private gptProcessor: GPTProcessor;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.profileDetector = new ProfileDetector();
    this.cartManager = new CartManager();
    this.gptProcessor = new GPTProcessor();
    
    // Garantir que o diretório auth existe
    const authDir = './auth/mega_vendedor';
    if (!existsSync(authDir)) {
      mkdirSync(authDir, { recursive: true });
    }
  }

  async start(): Promise<void> {
    logger.info('🚀 Iniciando Mega Vendedor AI...');
    
    try {
      await this.connectToWhatsApp();
      this.startHealthCheck();
      this.startAbandonedCartMonitor();
      logger.info('✅ Mega Vendedor AI iniciado com sucesso!');
    } catch (error) {
      logger.error('❌ Erro ao iniciar Mega Vendedor AI:', error);
      throw error;
    }
  }

  private async connectToWhatsApp(): Promise<void> {
    try {
      const { state, saveCreds } = await useMultiFileAuthState('./auth/mega_vendedor');
      
      const { version, isLatest } = await fetchLatestBaileysVersion();
      logger.info(`📱 Baileys versão: ${version} (${isLatest ? 'mais recente' : 'atualização disponível'})`);

      this.sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false, // Vamos gerar QR code manualmente
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
      this.setupEventHandlers(saveCreds);
      
    } catch (error) {
      logger.error('❌ Erro ao conectar WhatsApp:', error);
      throw error;
    }
  }

  private setupEventHandlers(saveCreds: () => Promise<void>): void {
    if (!this.sock) return;

    // Handler de conexão
    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        logger.info('📱 QR Code gerado! Escaneie com seu WhatsApp');
        qrcode.generate(qr, { small: true });
      }

      if (connection === 'close') {
        this.isConnected = false;
        const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        logger.warn(`❌ Conexão fechada, reconectando: ${shouldReconnect}`);
        
        if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connectToWhatsApp(), 5000);
        }
      } else if (connection === 'open') {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        logger.info('✅ Conexão WhatsApp estabelecida!');
      }
    });

    // Handler de mensagens
    this.sock.ev.on('messages.upsert', async (m) => {
      try {
        logger.info(`📥 Evento messages.upsert recebido`);
        
        if (!m.messages || m.messages.length === 0) {
          logger.warn('⚠️ Mensagens vazias no evento');
          return;
        }

        const msg = m.messages[0];
        
        if (!msg || !msg.key) {
          logger.warn('⚠️ Mensagem inválida recebida');
          return;
        }

        // Verificar se é mensagem de texto
        const hasText = msg.message?.conversation || 
                       msg.message?.extendedTextMessage?.text ||
                       msg.message?.imageMessage?.caption ||
                       msg.message?.videoMessage?.caption;

        if (!hasText) {
          logger.info(`📷 Mídia recebida de ${msg.key.remoteJid} (não processando)`);
          return;
        }

        // Processar apenas mensagens de outros usuários
        if (!msg.key.fromMe) {
          logger.info(`📨 Processando mensagem de ${msg.key.remoteJid}`);
          await this.handleIncomingMessage(msg);
        } else {
          logger.info(`📤 Mensagem própria ignorada`);
        }
        
      } catch (error) {
        logger.error('❌ Erro no handler de mensagens:', error);
      }
    });

    // Handler adicional para capturar mensagens
    // this.sock.ev.on('messages.set', async (m) => {
    //   try {
    //     logger.info(`📥 Evento messages.set recebido`);
    //     
    //     if (!m.messages || m.messages.length === 0) {
    //       return;
    //     }

    //     const msg = m.messages[0];
    //     
    //     if (!msg || !msg.key || msg.key.fromMe) {
    //       return;
    //     }

    //     const hasText = msg.message?.conversation || 
    //                    msg.message?.extendedTextMessage?.text;

    //     if (hasText) {
    //       logger.info(`📨 Processando mensagem do histórico de ${msg.key.remoteJid}`);
    //       await this.handleIncomingMessage(msg);
    //     }
    //     
    //   } catch (error) {
    //     logger.error('❌ Erro no handler messages.set:', error);
    //   }
    // });

    // Salvar credenciais
    this.sock.ev.on('creds.update', saveCreds);
  }

  private async handleIncomingMessage(msg: proto.IWebMessageInfo): Promise<void> {
    try {
      const customerId = msg.key.remoteJid!;
      
      // Extrair texto da mensagem de várias formas possíveis
      let messageText = '';
      
      if (msg.message?.conversation) {
        messageText = msg.message.conversation;
      } else if (msg.message?.extendedTextMessage?.text) {
        messageText = msg.message.extendedTextMessage.text;
      } else if (msg.message?.imageMessage?.caption) {
        messageText = msg.message.imageMessage.caption;
      } else if (msg.message?.videoMessage?.caption) {
        messageText = msg.message.videoMessage.caption;
      }
      
      if (!messageText || messageText.trim() === '') {
        logger.warn(`⚠️ Mensagem sem texto recebida de ${customerId}`);
        return;
      }

      logger.info(`📨 Mensagem recebida de ${customerId}: "${messageText}"`);

      // Verificar se a conexão está ativa
      if (!this.isConnected) {
        logger.error('❌ Conexão WhatsApp não está ativa');
        return;
      }

      // Detectar perfil
      logger.info(`🔍 Detectando perfil para: "${messageText}"`);
      const profile = this.profileDetector.detectProfile(messageText, customerId);
      logger.info(`👤 Perfil detectado: ${profile.profile} (${(profile.confidence * 100).toFixed(0)}% confiança)`);
      
      // Obter ou criar carrinho
      let cart = this.cartManager.getCart(customerId);
      if (!cart) {
        cart = this.cartManager.createCart(customerId);
        logger.info(`🛒 Novo carrinho criado para ${customerId}`);
      }

      // Criar contexto
      const context: MessageContext = {
        customerId,
        profile,
        cart,
        conversationHistory: []
      };

      // Processar com GPT
      logger.info(`🤖 Processando com GPT: "${messageText}"`);
      let response: string;
      
      try {
        response = await this.gptProcessor.processMessage(messageText, context);
        logger.info(`🤖 Resposta GPT gerada: "${response.substring(0, 100)}..."`);
        
        // Verificar se a resposta é a mensagem de erro genérica
        if (response.includes('Desculpe, estou enfrentando dificuldades técnicas') || 
            response.includes('não consegui processar sua mensagem')) {
          throw new Error('GPT retornou mensagem de erro genérica');
        }
      } catch (error) {
        logger.error('❌ Erro no processamento GPT:', error);
        
        // Fallback: Resposta baseada no perfil detectado
        response = this.generateFallbackResponse(messageText, profile);
        logger.info(`🔄 Usando resposta de fallback para perfil ${profile.profile} (${(profile.discount * 100).toFixed(0)}% desconto): "${response.substring(0, 100)}..."`);
      }

      // Enviar resposta
      if (this.sock && this.isConnected) {
        logger.info(`📤 Enviando resposta para ${customerId}`);
        await this.sock.sendMessage(customerId, { text: response });
        logger.info(`✅ Resposta enviada com sucesso para ${customerId}`);
      } else {
        logger.error('❌ Não foi possível enviar resposta - conexão não disponível');
      }

    } catch (error) {
      logger.error('❌ Erro ao processar mensagem:', error);
      logger.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    }
  }

  private startHealthCheck(): void {
    setInterval(() => {
      const status = {
        timestamp: new Date().toISOString(),
        whatsapp: this.isConnected ? 'connected' : 'disconnected',
        reconnectAttempts: this.reconnectAttempts,
        activeProfiles: this.profileDetector['profiles'].size,
        activeCarts: this.cartManager['carts'].size
      };
      
      logger.info('💓 Health Check:', status);
    }, 60000); // A cada minuto
  }

  private startAbandonedCartMonitor(): void {
    setInterval(() => {
      const abandonedCarts = this.cartManager.getAbandonedCarts();
      
      for (const cart of abandonedCarts) {
        logger.warn(`⚠️ Carrinho abandonado detectado: ${cart.customerId} - ${cart.items.length} itens - R$ ${cart.total.toFixed(2)}`);
        
        // Aqui você pode implementar lógica para recontatar o cliente
        // Por exemplo, enviar uma mensagem de follow-up
      }
    }, 300000); // A cada 5 minutos
  }

  // Métodos públicos para API
  getStatus(): any {
    return {
      whatsapp: this.isConnected ? 'connected' : 'disconnected',
      reconnectAttempts: this.reconnectAttempts,
      activeProfiles: this.profileDetector['profiles'].size,
      activeCarts: this.cartManager['carts'].size,
      uptime: process.uptime()
    };
  }

  getProfile(customerId: string): CustomerProfile | undefined {
    return this.profileDetector.getProfile(customerId);
  }

  getCart(customerId: string): Cart | undefined {
    return this.cartManager.getCart(customerId);
  }

  getAbandonedCarts(): Cart[] {
    return this.cartManager.getAbandonedCarts();
  }

  async sendMessage(customerId: string, message: string): Promise<boolean> {
    try {
      if (this.sock && this.isConnected) {
        await this.sock.sendMessage(customerId, { text: message });
        logger.info(`📤 Mensagem manual enviada para ${customerId}: ${message.substring(0, 100)}...`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('❌ Erro ao enviar mensagem manual:', error);
      return false;
    }
  }

  private generateFallbackResponse(message: string, profile: CustomerProfile): string {
    const lowerMessage = message.toLowerCase();
    
    // Respostas baseadas no perfil
    switch (profile.profile) {
      case 'pastor':
        if (lowerMessage.includes('biblia') || lowerMessage.includes('bíblias') || lowerMessage.includes('compra')) {
          return `Olá Pastor! 👋 É uma honra atendê-lo! Vejo que você está interessado em bíblias.\n\nComo líder espiritual, você tem direito a um desconto especial de ${(profile.discount * 100).toFixed(0)}%!\n\n📖 Temos várias opções:\n• Bíblia Sagrada - R$ 45,00\n• Bíblia de Estudo - R$ 89,00\n• Bíblia Infantil - R$ 25,00\n\nPara pedidos em quantidade (acima de 10 unidades), temos preços ainda melhores!\n\nGostaria de saber mais sobre alguma opção específica?`;
        }
        return `Olá Pastor! 👋 É uma honra atendê-lo! Como líder espiritual, você tem acesso a nossos melhores preços com desconto de ${(profile.discount * 100).toFixed(0)}%.\n\nComo posso ajudá-lo hoje?`;

      case 'jovem':
        if (lowerMessage.includes('camiseta') || lowerMessage.includes('quanto') || lowerMessage.includes('preço')) {
          return `Oi! 😊 Temos várias camisetas com mensagens de fé super legais!\n\n👕 Preços:\n• Camiseta "Fé" - R$ 35,00\n• Camiseta "Deus é Fiel" - R$ 35,00\n• Camiseta "Jesus Te Ama" - R$ 35,00\n\nCom seu desconto de ${(profile.discount * 100).toFixed(0)}%, fica ainda mais em conta!\n\nQual você curtiu mais? 😄`;
        }
        return `Oi! 😊 Que legal você ter interesse em nossos produtos! Como jovem, você tem ${(profile.discount * 100).toFixed(0)}% de desconto!\n\nO que você está procurando?`;

      case 'mae':
        if (lowerMessage.includes('batismo') || lowerMessage.includes('filho') || lowerMessage.includes('filha')) {
          return `Olá! 👩‍👧‍👦 Que lindo momento para sua família! Para batismos temos kits especiais:\n\n👶 Kit Batismo Completo - R$ 120,00\n• Vela decorativa\n• Certificado\n• Lembrancinhas\n• Decoração\n\nCom desconto de ${(profile.discount * 100).toFixed(0)}% para você!\n\nGostaria de ver fotos dos kits?`;
        }
        return `Olá! 👩‍👧‍👦 É sempre especial atender uma mãe! Você tem ${(profile.discount * 100).toFixed(0)}% de desconto em todos nossos produtos.\n\nComo posso ajudá-la hoje?`;

      default:
        return `Olá! 👋 Obrigado por entrar em contato conosco!\n\nTemos uma variedade de produtos cristãos:\n• Bíblias\n• Livros\n• Camisetas\n• Decorações\n• Materiais para eventos\n\nVocê tem ${(profile.discount * 100).toFixed(0)}% de desconto!\n\nO que você está procurando?`;
    }
  }
}

export { MegaVendedorAI, ProfileDetector, CartManager, GPTProcessor };
export type { CustomerProfile, Cart, CartItem, MessageContext };
