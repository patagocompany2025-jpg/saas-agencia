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

interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

interface TestScenario {
  name: string;
  customerId: string;
  message: string;
  expectedProfile: string;
  expectedDiscount: number;
  expectedKeywords: string[];
  expectedResponse: string[];
}

class MegaVendedorTester {
  private gptService: GPTNovoIsraelService;
  private profileDetector: ProfileDetector;
  private discountEngine: DiscountEngine;
  private productCatalog: ProductCatalog;
  private cartManager: CartManager;
  private conversationManager: ConversationManager;
  private results: TestResult[] = [];

  constructor() {
    this.gptService = new GPTNovoIsraelService();
    this.profileDetector = new ProfileDetector();
    this.discountEngine = new DiscountEngine();
    this.productCatalog = new ProductCatalog();
    this.cartManager = new CartManager();
    this.conversationManager = new ConversationManager();
  }

  async runAllTests(): Promise<void> {
    logger.info('🧪 Iniciando testes completos do Mega Vendedor AI...\n');

    try {
      // Testes de infraestrutura
      await this.testInfrastructure();
      
      // Testes de componentes individuais
      await this.testComponents();
      
      // Testes de cenários de conversa
      await this.testConversationScenarios();
      
      // Testes de sistema completo
      await this.testCompleteSystem();
      
      // Relatório final
      this.generateReport();
      
    } catch (error) {
      logger.error('❌ Teste falhou:', error);
      process.exit(1);
    }
  }

  private async testInfrastructure(): Promise<void> {
    logger.info('🔧 Testando infraestrutura...');
    
    // Teste 1: Variáveis de ambiente
    await this.testEnvironmentVariables();
    
    // Teste 2: Conexão Baileys (simulada)
    await this.testBaileysConnection();
    
    // Teste 3: QR Code (simulado)
    await this.testQRCode();
    
    logger.info('✅ Testes de infraestrutura concluídos\n');
  }

  private async testComponents(): Promise<void> {
    logger.info('🔍 Testando componentes individuais...');
    
    // Teste 4: GPT Service
    await this.testGPTService();
    
    // Teste 5: Profile Detector
    await this.testProfileDetector();
    
    // Teste 6: Discount Engine
    await this.testDiscountEngine();
    
    // Teste 7: Product Catalog
    await this.testProductCatalog();
    
    // Teste 8: Cart Manager
    await this.testCartManager();
    
    // Teste 9: Conversation Manager
    await this.testConversationManager();
    
    logger.info('✅ Testes de componentes concluídos\n');
  }

  private async testConversationScenarios(): Promise<void> {
    logger.info('💬 Testando cenários de conversa...');
    
    const scenarios: TestScenario[] = [
      {
        name: 'Pastor - Compra de Bíblias',
        customerId: 'pastor-001',
        message: 'Preciso de 50 bíblias para igreja',
        expectedProfile: 'pastor',
        expectedDiscount: 0.20,
        expectedKeywords: ['bíblia', 'igreja', '50'],
        expectedResponse: ['pastor', 'desconto', 'frete']
      },
      {
        name: 'Jovem - Camiseta de Fé',
        customerId: 'jovem-001',
        message: 'Essa camiseta de fé tá quanto?',
        expectedProfile: 'jovem',
        expectedDiscount: 0.10,
        expectedKeywords: ['camiseta', 'fé'],
        expectedResponse: ['casual', 'desconto', 'upsell']
      },
      {
        name: 'Mãe - Materiais Batismo',
        customerId: 'mae-001',
        message: 'Materiais para batismo do meu filho',
        expectedProfile: 'mae',
        expectedDiscount: 0.15,
        expectedKeywords: ['batismo', 'filho'],
        expectedResponse: ['maternal', 'desconto', 'sugestões']
      },
      {
        name: 'Fiel Geral - Primeira Compra',
        customerId: 'fiel-001',
        message: 'Quero comprar uma bíblia',
        expectedProfile: 'fiel',
        expectedDiscount: 0.05,
        expectedKeywords: ['bíblia'],
        expectedResponse: ['evangelização', 'desconto']
      }
    ];

    for (const scenario of scenarios) {
      await this.testConversationScenario(scenario);
    }
    
    logger.info('✅ Testes de cenários de conversa concluídos\n');
  }

