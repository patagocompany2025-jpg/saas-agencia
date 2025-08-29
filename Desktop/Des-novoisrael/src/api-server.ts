import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import { MegaVendedorAI } from './mega-vendedor-core';

// Carregar variáveis de ambiente
config();

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Instância do Mega Vendedor AI
const megaVendedor = new MegaVendedorAI();

// Middleware de logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${req.ip}`);
  return next();
});

// Health Check
app.get('/health', (_req, res) => {
  const status = megaVendedor.getStatus();
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    whatsapp: status.whatsapp,
    activeProfiles: status.activeProfiles,
    activeCarts: status.activeCarts,
    version: '1.0.0'
  };
  
  return res.json(health);
});

// Status detalhado
app.get('/status', (_req, res) => {
  const status = megaVendedor.getStatus();
  return res.json({
    ...status,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Obter perfil de um cliente
app.get('/profile/:customerId', (req, res) => {
  try {
    const { customerId } = req.params;
    const profile = megaVendedor.getProfile(customerId);
    
    if (profile) {
      return res.json({
        success: true,
        profile: {
          ...profile,
          lastInteraction: profile.lastInteraction.toISOString()
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Perfil não encontrado'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obter carrinho de um cliente
app.get('/cart/:customerId', (req, res) => {
  try {
    const { customerId } = req.params;
    const cart = megaVendedor.getCart(customerId);
    
    if (cart) {
      return res.json({
        success: true,
        cart: {
          ...cart,
          createdAt: cart.createdAt.toISOString(),
          lastActivity: cart.lastActivity.toISOString()
        }
      });
    } else {
      return res.status(404).json({
        success: false,
        message: 'Carrinho não encontrado'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Obter carrinhos abandonados
app.get('/abandoned-carts', (_req, res) => {
  try {
    const abandonedCarts = megaVendedor.getAbandonedCarts();
    
    return res.json({
      success: true,
      count: abandonedCarts.length,
      carts: abandonedCarts.map(cart => ({
        ...cart,
        createdAt: cart.createdAt.toISOString(),
        lastActivity: cart.lastActivity.toISOString()
      }))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Enviar mensagem manual
app.post('/send-message', async (req, res) => {
  try {
    const { customerId, message } = req.body;
    
    if (!customerId || !message) {
      return res.status(400).json({
        success: false,
        message: 'customerId e message são obrigatórios'
      });
    }
    
    const success = await megaVendedor.sendMessage(customerId, message);
    
    if (success) {
      return res.json({
        success: true,
        message: 'Mensagem enviada com sucesso'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Falha ao enviar mensagem'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Simular mensagem (para testes)
app.post('/simulate-message', async (req, res) => {
  try {
    const { customerId, message } = req.body;
    
    if (!customerId || !message) {
      return res.status(400).json({
        success: false,
        message: 'customerId e message são obrigatórios'
      });
    }
    
    // Simular processamento sem enviar mensagem real
    const profile = megaVendedor.getProfile(customerId);
    const cart = megaVendedor.getCart(customerId);
    
    return res.json({
      success: true,
      message: 'Mensagem simulada com sucesso',
      data: {
        customerId,
        message,
        profile: profile ? {
          ...profile,
          lastInteraction: profile.lastInteraction.toISOString()
        } : null,
        cart: cart ? {
          ...cart,
          createdAt: cart.createdAt.toISOString(),
          lastActivity: cart.lastActivity.toISOString()
        } : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Teste de processamento de mensagem
app.post('/test-message-processing', async (req, res) => {
  try {
    const { customerId, message } = req.body;
    
    if (!customerId || !message) {
      return res.status(400).json({
        success: false,
        message: 'customerId e message são obrigatórios'
      });
    }
    
    // Simular o processamento completo
    const profile = megaVendedor.getProfile(customerId);
    const cart = megaVendedor.getCart(customerId);
    
    // Criar contexto simulado
    const context = {
      customerId,
      profile: profile || { id: customerId, profile: 'fiel', confidence: 0.7, discount: 0.05, lastInteraction: new Date(), totalPurchases: 0 },
      cart: cart || { customerId, items: [], total: 0, discount: 0, createdAt: new Date(), lastActivity: new Date() },
      conversationHistory: []
    };
    
    return res.json({
      success: true,
      message: 'Processamento de mensagem testado',
      data: {
        customerId,
        message,
        profile: context.profile,
        cart: context.cart,
        processingStatus: 'simulated'
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Estatísticas do sistema
app.get('/stats', (_req, res) => {
  try {
    const status = megaVendedor.getStatus();
    const abandonedCarts = megaVendedor.getAbandonedCarts();
    
    return res.json({
      success: true,
      stats: {
        uptime: process.uptime(),
        whatsapp: status.whatsapp,
        activeProfiles: status.activeProfiles,
        activeCarts: status.activeCarts,
        abandonedCarts: abandonedCarts.length,
        reconnectAttempts: status.reconnectAttempts,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint de teste
app.get('/test', (_req, res) => {
  return res.json({
    success: true,
    message: 'Mega Vendedor AI API funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Middleware de tratamento de erros
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Erro na API:', err);
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
          error: process.env['NODE_ENV'] === 'development' ? err.message : 'Internal server error'
  });
});

// Middleware para rotas não encontradas
app.use('*', (_req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /health',
      'GET /status',
      'GET /stats',
      'GET /test',
      'GET /profile/:customerId',
      'GET /cart/:customerId',
      'GET /abandoned-carts',
      'POST /send-message',
      'POST /simulate-message'
    ]
  });
});

// Função para iniciar o servidor
export async function startAPIServer(): Promise<void> {
  try {
    // Iniciar o Mega Vendedor AI
    await megaVendedor.start();
    
    // Iniciar o servidor HTTP
    app.listen(PORT, () => {
      console.log(`🚀 API Server rodando na porta ${PORT}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      console.log(`📈 Status: http://localhost:${PORT}/status`);
      console.log(`📋 Stats: http://localhost:${PORT}/stats`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Iniciar se chamado diretamente
if (require.main === module) {
  startAPIServer();
}
