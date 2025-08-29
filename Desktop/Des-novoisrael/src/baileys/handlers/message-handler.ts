import { WASocket, proto } from '@whiskeysockets/baileys';
import pino from 'pino';
import { GPTNovoIsraelService } from '../../services/gpt-novo-israel';
import { ProfileDetector } from '../../utils/profile-detector';
import { DiscountEngine } from '../../utils/discount-engine';
import { ConversationManager } from '../../utils/conversation-manager';
import { CartManager } from '../../utils/cart-manager';
import { ProductCatalog } from '../../utils/product-catalog';

export interface CustomerProfile {
  type: 'pastor' | 'jovem' | 'mae' | 'fiel' | 'novo';
  confidence: number;
  interests: string[];
  lastInteraction: Date;
  totalPurchases: number;
  discountLevel: number;
}

export interface MessageContext {
  customerId: string;
  profile: CustomerProfile;
  conversation: any[];
  cart: any[];
  lastActivity: Date;
}

export class MessageHandler {
  private logger: pino.Logger;
  private gptService: GPTNovoIsraelService;
  private profileDetector: ProfileDetector;
  private discountEngine: DiscountEngine;
  private conversationManager: ConversationManager;
  private cartManager: CartManager;
  private productCatalog: ProductCatalog;

  constructor(logger: pino.Logger) {
    this.logger = logger;
    this.gptService = new GPTNovoIsraelService();
    this.profileDetector = new ProfileDetector();
    this.discountEngine = new DiscountEngine();
    this.conversationManager = new ConversationManager();
    this.cartManager = new CartManager();
    this.productCatalog = new ProductCatalog();
  }

  async handleMessage(sock: WASocket, msg: proto.IMessage): Promise<void> {
    try {
      const from = msg.key.remoteJid!;
      const messageText = this.extractMessageText(msg);
      const messageType = this.getMessageType(msg);
      
      this.logger.info(`📨 Nova mensagem de ${from}: ${messageText?.substring(0, 50)}...`);

      // Obter ou criar contexto do cliente
      const context = await this.getOrCreateContext(from);
      
      // Detectar perfil do cliente
      const profile = await this.profileDetector.detectProfile(messageText || '', context);
      context.profile = profile;

      // Processar com GPT
      const gptResponse = await this.gptService.processMessage(messageText || '', context);
      
      // Aplicar desconto baseado no perfil
      const discountInfo = this.discountEngine.calculateDiscount(profile);
      
      // Gerar resposta personalizada
      const response = this.generatePersonalizedResponse(gptResponse, profile, discountInfo);
      
      // Enviar resposta
      await sock.sendMessage(from, { text: response });
      
      // Atualizar contexto
      await this.updateContext(from, context, messageText || '', response);
      
      // Verificar carrinho abandonado
      await this.checkAbandonedCart(from, context);
      
      this.logger.info(`✅ Mensagem processada para ${from}`);
      
    } catch (error) {
      this.logger.error('❌ Erro ao processar mensagem:', error);
      
      // Enviar mensagem de erro amigável
      const errorResponse = "Desculpe, estou enfrentando algumas dificuldades técnicas. Por favor, tente novamente em alguns instantes. Deus abençoe! 🙏";
      await sock.sendMessage(msg.key.remoteJid!, { text: errorResponse });
    }
  }

  private extractMessageText(msg: proto.IMessage): string | null {
    if (msg.message?.conversation) {
      return msg.message.conversation;
    }
    
    if (msg.message?.extendedTextMessage?.text) {
      return msg.message.extendedTextMessage.text;
    }
    
    if (msg.message?.imageMessage?.caption) {
      return msg.message.imageMessage.caption;
    }
    
    if (msg.message?.documentMessage?.title) {
      return msg.message.documentMessage.title;
    }
    
    return null;
  }

  private getMessageType(msg: proto.IMessage): string {
    if (msg.message?.conversation || msg.message?.extendedTextMessage) {
      return 'text';
    }
    
    if (msg.message?.imageMessage) {
      return 'image';
    }
    
    if (msg.message?.documentMessage) {
      return 'document';
    }
    
    if (msg.message?.audioMessage) {
      return 'audio';
    }
    
    return 'unknown';
  }