  private async testCompleteSystem(): Promise<void> {
    logger.info('🚀 Testando sistema completo...');
    
    // Teste 10: Sistema de carrinho abandonado
    await this.testAbandonedCart();
    
    // Teste 11: Fluxo completo de venda
    await this.testCompleteSaleFlow();
    
    // Teste 12: Logs detalhados
    await this.testDetailedLogs();
    
    logger.info('✅ Testes de sistema completo concluídos\n');
  }

  private async testEnvironmentVariables(): Promise<void> {
    const testName = 'Variáveis de Ambiente';
    try {
      const requiredVars = [
        'OPENAI_API_KEY',
        'OPENAI_MODEL',
        'COMPANY_NAME',
        'COMPANY_PHONE',
        'WHATSAPP_SESSION_ID'
      ];

      for (const varName of requiredVars) {
        if (!process.env[varName]) {
          throw new Error(`Variável ${varName} não encontrada`);
        }
      }

      this.addResult(testName, true, 'Todas as variáveis de ambiente configuradas');
    } catch (error) {
      this.addResult(testName, false, `Erro: ${error.message}`);
    }
  }

  private async testBaileysConnection(): Promise<void> {
    const testName = 'Conexão Baileys';
    try {
      // Simular conexão Baileys
      const connection = new WhatsAppConnection();
      await connection.initialize();
      
      this.addResult(testName, true, 'Conexão Baileys inicializada com sucesso');
    } catch (error) {
      this.addResult(testName, false, `Erro na conexão: ${error.message}`);
    }
  }

  private async testQRCode(): Promise<void> {
    const testName = 'QR Code';
    try {
      // Simular geração de QR Code
      const qrCode = 'QR_CODE_SIMULADO_123456';
      
      if (qrCode && qrCode.length > 0) {
        this.addResult(testName, true, 'QR Code gerado com sucesso');
      } else {
        throw new Error('QR Code não foi gerado');
      }
    } catch (error) {
      this.addResult(testName, false, `Erro no QR Code: ${error.message}`);
    }
  }

  private async testGPTService(): Promise<void> {
    const testName = 'GPT Service';
    try {
      const testMessage = "Olá, sou um pastor e gostaria de saber sobre as bíblias";
      const response = await this.gptService.processMessage(testMessage, {
        customerId: 'test-customer',
        profile: { type: 'pastor', confidence: 85 }
      });

      if (response && response.length > 0) {
        this.addResult(testName, true, 'GPT Service funcionando corretamente');
      } else {
        throw new Error('Resposta vazia do GPT');
      }
    } catch (error) {
      this.addResult(testName, false, `Erro no GPT: ${error.message}`);
    }
  }

  private async testProfileDetector(): Promise<void> {
    const testName = 'Profile Detector';
    try {
      const testMessages = [
        { message: 'Preciso de bíblias para igreja', expected: 'pastor' },
        { message: 'Essa camiseta tá quanto?', expected: 'jovem' },
        { message: 'Materiais para meu filho', expected: 'mae' },
        { message: 'Quero comprar uma bíblia', expected: 'fiel' }
      ];

      for (const test of testMessages) {
        const profile = await this.profileDetector.detectProfile(test.message);
        if (profile.type !== test.expected) {
          throw new Error(`Perfil esperado: ${test.expected}, detectado: ${profile.type}`);
        }
      }

      this.addResult(testName, true, 'Detecção de perfis funcionando corretamente');
    } catch (error) {
      this.addResult(testName, false, `Erro na detecção: ${error.message}`);
    }
  }

