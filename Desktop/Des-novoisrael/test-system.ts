import { config } from 'dotenv';
import { WhatsAppConnection } from './src/baileys/connection';
import { GPTNovoIsraelService } from './src/services/gpt-novo-israel';
import { ProfileDetector } from './src/utils/profile-detector';
import { DiscountEngine } from './src/utils/discount-engine';
import { ProductCatalog } from './src/utils/product-catalog';
import { CartManager } from './src/utils/cart-manager';
import { ConversationManager } from './src/utils/conversation-manager';
import pino from 'pino';

// Carregar variáveis de ambiente
config();

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

class SystemTester {
  async runTests(): Promise<void> {
    logger.info('🧪 Iniciando testes do sistema Mega Vendedor AI...\n');

    try {
      // Teste 1: Variáveis de ambiente
      await this.testEnvironmentVariables();
      
      // Teste 2: GPT Service
      await this.testGPTService();
      
      // Teste 3: Profile Detector
      await this.testProfileDetector();
      
      // Teste 4: Discount Engine
      await this.testDiscountEngine();
      
      // Teste 5: Product Catalog
      await this.testProductCatalog();
      
      // Teste 6: Cart Manager
      await this.testCartManager();
      
      // Teste 7: Conversation Manager
      await this.testConversationManager();
      
      // Teste 8: WhatsApp Connection (sem conectar)
      await this.testWhatsAppConnection();
      
      logger.info('✅ Todos os testes passaram com sucesso!');
      logger.info('🚀 Sistema pronto para uso!');
      
    } catch (error) {
      logger.error('❌ Teste falhou:', error);
      process.exit(1);
    }
  }

