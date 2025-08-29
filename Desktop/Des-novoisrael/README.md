# 🚀 Mega Vendedor AI - Novo Israel

Sistema completo de WhatsApp AI evangélico para a Novo Israel, especializado em vendas de produtos cristãos com inteligência artificial.

## 📋 Características

### 🤖 **Inteligência Artificial**
- **OpenAI GPT-4** para processamento de mensagens
- **Detecção automática de perfis** (Pastor, Jovem, Mãe, Fiel)
- **Respostas personalizadas** baseadas no perfil do cliente
- **Contexto de conversa** mantido por cliente

### 📱 **WhatsApp Integration**
- **Baileys** (biblioteca mais recente e estável)
- **QR Code automático** para conexão
- **Reconexão automática** em caso de desconexão
- **Rate limiting** (máx 50 msg/min)
- **Suporte a mídia** (imagens, documentos, áudio)

### 💰 **Sistema de Vendas**
- **Catálogo de produtos** evangélicos
- **Carrinho de compras** inteligente
- **Descontos automáticos** baseados no perfil
- **Sistema de carrinho abandonado**
- **Cálculo de preços** em tempo real

### 🎯 **Produtos Disponíveis**
- **📖 Bíblias** (NVI R$89, King James R$120, Estudo R$150)
- **📮 Envelopes Dízimo** (Pac 100 R$25, Pac 500 R$95)
- **👕 Camisetas Fé** (P/M/G/GG R$39)
- **🎁 Materiais Campanha** (Kit Páscoa R$67, Kit Natal R$78)

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta OpenAI com API Key

### 1. Clone o repositório
```bash
git clone <repository-url>
cd mega_vendedor_ai
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# ===================================
# CONFIGURAÇÕES DO SERVIDOR
# ===================================
PORT=3001
NODE_ENV=development

# ===================================
# OPENAI CONFIGURATION
# ===================================
OPENAI_API_KEY=sk-sua-chave-openai-aqui
OPENAI_MODEL=gpt-4
OPENAI_MAX_TOKENS=500
OPENAI_TEMPERATURE=0.7

# ===================================
# EVOLUTION API (WHATSAPP)
# ===================================
EVOLUTION_API_KEY=sua_evolution_key_aqui
EVOLUTION_API_URL=https://sua-evolution-api.com
WEBHOOK_URL=https://seu-webhook.com/webhook

# ===================================
# CONFIGURAÇÕES DA EMPRESA
# ===================================
COMPANY_NAME=Novo Israel
WHATSAPP_NUMBER=5521999999999

# ===================================
# CONFIGURAÇÕES DE DESCONTO
# ===================================
PASTOR_DISCOUNT=20
CLIENTE_NOVO_DISCOUNT=10
CARRINHO_ABANDONADO_DISCOUNT=15
```

### 4. Compile o projeto
```bash
npm run build
```

## 🚀 Uso

### Iniciar o sistema
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

### Executar testes
```bash
# Teste completo do sistema
npm test

# Teste em modo watch
npm run test:watch
```

## 📁 Estrutura do Projeto

```
mega_vendedor_ai/
├── src/
│   ├── baileys/
│   │   ├── connection.ts          # Conexão WhatsApp
│   │   ├── auth/
│   │   │   └── auth-handler.ts    # Autenticação
│   │   └── handlers/
│   │       └── message-handler.ts # Processamento de mensagens
│   ├── services/
│   │   └── gpt-novo-israel.ts     # Serviço GPT especializado
│   ├── utils/
│   │   ├── profile-detector.ts    # Detecção de perfis
│   │   ├── discount-engine.ts     # Cálculo de descontos
│   │   ├── conversation-manager.ts # Gerenciamento de conversas
│   │   ├── cart-manager.ts        # Carrinho de compras
│   │   ├── product-catalog.ts     # Catálogo de produtos
│   │   └── rate-limiter.ts        # Controle de taxa
│   └── main.ts                    # Arquivo principal
├── data/
│   ├── sessions/                  # Sessões WhatsApp
│   ├── conversations/             # Histórico de conversas
│   ├── carts/                     # Carrinhos de compra
│   ├── media/                     # Mídia recebida
│   └── logs/                      # Logs do sistema
├── test-system.ts                 # Testes do sistema
├── package.json
├── tsconfig.json
└── README.md
```

## 🎯 Funcionalidades

### **Detecção de Perfis**
- **Pastor**: Desconto 20%, linguagem formal, conhecimento bíblico
- **Jovem**: Desconto 10%, linguagem moderna, produtos fashion
- **Mãe**: Desconto 15%, tom maternal, produtos familiares
- **Fiel**: Desconto 5%, evangelização, produtos tradicionais

### **Comandos Especiais**
- `catálogo` - Mostrar todos os produtos
- `orar` - Oferecer oração personalizada
- `testemunho` - Compartilhar testemunho
- `versículo` - Versículo do dia
- `finalizar` - Finalizar compra
- `carrinho` - Ver itens no carrinho

### **Sistema de Descontos**
- **Perfil**: 5-20% baseado no tipo de cliente
- **Fidelidade**: +2% por compra anterior
- **Sazonal**: 20% em datas especiais
- **Carrinho abandonado**: 15% para recuperação
- **Volume**: 5-15% para compras grandes

## 🔧 Configuração Avançada

### **Rate Limiting**
```typescript
// Configurar limite de mensagens
const rateLimiter = new RateLimiter(50, 60000); // 50 msg/min
```

### **Logs**
```typescript
// Configurar nível de log
const logger = pino({
  level: 'info', // debug, info, warn, error
  transport: {
    target: 'pino-pretty'
  }
});
```

### **Produtos Personalizados**
```typescript
// Adicionar novo produto
const catalog = new ProductCatalog();
catalog.addProduct({
  id: 'novo-produto',
  name: 'Novo Produto',
  price: 99.99,
  category: 'biblia'
});
```

## 📊 Monitoramento

### **Logs Estruturados**
- Todas as interações são logadas
- Perfis detectados e confiança
- Descontos aplicados
- Produtos visualizados/comprados

### **Métricas Disponíveis**
- Total de clientes ativos
- Taxa de conversão
- Produtos mais vendidos
- Perfis mais comuns
- Tempo médio de resposta

## 🛡️ Segurança

- **Rate limiting** para prevenir spam
- **Validação de entrada** em todas as mensagens
- **Sanitização** de dados do usuário
- **Logs de auditoria** para todas as ações
- **Backup automático** de sessões

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- **Novo Israel** - Pela confiança e visão
- **OpenAI** - Pela tecnologia GPT
- **Baileys** - Pela biblioteca WhatsApp
- **Comunidade Open Source** - Pelo suporte

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Email: suporte@novoisrael.com
- WhatsApp: +55 21 99999-9999
- Documentação: [Wiki do Projeto]

---

**Deus abençoe! 🙏✨**
