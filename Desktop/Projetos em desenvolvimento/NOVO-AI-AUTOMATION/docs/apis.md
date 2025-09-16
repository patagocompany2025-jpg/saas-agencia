# 🔌 Documentação das APIs

## Visão Geral

O sistema possui múltiplas APIs que trabalham em conjunto:

1. **Servidor Principal** (porta 5000) - OAuth e APIs gerais
2. **Mega Vendedor AI** - Webhook WhatsApp e processamento
3. **Conta Azul API** - Integração externa
4. **OpenAI API** - Serviços de IA

## 🌐 Servidor Principal (Express.js)

### Base URL
```
http://localhost:5000
```

### Endpoints Disponíveis

#### 🔍 Health Check

**GET** `/health`

Verifica o status geral do servidor.

**Resposta:**
```json
{
  "ok": true,
  "has_access_token": true,
  "has_refresh_token": true
}
```

**Status Codes:**
- `200` - Servidor funcionando
- `500` - Erro interno

---

#### 🔐 OAuth Status

**GET** `/health/oauth`

Verifica o status da autenticação OAuth com Conta Azul.

**Resposta:**
```json
{
  "ok": true,
  "tokenPreview": "eyJraWQiOiJUa1BRbWs0UlR3M3RuWlZXcDdEanBURFhcL2RTaj..."
}
```

**Status Codes:**
- `200` - OAuth funcionando
- `500` - Erro na autenticação

---

#### 🔗 URL de Autorização

**GET** `/oauth/dev-url`

Gera URL de autorização para desenvolvimento.

**Resposta:**
```
https://auth.contaazul.com/oauth2/authorize?response_type=code&client_id=...
```

**Status Codes:**
- `200` - URL gerada com sucesso
- `500` - Erro na configuração

---

#### 🚀 Iniciar Autorização

**GET** `/auth/start`

Inicia o fluxo de autorização OAuth (método legado).

**Resposta:**
Redireciona para página de autorização da Conta Azul.

**Status Codes:**
- `302` - Redirecionamento
- `500` - Erro na configuração

---

#### 📞 Callback OAuth

**GET** `/callback`

Endpoint de callback para receber código de autorização.

**Parâmetros:**
- `code` (string) - Código de autorização
- `state` (string) - Estado para validação

**Resposta:**
```html
<h2>✅ Tokens salvos!</h2>
<p>Arquivo: <code>tokens.json</code></p>
<pre>{...tokens}</pre>
```

**Status Codes:**
- `200` - Tokens salvos com sucesso
- `400` - Código ou estado inválido
- `500` - Erro ao trocar tokens

---

## 🤖 Mega Vendedor AI APIs

### Webhook WhatsApp

**POST** `/webhook/whatsapp`

Processa mensagens recebidas do WhatsApp.

**Headers:**
```
Content-Type: application/json
X-Hub-Signature: sha1=...
```