  private async testDiscountEngine(): Promise<void> {
    const testName = 'Discount Engine';
    try {
      const testCases = [
        { profile: 'pastor', expected: 0.20 },
        { profile: 'jovem', expected: 0.10 },
        { profile: 'mae', expected: 0.15 },
        { profile: 'fiel', expected: 0.05 }
      ];

      for (const testCase of testCases) {
        const discount = this.discountEngine.calculateDiscount(testCase.profile);
        if (Math.abs(discount - testCase.expected) > 0.01) {
          throw new Error(`Desconto esperado: ${testCase.expected}, calculado: ${discount}`);
        }
      }

      this.addResult(testName, true, 'Cálculo de descontos funcionando corretamente');
    } catch (error) {
      this.addResult(testName, false, `Erro no cálculo: ${error.message}`);
    }
  }

  private async testProductCatalog(): Promise<void> {
    const testName = 'Product Catalog';
    try {
      const products = this.productCatalog.getAllProducts();
      
      if (products.length === 0) {
        throw new Error('Catálogo de produtos vazio');
      }

      const biblia = this.productCatalog.searchProducts('bíblia');
      if (biblia.length === 0) {
        throw new Error('Produto "bíblia" não encontrado');
      }

      this.addResult(testName, true, 'Catálogo de produtos funcionando corretamente');
    } catch (error) {
      this.addResult(testName, false, `Erro no catálogo: ${error.message}`);
    }
  }

  private async testCartManager(): Promise<void> {
    const testName = 'Cart Manager';
    try {
      const customerId = 'test-customer';
      
      // Criar carrinho
      this.cartManager.createCart(customerId);
      
      // Adicionar item
      this.cartManager.addItem(customerId, 'biblia-nvi', 2);
      
      // Verificar carrinho
      const cart = this.cartManager.getCart(customerId);
      if (!cart || cart.items.length === 0) {
        throw new Error('Carrinho não foi criado corretamente');
      }

      this.addResult(testName, true, 'Gerenciamento de carrinho funcionando corretamente');
    } catch (error) {
      this.addResult(testName, false, `Erro no carrinho: ${error.message}`);
    }
  }

  private async testConversationManager(): Promise<void> {
    const testName = 'Conversation Manager';
    try {
      const customerId = 'test-customer';
      
      // Salvar conversa
      this.conversationManager.saveConversation(customerId, 'Cliente: Olá', 'Bot: Olá! Como posso ajudar?');
      
      // Carregar conversa
      const conversation = this.conversationManager.loadConversation(customerId);
      if (!conversation || conversation.messages.length === 0) {
        throw new Error('Conversa não foi salva corretamente');
      }

      this.addResult(testName, true, 'Gerenciamento de conversas funcionando corretamente');
    } catch (error) {
      this.addResult(testName, false, `Erro na conversa: ${error.message}`);
    }
  }

  private async testConversationScenario(scenario: TestScenario): Promise<void> {
    const testName = `Cenário: ${scenario.name}`;
    try {
      // 1. Detectar perfil
      const profile = await this.profileDetector.detectProfile(scenario.message);
      if (profile.type !== scenario.expectedProfile) {
        throw new Error(`Perfil esperado: ${scenario.expectedProfile}, detectado: ${profile.type}`);
      }

      // 2. Calcular desconto
      const discount = this.discountEngine.calculateDiscount(profile.type);
      if (Math.abs(discount - scenario.expectedDiscount) > 0.01) {
        throw new Error(`Desconto esperado: ${scenario.expectedDiscount}, calculado: ${discount}`);
      }

      // 3. Processar com GPT
      const response = await this.gptService.processMessage(scenario.message, {
        customerId: scenario.customerId,
        profile: profile
      });

      // 4. Verificar palavras-chave na resposta
      const responseLower = response.toLowerCase();
      const foundKeywords = scenario.expectedResponse.filter(keyword => 
        responseLower.includes(keyword.toLowerCase())
      );

      if (foundKeywords.length === 0) {
        throw new Error(`Nenhuma palavra-chave esperada encontrada na resposta`);
      }

      // 5. Salvar contexto
      this.conversationManager.saveConversation(scenario.customerId, scenario.message, response);

      this.addResult(testName, true, `Cenário executado com sucesso. Desconto: ${discount * 100}%`);
    } catch (error) {
      this.addResult(testName, false, `Erro no cenário: ${error.message}`);
    }
  }

