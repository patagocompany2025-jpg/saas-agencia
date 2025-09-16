# 📁 Estrutura Detalhada do Projeto

## Visão Geral da Estrutura

```
NOVO-AI-AUTOMATION/
├── 📁 agentes/                           # Agentes de IA especializados
├── 📁 docs/                             # Documentação centralizada
├── 📁 scripts/                          # Scripts utilitários
├── 📁 src/                              # Código principal compartilhado
├── 📄 arquivos de configuração          # Configurações do projeto
└── 📄 arquivos de documentação          # Documentação principal
```

## 📁 Detalhamento por Diretório

### `/agentes/` - Agentes de IA Especializados

```
agentes/
└── dev1_alex/                           # Desenvolvedor/Agente principal
    └── mega_vendedor_ai/                # Bot de vendas inteligente
        ├── 📁 src/                      # Código fonte TypeScript
        ├── 📁 dist/                     # Código compilado (build)
        ├── 📁 tests/                    # Testes unitários
        ├── 📁 .wa_auth/                 # Sessões WhatsApp (gerado)
        ├── 📁 logs/                     # Logs do sistema (gerado)
        ├── 📄 package.json              # Dependências do agente
        ├── 📄 tsconfig.json             # Configuração TypeScript
        ├── 📄 jest.config.js            # Configuração de testes
        └── 📄 README.md                 # Documentação do agente
```

**Propósito**: Contém o bot principal de vendas que processa mensagens WhatsApp e integra com IA.

### `/docs/` - Documentação Centralizada

```
docs/
├── 📄 arquitetura.md                    # Diagramas e arquitetura
├── 📄 estrutura-projeto.md              # Este arquivo
├── 📄 banco-dados.md                    # Schema e relacionamentos
├── 📄 apis.md                          # Documentação das APIs
├── 📄 logs-testes.md                   # Configuração de logs e testes
└── 📄 deployment.md                    # Guia de deploy
```

**Propósito**: Centraliza toda a documentação técnica do projeto.

### `/scripts/` - Scripts Utilitários

```
scripts/
├── 📄 oauth-server.js                   # Servidor de callback OAuth
├── 📄 make-auth-url.js                  # Gerador de URL de autorização
├── 📄 exchange-code.js                  # Troca code por tokens
└── 📄 audit-oauth-setup.js             # Auditoria de configuração OAuth
```

**Propósito**: Scripts auxiliares para configuração e manutenção do sistema.

### `/src/` - Código Principal Compartilhado

```
src/
├── 📁 lib/                              # Bibliotecas compartilhadas
│   ├── 📄 apiClient.js                  # Cliente HTTP com Bearer
│   └── 📄 tokenManager.js               # Gerenciamento de tokens OAuth
├── 📁 jobs/                             # Jobs agendados
│   └── 📄 refreshCron.js                # Renovação automática de tokens
└── 📁 utils/                            # Utilitários compartilhados
    ├── 📄 honorific.ts                  # Tratamentos honoríficos
    └── 📄 titles.ts                     # Títulos e cargos
```

**Propósito**: Código compartilhado entre diferentes partes do sistema.

## 📁 Estrutura Detalhada do Mega Vendedor AI

### `/agentes/dev1_alex/mega_vendedor_ai/src/`

```
src/
├── 📁 config/                           # Configurações
│   └── 📄 prompts.ts                    # Prompts do sistema IA
├── 📁 data/                             # Dados estáticos
│   ├── 📄 catalog.json                  # Catálogo de produtos
│   ├── 📄 knowledge-base.ts             # Base de conhecimento
│   └── 📄 sales-prompts.ts              # Prompts de vendas
├── 📁 routes/                           # Rotas da API
│   ├── 📄 webhook.ts                    # Webhook WhatsApp
│   └── 📄 whatsapp.ts                   # Rotas WhatsApp
├── 📁 services/                         # Serviços de negócio
│   ├── 📄 conta-azul-service.ts         # Integração Conta Azul
│   ├── 📄 discount-calculator.ts        # Cálculo de descontos
│   ├── 📄 gpt-novo-israel.ts            # Serviço GPT principal
│   ├── 📄 gpt-service.ts                # Serviço GPT genérico
│   ├── 📄 learning-system.ts            # Sistema de aprendizado
│   ├── 📄 product-search-service.ts     # Busca de produtos
│   ├── 📄 profile-detector.ts           # Detecção de perfil
│   └── 📄 supabaseClient.ts             # Cliente Supabase
├── 📁 types/                            # Definições TypeScript
│   └── 📄 interfaces.ts                 # Interfaces principais
├── 📁 utils/                            # Utilitários
│   ├── 📄 daykey.ts                     # Chaves de data
│   ├── 📄 dedupe.ts                     # Deduplicação
│   ├── 📄 greetings.ts                  # Saudações
│   ├── 📄 honorific.ts                  # Tratamentos
│   ├── 📄 logger.ts                     # Sistema de logs
│   ├── 📄 message.ts                    # Processamento de mensagens
│   ├── 📄 name.ts                       # Extração de nomes
│   ├── 📄 nlu.ts                        # Processamento de linguagem natural
│   ├── 📄 phone.ts                      # Processamento de telefones
│   ├── 📄 session.ts                    # Gestão de sessões
│   ├── 📄 titles.ts                     # Títulos e cargos
│   └── 📄 validator.ts                  # Validações
├── 📁 whatsapp/                         # Handler WhatsApp
│   └── 📄 whatsappHandler.ts            # Processamento principal
└── 📄 index.ts                          # Ponto de entrada
```

