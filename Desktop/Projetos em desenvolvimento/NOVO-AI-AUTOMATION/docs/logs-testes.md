# 📊 Logs e Testes - Configuração e Uso

## 🔍 Sistema de Logs

### Configuração de Logs

O sistema utiliza **Pino** como logger principal para performance e estruturação de logs.

#### Logger Principal (Mega Vendedor AI)

```typescript
// src/utils/logger.ts
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

export { logger };
```

#### Configuração por Ambiente

```env
# Desenvolvimento
LOG_LEVEL=debug
LOG_FORMAT=pretty

# Produção
LOG_LEVEL=warn
LOG_FORMAT=json
```

### Estrutura de Logs

#### Logs de WhatsApp
```typescript
logger.info({
  phone: '11999999999',
  message: 'Olá, gostaria de saber sobre bíblias',
  intent: 'produto_biblia',
  response: 'Temos várias opções de bíblias...',
  processingTime: 1250
}, 'Mensagem processada com sucesso');
```

#### Logs de OAuth
```typescript
logger.info({
  action: 'token_refresh',
  clientId: '7f178p84rfk7phnkq2bbthk3m1',
  success: true,
  expiresIn: 3600
}, 'Token renovado com sucesso');
```

#### Logs de IA
```typescript
logger.info({
  model: 'gpt-4o-mini',
  tokens: 150,
  cost: 0.0003,
  responseTime: 2100
}, 'Resposta IA gerada');
```

### Categorias de Logs

#### 1. Logs de Acesso
- **Arquivo**: `logs/access.log`
- **Conteúdo**: Requisições HTTP, status codes, tempo de resposta
- **Rotação**: Diária

#### 2. Logs de Erro
- **Arquivo**: `logs/error.log`
- **Conteúdo**: Erros de aplicação, exceções, falhas
- **Rotação**: Diária

#### 3. Logs de WhatsApp
- **Arquivo**: `logs/whatsapp.log`
- **Conteúdo**: Mensagens recebidas/enviadas, processamento
- **Rotação**: Diária

#### 4. Logs de IA
- **Arquivo**: `logs/ai.log`
- **Conteúdo**: Chamadas OpenAI, tokens, custos
- **Rotação**: Diária

#### 5. Logs de OAuth
- **Arquivo**: `logs/oauth.log`
- **Conteúdo**: Autenticação, renovação de tokens
- **Rotação**: Diária

### Configuração de Rotação

```javascript
// scripts/log-rotation.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});
```

## 🧪 Sistema de Testes

### Configuração Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000
};
```

### Estrutura de Testes

```
src/
├── __tests__/
│   ├── setup.ts                    # Configuração global
│   ├── mocks/                      # Mocks e fixtures
│   │   ├── openai.mock.ts
│   │   ├── whatsapp.mock.ts
│   │   └── supabase.mock.ts
│   ├── services/                   # Testes de serviços
│   │   ├── gpt-service.test.ts
│   │   ├── conta-azul.test.ts
│   │   └── supabase.test.ts
│   ├── utils/                      # Testes de utilitários
│   │   ├── nlu.test.ts
│   │   ├── profile-detector.test.ts
│   │   └── phone.test.ts
│   └── integration/                # Testes de integração
│       ├── whatsapp-flow.test.ts
│       └── oauth-flow.test.ts
```

### Testes Unitários

#### Teste de Serviço GPT

```typescript
// src/__tests__/services/gpt-service.test.ts
import { GPTMegaVendedorService } from '../../services/gpt-novo-israel';
import { mockOpenAI } from '../mocks/openai.mock';

jest.mock('openai', () => mockOpenAI);

describe('GPTMegaVendedorService', () => {
  let service: GPTMegaVendedorService;

  beforeEach(() => {
    service = new GPTMegaVendedorService();
  });

  describe('processMessage', () => {
    it('deve processar mensagem de cliente novo', async () => {
      const userProfile = {
        type: 'fiel',
        discount: 0,
        name: 'João',
        phone: '11999999999'
      };

      const result = await service.processMessage(
        '11999999999',
        'Olá, gostaria de saber sobre bíblias',
        userProfile
      );

      expect(result).toHaveProperty('response');
      expect(result.response).toContain('bíblia');
    });

    it('deve aplicar desconto para pastor', async () => {
      const userProfile = {
        type: 'pastor',
        discount: 20,
        name: 'Pastor João',
        phone: '11999999999'
      };

      const result = await service.processMessage(
        '11999999999',
        'Quero comprar uma bíblia',
        userProfile
      );

      expect(result.response).toContain('20%');
    });
  });
});
```

#### Teste de Detecção de Perfil

```typescript
// src/__tests__/utils/profile-detector.test.ts
import { detectarTitulo } from '../../utils/titles';