**Body:**
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15551234567",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "contacts": [
              {
                "profile": {
                  "name": "John Doe"
                },
                "wa_id": "15551234567"
              }
            ],
            "messages": [
              {
                "from": "15551234567",
                "id": "wamid.xxx",
                "timestamp": "1234567890",
                "type": "text",
                "text": {
                  "body": "Olá, gostaria de saber sobre bíblias"
                }
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

**Resposta:**
```json
{
  "success": true,
  "messageId": "wamid.xxx",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🔗 Conta Azul API Integration

### Base URL
```
https://api.contaazul.com/v1
```

### Autenticação
```
Authorization: Bearer {access_token}
```

### Endpoints Utilizados

#### 📋 Listar Contatos

**GET** `/contacts`

Lista contatos da Conta Azul.

**Parâmetros:**
- `limit` (integer) - Limite de resultados (padrão: 10)
- `offset` (integer) - Offset para paginação

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "phone": "11999999999",
      "document": "12345678901"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 100
  }
}
```

#### 📦 Listar Produtos

**GET** `/products`

Lista produtos da Conta Azul.

**Parâmetros:**
- `limit` (integer) - Limite de resultados
- `offset` (integer) - Offset para paginação
- `active` (boolean) - Filtrar por produtos ativos

**Resposta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Bíblia Sagrada",
      "price": 29.90,
      "stock": 100,
      "category": "Livros",
      "sku": "BIB001"
    }
  ]
}
```

#### 🛒 Criar Venda

**POST** `/sales`

Cria uma nova venda.

**Body:**
```json
{
  "customer": {
    "id": "customer_uuid"
  },
  "items": [
    {
      "product": {
        "id": "product_uuid"
      },
      "quantity": 1,
      "price": 29.90
    }
  ],
  "payment": {
    "method": "credit_card",
    "installments": 1
  }
}
```

**Resposta:**
```json
{
  "id": "sale_uuid",
  "number": "000001",
  "status": "completed",
  "total": 29.90,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 🧠 OpenAI API Integration

### Base URL
```
https://api.openai.com/v1
```

### Autenticação
```
Authorization: Bearer {api_key}
```

### Endpoints Utilizados

#### 💬 Chat Completions

**POST** `/chat/completions`

Gera respostas usando GPT-4.

**Body:**
```json
{
  "model": "gpt-4o-mini",
  "temperature": 0.6,
  "messages": [
    {
      "role": "system",
      "content": "Você é o Mega Vendedor AI da loja Novo Israel..."
    },
    {
      "role": "user",
      "content": "Olá, gostaria de saber sobre bíblias"
    }
  ]
}
```

**Resposta:**
```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Olá! Temos várias opções de bíblias..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 100,
    "total_tokens": 150
  }
}
```

---

## 📊 Supabase API Integration

### Base URL
```
https://{project_id}.supabase.co/rest/v1
```

### Autenticação
```
Authorization: Bearer {anon_key}
apikey: {anon_key}
```

### Endpoints Utilizados

#### 👥 Clientes

**GET** `/customers`

Lista clientes.

**Headers:**
```
Authorization: Bearer {anon_key}
apikey: {anon_key}
```

**Resposta:**
```json
[
  {
    "id": "uuid",
    "phone": "11999999999",
    "nome": "João Silva",
    "titulo": "Pastor",
    "saldo_pontos": 100.00,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**POST** `/customers`

Cria/atualiza cliente.

**Body:**
```json
{
  "phone": "11999999999",
  "nome": "João Silva",
  "titulo": "Pastor"
}
```

---

## 🔧 Scripts de API

### Scripts OAuth

#### Gerar URL de Autorização
```bash
npm run oauth:url
```

#### Trocar Code por Tokens
```bash
npm run oauth:exchange -- <CODE>
```

#### Iniciar Servidor Callback
```bash
npm run oauth:callback
```

### Scripts de Teste

#### Testar Conexão Conta Azul
```bash
node testar-api-conta-azul.js
```

#### Testar OAuth Setup
```bash
node test-oauth-setup.js
```

#### Diagnóstico Completo
```bash
node diagnostico-oauth-completo.js
```

---

## 📝 Códigos de Status HTTP

### Sucesso
- `200` - OK
- `201` - Criado
- `204` - Sem conteúdo

### Redirecionamento
- `302` - Redirecionamento temporário

### Erro do Cliente
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Proibido
- `404` - Não encontrado
- `422` - Entidade não processável

### Erro do Servidor
- `500` - Erro interno
- `502` - Bad Gateway
- `503` - Serviço indisponível

---

## 🔒 Segurança

### Rate Limiting
- WhatsApp: 50 mensagens por minuto
- OpenAI: Conforme limites da API
- Conta Azul: Conforme limites da API

### Validação de Entrada
- Sanitização de dados
- Validação de tipos
- Verificação de tamanho

### Logs de Auditoria
- Todas as requisições são logadas
- Dados sensíveis são mascarados
- Logs são rotacionados automaticamente

---

## 🚨 Tratamento de Erros

### Padrão de Resposta de Erro
```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Token de acesso inválido ou expirado",
    "details": {
      "field": "authorization",
      "value": "Bearer invalid_token"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req_123456"
}
```

### Códigos de Erro Personalizados
- `INVALID_TOKEN` - Token inválido
- `RATE_LIMIT_EXCEEDED` - Limite de taxa excedido
- `CUSTOMER_NOT_FOUND` - Cliente não encontrado
- `PRODUCT_NOT_FOUND` - Produto não encontrado
- `AI_SERVICE_ERROR` - Erro no serviço de IA
- `WHATSAPP_ERROR` - Erro no WhatsApp

---

## 📈 Monitoramento

### Métricas Disponíveis
- Requisições por minuto
- Taxa de erro por endpoint
- Tempo de resposta médio
- Uso de tokens OpenAI
- Mensagens processadas

### Health Checks
- `/health` - Status geral
- `/health/oauth` - Status OAuth
- `/health/whatsapp` - Status WhatsApp
- `/health/ai` - Status IA

### Logs
- Logs de acesso
- Logs de erro
- Logs de auditoria
- Logs de performance