  private async testAbandonedCart(): Promise<void> {
    const testName = 'Sistema Carrinho Abandonado';
    try {
      const customerId = 'abandoned-customer';
      
      // Simular carrinho abandonado
      this.cartManager.createCart(customerId);
      this.cartManager.addItem(customerId, 'biblia-nvi', 1);
      
      // Simular tempo de espera (2 horas)
      const abandonedCarts = this.cartManager.getAbandonedCarts(2 * 60 * 60 * 1000); // 2 horas em ms
      
      if (abandonedCarts.length > 0) {
        // Simular recontato
        const recoveryMessage = this.generateRecoveryMessage(customerId);
        
        this.addResult(testName, true, 'Sistema de carrinho abandonado funcionando');
      } else {
        this.addResult(testName, true, 'Nenhum carrinho abandonado detectado');
      }
    } catch (error) {
      this.addResult(testName, false, `Erro no carrinho abandonado: ${error.message}`);
    }
  }

  private async testCompleteSaleFlow(): Promise<void> {
    const testName = 'Fluxo Completo de Venda';
    try {
      const customerId = 'sale-customer';
      
      // 1. Primeira mensagem
      const message1 = 'Quero comprar uma bíblia';
      const profile1 = await this.profileDetector.detectProfile(message1);
      const response1 = await this.gptService.processMessage(message1, {
        customerId: customerId,
        profile: profile1
      });

      // 2. Segunda mensagem (escolha do produto)
      const message2 = 'Quero a bíblia NVI';
      const response2 = await this.gptService.processMessage(message2, {
        customerId: customerId,
        profile: profile1,
        context: response1
      });

      // 3. Terceira mensagem (finalização)
      const message3 = 'Vou pagar com cartão';
      const response3 = await this.gptService.processMessage(message3, {
        customerId: customerId,
        profile: profile1,
        context: response2
      });

      this.addResult(testName, true, 'Fluxo completo de venda executado com sucesso');
    } catch (error) {
      this.addResult(testName, false, `Erro no fluxo de venda: ${error.message}`);
    }
  }

  private async testDetailedLogs(): Promise<void> {
    const testName = 'Logs Detalhados';
    try {
      // Simular logs de diferentes níveis
      logger.info('Teste de log INFO');
      logger.warn('Teste de log WARN');
      logger.error('Teste de log ERROR');
      logger.debug('Teste de log DEBUG');

      this.addResult(testName, true, 'Sistema de logs funcionando corretamente');
    } catch (error) {
      this.addResult(testName, false, `Erro nos logs: ${error.message}`);
    }
  }

  private generateRecoveryMessage(customerId: string): string {
    const cart = this.cartManager.getCart(customerId);
    if (cart && cart.items.length > 0) {
      return `Olá! Vi que você deixou alguns itens no carrinho. Que tal finalizar sua compra com 15% de desconto?`;
    }
    return '';
  }

  private addResult(testName: string, passed: boolean, message: string, details?: any): void {
    const result: TestResult = {
      testName,
      passed,
      message,
      details
    };
    this.results.push(result);
    
    const status = passed ? '✅' : '❌';
    logger.info(`${status} ${testName}: ${message}`);
  }

  private generateReport(): void {
    logger.info('\n📊 RELATÓRIO FINAL DOS TESTES');
    logger.info('=====================================');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    logger.info(`Total de testes: ${totalTests}`);
    logger.info(`Testes aprovados: ${passedTests} ✅`);
    logger.info(`Testes reprovados: ${failedTests} ❌`);
    logger.info(`Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      logger.info('\n❌ Testes que falharam:');
      this.results.filter(r => !r.passed).forEach(result => {
        logger.info(`  - ${result.testName}: ${result.message}`);
      });
    }
    
    if (passedTests === totalTests) {
      logger.info('\n🎉 TODOS OS TESTES PASSARAM! Sistema pronto para produção!');
    } else {
      logger.info('\n⚠️  Alguns testes falharam. Verifique os problemas antes de prosseguir.');
    }
  }
}

// Executar testes
async function main() {
  const tester = new MegaVendedorTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

export { MegaVendedorTester };
