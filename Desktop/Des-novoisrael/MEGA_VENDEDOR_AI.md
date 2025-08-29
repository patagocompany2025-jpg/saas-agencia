# 🚀 Mega Vendedor AI - Sistema Completo

## 📋 Visão Geral

Sistema de vendas automatizadas via WhatsApp com IA, focado em robustez e integração externa. Sem dashboard web - apenas logs console e APIs REST.

## 🎯 Funcionalidades Principais

### ✅ 1. Conexão Estável WhatsApp
- **Baileys**: Conexão robusta com reconexão automática
- **QR Code**: Geração automática no console
- **Health Check**: Monitoramento contínuo da conexão
- **Reconexão**: Automática em caso de desconexão

### ✅ 2. Processamento Mensagens GPT-4
- **IA Inteligente**: Respostas personalizadas por perfil
- **Contexto**: Histórico de conversa mantido
- **Prompts**: Otimizados para vendas cristãs
- **Fallback**: Respostas de emergência em caso de erro

### ✅ 3. Detecção Perfis + Descontos
- **Pastor**: 20% desconto (igreja, bíblias, congregação)
- **Jovem**: 10% desconto (camisetas, linguagem casual)
- **Mãe**: 15% desconto (batismo, família, materiais)
- **Fiel**: 5% desconto (cliente geral)

### ✅ 4. Logs Detalhados Console
- **Pino**: Logs coloridos e estruturados
- **Níveis**: Info, Warn, Error
- **Timestamps**: Precisos para debugging
- **Performance**: Monitoramento de tempo de resposta

### ✅ 5. API Endpoints Integração
- **REST**: Endpoints para integração externa
- **CORS**: Configurado para cross-origin
- **Helmet**: Segurança HTTP
- **JSON**: Respostas padronizadas

### ✅ 6. Health Check Simples
- **Status**: Verificação de saúde do sistema
- **Métricas**: Uptime, conexões, perfis ativos
- **Monitoramento**: Automático a cada minuto

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
cp temp_env.txt .env
# Edite o arquivo .env com suas configurações
```

### 3. Executar Sistema
```bash
npm run dev
```

## 📊 API Endpoints

### Health Check
```bash
GET /health
```
**Resposta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "whatsapp": "connected",
  "activeProfiles": 5,
  "activeCarts": 3,
  "version": "1.0.0"
}
```

