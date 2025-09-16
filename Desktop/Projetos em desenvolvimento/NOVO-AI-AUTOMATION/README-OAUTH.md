# Sistema OAuth 2.0 Conta Azul

Sistema completo de autenticação OAuth 2.0 para integração com a API do Conta Azul, com suporte a DEV e PROD.

## 🚀 Configuração Rápida

### 1. Configurar Ambiente DEV
```bash
# Copiar template de DEV
npm run dev:env

# Editar .env com suas credenciais DEV
# CLIENT_ID=seu_client_id_dev
# CLIENT_SECRET=seu_client_secret_dev
```

### 2. Configurar Ambiente PROD
```bash
# Copiar template de PROD
npm run prod:env

# Editar .env com suas credenciais PROD
# CLIENT_ID=seu_client_id_prod
# CLIENT_SECRET=seu_client_secret_prod
```

## 🔄 Fluxo de Autorização

### Passo 1: Iniciar Callback Server
```bash
npm run oauth:callback
```
Mantém rodando em `http://localhost:5173/oauth/callback`

### Passo 2: Gerar URL de Autorização
```bash
npm run oauth:url
```
Abra a URL no navegador e autorize a aplicação.

### Passo 3: Trocar Code por Tokens
```bash
npm run oauth:exchange -- <COLE_O_CODE_AQUI>
```

### Passo 4: Iniciar API Principal
```bash
npm start
```

## 🛠️ Rotas Disponíveis

- `GET /health/oauth` - Status do OAuth (token válido)
- `GET /oauth/dev-url` - URL de autorização para desenvolvimento
- `GET /auth/start` - Rota legada de autorização
- `GET /callback` - Callback legado
- `GET /health` - Health check geral

## 📁 Estrutura de Arquivos

```
├── scripts/
│   ├── oauth-server.js      # Servidor de callback
│   ├── make-auth-url.js     # Gerador de URL de autorização
│   └── exchange-code.js     # Troca code por tokens
├── src/
│   ├── lib/
│   │   ├── tokenManager.js  # Gerenciamento de tokens
│   │   └── apiClient.js     # Cliente HTTP com Bearer
│   └── jobs/
│       └── refreshCron.js   # Renovação automática
├── env.dev.template         # Template ambiente DEV
├── env.prod.template        # Template ambiente PROD
└── server.js               # Servidor principal
```

## 🔧 Uso da API

### Cliente HTTP Automático
```javascript
const { apiGet, apiPost } = require('./src/lib/apiClient');

// GET com Bearer automático
const response = await apiGet('https://api.contaazul.com/v1/customers');

// POST com Bearer automático
const result = await apiPost('https://api.contaazul.com/v1/sales', {
  customer: { id: 123 },
  items: [{ product: { id: 456 }, quantity: 1 }]
});
```

### Gerenciamento Manual de Tokens
```javascript
const { getAccessToken } = require('./src/lib/tokenManager');

const token = await getAccessToken(); // Renova automaticamente se necessário
```

## ⚙️ Configuração de Ambiente

### Variáveis Obrigatórias
- `AUTH_URL` - URL de autorização do Conta Azul
- `TOKEN_URL` - URL de troca de tokens
- `CLIENT_ID` - ID da aplicação
- `CLIENT_SECRET` - Secret da aplicação
- `REDIRECT_URI` - URI de callback

### Variáveis Opcionais
- `SCOPES` - Escopos de acesso (padrão: customer.read product.read sale.read)
- `EXTRA_AUTH_PARAMS` - Parâmetros extras para autorização
- `APP_PORT` - Porta da aplicação (padrão: 5000)

## 🔄 Renovação Automática

O sistema renova automaticamente os tokens 5 minutos antes do vencimento através de um cron job que roda a cada 5 minutos.

## 🚨 Troubleshooting

### Erro "invalid_grant"
- O refresh_token expirou ou é inválido
- Refaça a autorização completa (passos 1-3)

### Erro "Sem tokens válidos"
- Execute o fluxo de autorização completo
- Verifique se o arquivo `tokens.json` foi criado

### Erro de conexão
- Verifique se as URLs do Conta Azul estão corretas
- Confirme se as credenciais estão válidas

## 📝 Notas Importantes

- Nunca commite arquivos `.env*` ou `tokens.json`
- Use ambientes separados para DEV e PROD
- O sistema mantém compatibilidade com o código legado
- Tokens são salvos em `tokens.json` (ignorado pelo git)