describe('Detecção de Título', () => {
  it('deve detectar pastor', () => {
    const texto = 'Sou pastor da igreja';
    const titulo = detectarTitulo(texto);
    expect(titulo).toBe('Pastor');
  });

  it('deve detectar bispo', () => {
    const texto = 'Bispo João Silva';
    const titulo = detectarTitulo(texto);
    expect(titulo).toBe('Bispo');
  });

  it('deve retornar null para texto sem título', () => {
    const texto = 'Olá, como vai?';
    const titulo = detectarTitulo(texto);
    expect(titulo).toBeNull();
  });
});
```

### Testes de Integração

#### Teste de Fluxo WhatsApp

```typescript
// src/__tests__/integration/whatsapp-flow.test.ts
import { startWhatsApp } from '../../whatsapp/whatsappHandler';
import { mockWhatsApp } from '../mocks/whatsapp.mock';

jest.mock('@whiskeysockets/baileys', () => mockWhatsApp);

describe('Fluxo WhatsApp', () => {
  it('deve processar mensagem de texto', async () => {
    const mockMessage = {
      key: { id: 'test123', fromMe: false, remoteJid: '11999999999@s.whatsapp.net' },
      message: {
        conversation: 'Olá, gostaria de saber sobre bíblias'
      }
    };

    const sock = await startWhatsApp();
    
    // Simula recebimento de mensagem
    sock.ev.emit('messages.upsert', {
      type: 'notify',
      messages: [mockMessage]
    });

    // Aguarda processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verifica se resposta foi enviada
    expect(mockWhatsApp.sendMessage).toHaveBeenCalled();
  });
});
```

### Mocks e Fixtures

#### Mock OpenAI

```typescript
// src/__tests__/mocks/openai.mock.ts
export const mockOpenAI = {
  chat: {
    completions: {
      create: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'Resposta mockada da IA'
          }
        }],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 100,
          total_tokens: 150
        }
      })
    }
  }
};
```

#### Mock WhatsApp

```typescript
// src/__tests__/mocks/whatsapp.mock.ts
export const mockWhatsApp = {
  makeWASocket: jest.fn(() => ({
    ev: {
      on: jest.fn(),
      emit: jest.fn()
    },
    sendMessage: jest.fn(),
    sendPresenceUpdate: jest.fn()
  })),
  useMultiFileAuthState: jest.fn().mockResolvedValue({
    state: {},
    saveCreds: jest.fn()
  }),
  fetchLatestBaileysVersion: jest.fn().mockResolvedValue({
    version: [2, 2413, 1]
  })
};
```

### Scripts de Teste

#### package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration",
    "test:unit": "jest --testPathPattern=__tests__/services|__tests__/utils",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

#### Execução de Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage

# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Testes para CI/CD
npm run test:ci
```

### Configuração de CI/CD

#### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Testes

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
```

### Monitoramento de Testes

#### Métricas de Cobertura

```typescript
// src/__tests__/coverage-thresholds.ts
export const coverageThresholds = {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/services/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
};
```

#### Relatórios de Teste

```bash
# Gerar relatório HTML
npm run test:coverage

# Abrir relatório no navegador
open coverage/lcov-report/index.html
```

### Logs de Teste

#### Configuração de Logs para Testes

```typescript
// src/__tests__/setup.ts
import { logger } from '../utils/logger';

// Reduzir verbosidade dos logs durante testes
if (process.env.NODE_ENV === 'test') {
  logger.level = 'error';
}

// Mock de logger para testes
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));
```

### Debugging de Testes

#### Configuração de Debug

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Performance de Testes

#### Otimizações

```javascript
// jest.config.js
module.exports = {
  // Executar testes em paralelo
  maxWorkers: '50%',
  
  // Cache de módulos
  cache: true,
  
  // Timeout para testes
  testTimeout: 10000,
  
  // Ignorar arquivos desnecessários
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ]
};
```

## 📊 Dashboards e Monitoramento

### Métricas de Logs

- **Volume de mensagens por hora**
- **Taxa de erro por serviço**
- **Tempo de resposta médio**
- **Uso de tokens OpenAI**

### Alertas

- **Taxa de erro > 5%**
- **Tempo de resposta > 5s**
- **Falha na renovação de tokens**
- **Erro na conexão WhatsApp**

### Relatórios

- **Relatório diário de performance**
- **Relatório semanal de cobertura de testes**
- **Relatório mensal de custos OpenAI**