  private async getOrCreateContext(customerId: string): Promise<MessageContext> {
    let context = await this.conversationManager.getContext(customerId);
    
    if (!context) {
      context = {
        customerId,
        profile: {
          type: 'novo',
          confidence: 0,
          interests: [],
          lastInteraction: new Date(),
          totalPurchases: 0,
          discountLevel: 0
        },
        conversation: [],
        cart: [],
        lastActivity: new Date()
      };
      
      await this.conversationManager.saveContext(customerId, context);
      this.logger.info(`👤 Novo cliente criado: ${customerId}`);
    }
    
    return context;
  }

  private generatePersonalizedResponse(
    gptResponse: string, 
    profile: CustomerProfile, 
    discountInfo: any
  ): string {
    let greeting = '';
    
    switch (profile.type) {
      case 'pastor':
        greeting = 'Paz do Senhor, Pastor! 🙏 ';
        break;
      case 'jovem':
        greeting = 'E aí! 😊 ';
        break;
      case 'mae':
        greeting = 'Olá querida! 💕 ';
        break;
      case 'fiel':
        greeting = 'Deus abençoe! 🙏 ';
        break;
      default:
        greeting = 'Olá! Deus abençoe! 🙏 ';
    }

    let discountMessage = '';
    if (discountInfo.discount > 0) {
      discountMessage = `\n\n🎉 *OFERTA ESPECIAL:* ${discountInfo.discount}% de desconto para você! ${discountInfo.reason}`;
    }

    return `${greeting}${gptResponse}${discountMessage}`;
  }

  private async updateContext(
    customerId: string, 
    context: MessageContext, 
    userMessage: string, 
    botResponse: string
  ): Promise<void> {
    // Atualizar conversa
    context.conversation.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    });
    
    context.conversation.push({
      role: 'assistant',
      content: botResponse,
      timestamp: new Date()
    });
    
    // Manter apenas as últimas 20 mensagens
    if (context.conversation.length > 20) {
      context.conversation = context.conversation.slice(-20);
    }
    
    context.lastActivity = new Date();
    
    await this.conversationManager.saveContext(customerId, context);
  }

  private async checkAbandonedCart(customerId: string, context: MessageContext): Promise<void> {
    if (context.cart.length > 0) {
      const lastCartActivity = context.lastActivity;
      const hoursSinceLastActivity = (Date.now() - lastCartActivity.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastActivity > 2) { // 2 horas
        const abandonedCartMessage = this.generateAbandonedCartMessage(context);
        
        // Enviar mensagem de carrinho abandonado
        // Nota: Aqui você precisaria ter acesso ao sock para enviar
        this.logger.info(`🛒 Carrinho abandonado detectado para ${customerId}`);
        
        // Limpar carrinho após notificação
        context.cart = [];
        await this.conversationManager.saveContext(customerId, context);
      }
    }
  }

  private generateAbandonedCartMessage(context: MessageContext): string {
    const totalItems = context.cart.length;
    const totalValue = context.cart.reduce((sum, item) => sum + item.price, 0);
    
    return `🛒 *Carrinho Abandonado*
    
Olá! Percebi que você deixou ${totalItems} item(s) no seu carrinho (R$ ${totalValue.toFixed(2)}).

Não perca essa oportunidade! Deus tem algo especial preparado para você! 🙏

*Desconto especial:* 15% de desconto se finalizar a compra agora!

Digite "finalizar" para continuar ou "ver produtos" para ver nosso catálogo completo.

Deus abençoe! ✨`;
  }

  async handleProductInquiry(sock: WASocket, from: string, productName: string): Promise<void> {
    try {
      const product = this.productCatalog.findProduct(productName);
      
      if (product) {
        const response = this.formatProductInfo(product);
        await sock.sendMessage(from, { text: response });
      } else {
        const response = `Desculpe, não encontrei o produto "${productName}". 
        
Digite "catálogo" para ver todos os nossos produtos disponíveis ou me diga o que você está procurando! 🙏`;
        await sock.sendMessage(from, { text: response });
      }
    } catch (error) {
      this.logger.error('❌ Erro ao processar consulta de produto:', error);
    }
  }

  private formatProductInfo(product: any): string {
    return `📦 *${product.name}*
    
${product.description}

💰 *Preço:* R$ ${product.price.toFixed(2)}
📏 *Tamanhos:* ${product.sizes?.join(', ') || 'Único'}
📦 *Disponível:* ${product.inStock ? 'Sim' : 'Não'}

Para adicionar ao carrinho, digite: "adicionar ${product.name}"

Deus abençoe! 🙏`;
  }
}
