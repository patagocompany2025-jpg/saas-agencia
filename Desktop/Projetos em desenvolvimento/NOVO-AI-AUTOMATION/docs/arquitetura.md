# 🏗️ Arquitetura do Sistema NOVO AI AUTOMATION

## Diagrama de Arquitetura Geral

```mermaid
graph TB
    subgraph "👥 Usuários"
        CLIENTE[Cliente WhatsApp]
        ADMIN[Administrador Web]
    end
    
    subgraph "📱 Frontend/Interface"
        WA[WhatsApp Web<br/>Baileys]
        WEB[Interface Web<br/>Express.js]
    end
    
    subgraph "🤖 Backend Core"
        MEGA[Mega Vendedor AI<br/>TypeScript]
        OAUTH[OAuth2 Server<br/>Node.js]
        API[API Gateway<br/>Express.js]
        CRON[Jobs Agendados<br/>node-cron]
    end
    
    subgraph "🧠 Serviços de IA"
        OPENAI[OpenAI GPT-4<br/>API]
        PROFILE[Detector de Perfil<br/>Local]
        NLU[Processamento NLU<br/>Local]
    end
    
    subgraph "🔗 Integrações Externas"
        CONTA[Conta Azul API<br/>OAuth2]
        SUPABASE[Supabase<br/>PostgreSQL]
    end
    
    subgraph "💾 Armazenamento Local"
        TOKENS[Tokens OAuth<br/>tokens.json]
        LOGS[Logs Sistema<br/>Arquivos]
        SESSIONS[Sessões WA<br/>.wa_auth/]
        CACHE[Cache Produtos<br/>Memória]
    end
    
    subgraph "📊 Dados"
        DB_CUSTOMERS[Clientes<br/>customers]
        DB_PRODUCTS[Produtos<br/>products]
        DB_TRANSACTIONS[Transações<br/>transactions]
        DB_CONVERSATIONS[Conversas<br/>conversations]
    end
    
    %% Conexões principais
    CLIENTE --> WA
    ADMIN --> WEB
    
    WA --> MEGA
    WEB --> API
    
    MEGA --> OPENAI
    MEGA --> PROFILE
    MEGA --> NLU
    MEGA --> CONTA
    MEGA --> SUPABASE
    
    OAUTH --> CONTA
    OAUTH --> TOKENS
    
    API --> MEGA
    CRON --> MEGA
    
    CONTA --> CACHE
    SUPABASE --> DB_CUSTOMERS
    SUPABASE --> DB_PRODUCTS
    SUPABASE --> DB_TRANSACTIONS
    SUPABASE --> DB_CONVERSATIONS
    
    MEGA --> LOGS
    MEGA --> SESSIONS
    MEGA --> CACHE
```

## Fluxo de Dados Detalhado

### 1. Fluxo de Mensagem WhatsApp

```mermaid
sequenceDiagram
    participant C as Cliente
    participant WA as WhatsApp
    participant M as Mega Vendedor AI
    participant AI as OpenAI
    participant CA as Conta Azul
    participant DB as Supabase
    
    C->>WA: Envia mensagem
    WA->>M: Processa mensagem
    M->>DB: Busca cliente
    M->>AI: Gera resposta personalizada
    AI-->>M: Resposta IA
    M->>CA: Busca produtos (se necessário)
    CA-->>M: Lista produtos
    M->>WA: Envia resposta
    WA->>C: Cliente recebe resposta
    M->>DB: Salva conversa
```

### 2. Fluxo OAuth Conta Azul

```mermaid
sequenceDiagram
    participant U as Usuário
    participant S as Servidor OAuth
    participant CA as Conta Azul
    participant T as Token Storage
    
    U->>S: Acessa /auth/start
    S->>CA: Redireciona para autorização
    CA->>U: Página de login
    U->>CA: Autoriza aplicação
    CA->>S: Retorna código (callback)
    S->>CA: Troca código por tokens
    CA-->>S: Access + Refresh tokens
    S->>T: Salva tokens
    S->>U: Confirma autorização
```

## Componentes do Sistema

### 🤖 Mega Vendedor AI
- **Responsabilidade**: Processamento de mensagens WhatsApp
- **Tecnologias**: TypeScript, Baileys, OpenAI
- **Funcionalidades**:
  - Detecção de perfil do cliente
  - Geração de respostas personalizadas
  - Busca de produtos
  - Gestão de conversas

### 🔐 OAuth2 Server
- **Responsabilidade**: Autenticação com Conta Azul
- **Tecnologias**: Node.js, Express
- **Funcionalidades**:
  - Geração de URLs de autorização
  - Troca de códigos por tokens
  - Renovação automática de tokens
  - Gestão de sessões

### 🌐 API Gateway
- **Responsabilidade**: Interface web e APIs
- **Tecnologias**: Express.js
- **Funcionalidades**:
  - Health checks
  - Status de serviços
  - Webhooks
  - Métricas

### 🗄️ Banco de Dados (Supabase)
- **Tecnologia**: PostgreSQL
- **Tabelas**:
  - `customers` - Dados dos clientes
  - `products` - Catálogo de produtos
  - `transactions` - Vendas realizadas
  - `conversations` - Histórico de conversas

## Padrões Arquiteturais

### 1. Microserviços
- Cada componente tem responsabilidade específica
- Comunicação via APIs REST
- Desenvolvimento independente

### 2. Event-Driven
- Processamento assíncrono de mensagens
- Jobs agendados para manutenção
- Webhooks para integrações

### 3. Repository Pattern
- Abstração de acesso a dados
- Facilita testes e manutenção
- Suporte a múltiplas fontes

### 4. Strategy Pattern
- Diferentes estratégias de resposta por perfil
- Detecção de intenções modular
- Fácil extensão de funcionalidades

## Considerações de Escalabilidade

### Horizontal
- Múltiplas instâncias do Mega Vendedor AI
- Load balancer para WhatsApp
- Cache distribuído

### Vertical
- Otimização de queries
- Compressão de dados
- Pool de conexões

### Monitoramento
- Logs centralizados
- Métricas de performance
- Alertas automáticos

## Segurança

### Autenticação
- OAuth 2.0 para APIs externas
- JWT para sessões internas
- Rate limiting

### Dados
- Criptografia de tokens
- Validação de entrada
- Sanitização de dados

### Comunicação
- HTTPS obrigatório
- Validação de webhooks
- Logs de auditoria