### Status Detalhado
```bash
GET /status
```
**Resposta:**
```json
{
  "whatsapp": "connected",
  "reconnectAttempts": 0,
  "activeProfiles": 5,
  "activeCarts": 3,
  "uptime": 3600,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### Estatísticas
```bash
GET /stats
```
**Resposta:**
```json
{
  "success": true,
  "stats": {
    "uptime": 3600,
    "whatsapp": "connected",
    "activeProfiles": 5,
    "activeCarts": 3,
    "abandonedCarts": 1,
    "reconnectAttempts": 0,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### Perfil do Cliente
```bash
GET /profile/:customerId
```
**Resposta:**
```json
{
  "success": true,
  "profile": {
    "id": "5511999999999@s.whatsapp.net",
    "profile": "pastor",
    "confidence": 0.95,
    "discount": 0.20,
    "lastInteraction": "2024-01-01T12:00:00.000Z",
    "totalPurchases": 3
  }
}
```

### Carrinho do Cliente
```bash
GET /cart/:customerId
```
**Resposta:**
```json
{
  "success": true,
  "cart": {
    "customerId": "5511999999999@s.whatsapp.net",
    "items": [
      {
        "productId": "biblia-nvi",
        "name": "Bíblia NVI",
        "price": 89.00,
        "quantity": 2
      }
    ],
    "total": 178.00,
    "discount": 0.20,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "lastActivity": "2024-01-01T12:00:00.000Z"
  }
}
```

### Carrinhos Abandonados
```bash
GET /abandoned-carts
```
**Resposta:**
```json
{
  "success": true,
  "count": 2,
  "carts": [
    {
      "customerId": "5511999999999@s.whatsapp.net",
      "items": [...],
      "total": 178.00,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "lastActivity": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### Enviar Mensagem Manual
```bash
POST /send-message
Content-Type: application/json

{
  "customerId": "5511999999999@s.whatsapp.net",
  "message": "Olá! Temos uma oferta especial para você!"
}
```

### Simular Mensagem (Teste)
```bash
POST /simulate-message
Content-Type: application/json

{
  "customerId": "5511999999999@s.whatsapp.net",
  "message": "Preciso de 50 bíblias para igreja"
}
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)
```env
# Servidor
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# OpenAI
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-4

# Empresa
COMPANY_NAME=Novo Israel
COMPANY_PHONE=5521999999999

# WhatsApp
WHATSAPP_SESSION_ID=novo-israel-bot

# Descontos
PASTOR_DISCOUNT=0.20
YOUNG_DISCOUNT=0.10
MOM_DISCOUNT=0.15
GENERAL_DISCOUNT=0.05
```

## 📱 Funcionamento do WhatsApp

### 1. Primeira Execução
- Sistema gera QR Code no console
- Escaneie com WhatsApp do número configurado
- Conexão estabelecida automaticamente

### 2. Reconexão Automática
- Monitoramento contínuo da conexão
- Reconexão automática em caso de queda
- Máximo 5 tentativas de reconexão

### 3. Processamento de Mensagens
- Recebimento automático de mensagens
- Detecção de perfil baseada no conteúdo
- Resposta personalizada via GPT-4
- Logs detalhados de todas as interações

## 🎯 Cenários de Venda

### Pastor - 50 Bíblias
```
Cliente: "Preciso de 50 bíblias para igreja"
Sistema: Detecta perfil "pastor" (20% desconto)
Resposta: Linguagem formal, foco em igreja, pacotes especiais
```

### Jovem - Camiseta de Fé
```
Cliente: "Essa camiseta de fé tá quanto?"
Sistema: Detecta perfil "jovem" (10% desconto)
Resposta: Linguagem casual, emojis, upsell de produtos
```

### Mãe - Materiais Batismo
```
Cliente: "Materiais para batismo do meu filho"
Sistema: Detecta perfil "mãe" (15% desconto)
Resposta: Tom maternal, kits completos, foco em família
```

## 📊 Monitoramento

### Logs em Tempo Real
- Todas as mensagens recebidas/enviadas
- Detecção de perfis
- Operações de carrinho
- Erros e warnings
- Health checks

### Métricas Disponíveis
- Uptime do sistema
- Status da conexão WhatsApp
- Perfis ativos
- Carrinhos ativos
- Carrinhos abandonados
- Tentativas de reconexão

## 🔒 Segurança

- **Helmet**: Headers de segurança HTTP
- **CORS**: Configurado para integração
- **Rate Limiting**: Proteção contra spam
- **Error Handling**: Tratamento de erros robusto
- **Graceful Shutdown**: Encerramento limpo

## 🚨 Troubleshooting

### Erro de Conexão WhatsApp
```bash
# Verificar logs
npm run dev

# Verificar status via API
curl http://localhost:3001/health
```

### Erro de OpenAI
```bash
# Verificar API Key
echo $OPENAI_API_KEY

# Testar endpoint
curl http://localhost:3001/test
```

### Erro de Porta
```bash
# Verificar porta em uso
netstat -an | grep 3001

# Alterar porta no .env
PORT=3002
```

## 📈 Performance

### Otimizações Implementadas
- **Cache**: Histórico de conversas limitado
- **Async/Await**: Processamento não-bloqueante
- **Memory Management**: Limpeza automática de dados
- **Connection Pooling**: Reutilização de conexões

### Métricas Esperadas
- **Latência**: < 2s para resposta GPT
- **Throughput**: 100+ mensagens/minuto
- **Uptime**: 99.9% disponibilidade
- **Memory**: < 500MB RAM

## 🎉 Conclusão

O **Mega Vendedor AI** é um sistema robusto e eficiente para vendas automatizadas via WhatsApp, com:

- ✅ **Conexão estável** com reconexão automática
- ✅ **IA inteligente** para respostas personalizadas
- ✅ **Detecção automática** de perfis e descontos
- ✅ **Logs detalhados** para monitoramento
- ✅ **APIs REST** para integração externa
- ✅ **Health checks** para monitoramento

**Sistema pronto para produção! 🚀**