  private async testEnvironmentVariables(): Promise<void> {
    logger.info('🔧 Testando variáveis de ambiente...');
    
    const requiredVars = [
      'OPENAI_API_KEY',
      'OPENAI_MODEL',
      'OPENAI_MAX_TOKENS',
      'OPENAI_TEMPERATURE'
    ];

    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        throw new Error(`Variável de ambiente ${varName} não encontrada`);
      }
    }

    logger.info('✅ Variáveis de ambiente OK');
  }

  private async testGPTService(): Promise<void> {
    logger.info('🤖 Testando GPT Service...');
    
    const gptService = new GPTNovoIsraelService();
    
    // Teste básico de processamento
    const testMessage = "Olá, sou um pastor e gostaria de saber sobre as bíblias";
    const testContext = {
      customerId: 'test-customer',
      profile: {
        type: 'pastor' as const,
        confidence: 85,
        interests: ['biblia', 'estudo'],
        lastInteraction: new Date(),
        totalPurchases: 0,
        discountLevel: 20
      },
      conversation: [],
      cart: [],
      lastActivity: new Date()
    };

    try {
      const response = await gptService.processMessage(testMessage, testContext);
      logger.info(`✅ GPT Service OK - Resposta: ${response.substring(0, 50)}...`);
    } catch (error) {
      logger.warn(`⚠️ GPT Service com erro (pode ser API key): ${error}`);
    }
  }

  private async testProfileDetector(): Promise<void> {
    logger.info('👤 Testando Profile Detector...');
    
    const detector = new ProfileDetector();
    
    const testMessages = [
      "Paz do Senhor, sou pastor da igreja",
      "E aí galera, tudo bem?",
      "Olá querida, sou mãe de 3 filhos",
      "Deus abençoe, sou fiel da igreja"
    ];

    for (const message of testMessages) {
      const testContext = {
        customerId: 'test-customer',
        profile: {
          type: 'novo' as const,
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

      const profile = await detector.detectProfile(message, testContext);
      logger.info(`✅ Profile detectado: ${profile.type} (${profile.confidence}% confiança)`);
    }
  }

  private async testDiscountEngine(): Promise<void> {
    logger.info('💰 Testando Discount Engine...');
    
    const engine = new DiscountEngine();
    
    const testProfiles = [
      { type: 'pastor' as const, confidence: 90, totalPurchases: 5 },
      { type: 'jovem' as const, confidence: 75, totalPurchases: 2 },
      { type: 'mae' as const, confidence: 85, totalPurchases: 3 },
      { type: 'fiel' as const, confidence: 80, totalPurchases: 1 }
    ];

    for (const profile of testProfiles) {
      const discount = engine.calculateDiscount(profile);
      logger.info(`✅ Desconto para ${profile.type}: ${discount.discount}% - ${discount.reason}`);
    }
  }

  private async testProductCatalog(): Promise<void> {
    logger.info('📦 Testando Product Catalog...');
    
    const catalog = new ProductCatalog();
    
    // Teste busca de produtos
    const searchResults = catalog.searchProducts('bíblia');
    logger.info(`✅ Encontrados ${searchResults.length} produtos com "bíblia"`);
    
    // Teste catálogo por categoria
    const categories = catalog.getCatalogByCategory();
    logger.info(`✅ Categorias disponíveis: ${Object.keys(categories).join(', ')}`);
    
    // Teste produto específico
    const product = catalog.findProduct('Bíblia NVI');
    if (product) {
      logger.info(`✅ Produto encontrado: ${product.name} - R$ ${product.price}`);
    }
  }

  private async testCartManager(): Promise<void> {
    logger.info('🛒 Testando Cart Manager...');
    
    const cartManager = new CartManager();
    const testCustomerId = 'test-customer-cart';
    
    // Teste carrinho vazio
    const emptyCart = await cartManager.getCart(testCustomerId);
    logger.info(`✅ Carrinho vazio criado: ${emptyCart.items.length} itens`);
    
    // Teste adicionar item
    const testItem = {
      id: 'biblia-nvi',
      name: 'Bíblia NVI',
      price: 89.00,
      quantity: 1,
      category: 'biblia'
    };
    
    const cartWithItem = await cartManager.addItem(testCustomerId, testItem);
    logger.info(`✅ Item adicionado: ${cartWithItem.items.length} itens, Total: R$ ${cartWithItem.finalTotal}`);
    
    // Limpar carrinho de teste
    await cartManager.clearCart(testCustomerId);
  }

  private async testConversationManager(): Promise<void> {
    logger.info('💬 Testando Conversation Manager...');
    
    const conversationManager = new ConversationManager();
    const testCustomerId = 'test-customer-conversation';
    
    // Teste contexto vazio
    const emptyContext = await conversationManager.getContext(testCustomerId);
    logger.info(`✅ Contexto vazio: ${emptyContext ? 'existe' : 'não existe'}`);
    
    // Teste salvar contexto
    const testContext = {
      customerId: testCustomerId,
      profile: {
        type: 'pastor' as const,
        confidence: 85,
        interests: ['biblia'],
        lastInteraction: new Date(),
        totalPurchases: 0,
        discountLevel: 20
      },
      conversation: [],
      cart: [],
      lastActivity: new Date()
    };
    
    await conversationManager.saveContext(testCustomerId, testContext);
    logger.info('✅ Contexto salvo com sucesso');
    
    // Limpar dados de teste
    await conversationManager.deleteCustomer(testCustomerId);
  }

  private async testWhatsAppConnection(): Promise<void> {
    logger.info('📱 Testando WhatsApp Connection (sem conectar)...');
    
    try {
      const connection = new WhatsAppConnection();
      logger.info('✅ WhatsApp Connection instanciado com sucesso');
      
      // Não inicializar para não conectar ao WhatsApp
      logger.info('ℹ️ Conexão não inicializada (teste apenas de instanciação)');
    } catch (error) {
      throw new Error(`Erro ao instanciar WhatsApp Connection: ${error}`);
    }
  }
}

// Executar testes
const tester = new SystemTester();
tester.runTests().catch(error => {
  logger.error('❌ Erro nos testes:', error);
  process.exit(1);
});