## 📄 Arquivos de Configuração Raiz

### Arquivos de Ambiente
- `env.dev.template` - Template para desenvolvimento
- `env.prod.template` - Template para produção
- `.env` - Variáveis de ambiente (não commitado)

### Arquivos de Dependências
- `package.json` - Dependências principais
- `package-lock.json` - Lock de versões
- `tokens.json` - Tokens OAuth (não commitado)

### Arquivos de Documentação
- `README.md` - Documentação principal
- `README-OAUTH.md` - Documentação específica OAuth

### Arquivos de Servidor
- `server.js` - Servidor principal Express
- `conta-azul-server.js` - Servidor específico Conta Azul
- `oauth-callback-server.js` - Servidor de callback

## 📄 Arquivos de Integração

### Scripts de Teste
- `test-*.js` - Vários arquivos de teste
- `diagnostico-*.js` - Scripts de diagnóstico
- `investigacao-*.js` - Scripts de investigação

### Scripts de OAuth
- `gerar-url-*.js` - Geração de URLs OAuth
- `obter-*.js` - Obtenção de tokens
- `resolver-tokens-*.js` - Resolução de problemas

## 🗂️ Arquivos Gerados Automaticamente

### Sessões WhatsApp
- `.wa_auth/` - Diretório de sessões (criado automaticamente)
- Contém arquivos de autenticação do WhatsApp Web

### Logs
- `logs/` - Diretório de logs (criado automaticamente)
- Logs de erro e debug do sistema

### Build
- `dist/` - Código compilado TypeScript (criado no build)
- Contém JavaScript compilado para produção

## 📋 Convenções de Nomenclatura

### Arquivos TypeScript
- `camelCase.ts` - Arquivos de código
- `kebab-case.ts` - Arquivos de configuração

### Arquivos JavaScript
- `kebab-case.js` - Scripts utilitários
- `camelCase.js` - Módulos principais

### Diretórios
- `kebab-case/` - Diretórios de funcionalidades
- `camelCase/` - Diretórios de componentes

## 🔍 Arquivos Importantes por Funcionalidade

### Autenticação OAuth
- `src/lib/tokenManager.js` - Gerenciamento de tokens
- `scripts/oauth-server.js` - Servidor de callback
- `tokens.json` - Armazenamento de tokens

### WhatsApp
- `agentes/dev1_alex/mega_vendedor_ai/src/whatsapp/whatsappHandler.ts`
- `agentes/dev1_alex/mega_vendedor_ai/src/services/whatsapp-baileys.ts`

### Integração Conta Azul
- `agentes/dev1_alex/mega_vendedor_ai/src/services/conta-azul-service.ts`
- `src/lib/apiClient.js`

### IA e Processamento
- `agentes/dev1_alex/mega_vendedor_ai/src/services/gpt-novo-israel.ts`
- `agentes/dev1_alex/mega_vendedor_ai/src/config/prompts.ts`

### Banco de Dados
- `agentes/dev1_alex/mega_vendedor_ai/src/services/supabaseClient.ts`

## 🚀 Pontos de Entrada

### Desenvolvimento
1. `npm start` - Servidor principal
2. `cd agentes/dev1_alex/mega_vendedor_ai && npm run dev` - Bot WhatsApp

### Produção
1. `npm start` - Servidor principal
2. `cd agentes/dev1_alex/mega_vendedor_ai && npm run build && npm start` - Bot WhatsApp

### Testes
1. `cd agentes/dev1_alex/mega_vendedor_ai && npm test` - Testes unitários
2. `npm run audit` - Auditoria de configuração
