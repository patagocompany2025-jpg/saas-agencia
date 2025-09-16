# 🚀 Guia de Deploy - NOVO AI AUTOMATION

## Visão Geral

Este guia fornece instruções completas para deploy do sistema em diferentes ambientes.

## 📋 Pré-requisitos

### Servidor
- **Node.js**: >= 20.11.0
- **npm**: >= 8.0.0
- **Memória**: >= 2GB RAM
- **Disco**: >= 10GB espaço livre
- **Rede**: Acesso à internet para APIs externas

### Serviços Externos
- Conta Conta Azul (DEV/PROD)
- Chave API OpenAI
- Projeto Supabase
- Domínio para webhook (produção)

## 🔧 Configuração de Ambiente

### 1. Variáveis de Ambiente

#### Desenvolvimento
```bash
# Copiar template
cp env.dev.template .env

# Editar com suas credenciais
nano .env
```

#### Produção
```bash
# Copiar template
cp env.prod.template .env

# Editar com credenciais de produção
nano .env
```

### 2. Configuração de Banco de Dados

```sql
-- Executar no Supabase
-- Ver arquivo: docs/banco-dados.md
```

### 3. Configuração de OAuth

```bash
# Gerar URL de autorização
npm run oauth:url

# Autorizar no navegador
# Trocar code por tokens
npm run oauth:exchange -- <CODE>
```

## 🐳 Deploy com Docker

### Dockerfile Principal

```dockerfile
# Dockerfile
FROM node:20.11.0-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Copiar código
COPY . .

# Build Mega Vendedor AI
WORKDIR /app/agentes/dev1_alex/mega_vendedor_ai
RUN npm ci --only=production
RUN npm run build

# Voltar para diretório raiz
WORKDIR /app

# Expor porta
EXPOSE 5000

# Comando de inicialização
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
      - ./tokens.json:/app/tokens.json
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Comandos Docker

```bash
# Build da imagem
docker build -t novo-ai-automation .

# Executar container
docker run -d \
  --name novo-ai-automation \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/tokens.json:/app/tokens.json \
  novo-ai-automation

# Usar Docker Compose
docker-compose up -d
```

## ☁️ Deploy na Nuvem

### AWS EC2

#### 1. Configurar Instância
```bash
# Conectar via SSH
ssh -i key.pem ubuntu@ec2-ip

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

#### 2. Deploy da Aplicação
```bash
# Clonar repositório
git clone <repository-url>
cd NOVO-AI-AUTOMATION

# Instalar dependências
npm ci
cd agentes/dev1_alex/mega_vendedor_ai
npm ci
npm run build
cd ../../..

# Configurar ambiente
cp env.prod.template .env
nano .env

# Iniciar com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Configurar Nginx
```nginx
# /etc/nginx/sites-available/novo-ai
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Heroku

#### 1. Configurar Heroku
```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create novo-ai-automation

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=sua_chave
heroku config:set SUPABASE_URL=sua_url
heroku config:set SUPABASE_KEY=sua_chave
```

#### 2. Deploy
```bash
# Deploy
git push heroku main

# Ver logs
heroku logs --tail

# Abrir app
heroku open
```

### Vercel

#### 1. Configurar Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### 2. Configurar Variáveis
```bash
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
```

## 🔄 CI/CD com GitHub Actions

### Workflow de Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        npm ci
        cd agentes/dev1_alex/mega_vendedor_ai
        npm ci
    
    - name: Build
      run: |
        cd agentes/dev1_alex/mega_vendedor_ai
        npm run build
    
    - name: Deploy to production
      run: |
        # Comandos de deploy específicos
        echo "Deploying to production..."
```

## 📊 Monitoramento

### PM2 (Process Manager)

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'novo-ai-automation',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

### Comandos PM2

```bash
# Iniciar aplicação
pm2 start ecosystem.config.js --env production

# Monitorar
pm2 monit

# Ver logs
pm2 logs

# Reiniciar
pm2 restart novo-ai-automation

# Parar
pm2 stop novo-ai-automation

# Remover
pm2 delete novo-ai-automation
```

### Health Checks

```bash
# Verificar status
curl http://localhost:5000/health

# Verificar OAuth
curl http://localhost:5000/health/oauth

# Verificar logs
tail -f logs/error.log
```

## 🔒 Segurança

### SSL/TLS
```bash
# Gerar certificado Let's Encrypt
sudo certbot --nginx -d seu-dominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall
```bash
# Configurar UFW
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Variáveis Sensíveis
```bash
# Nunca commitar arquivos sensíveis
echo ".env" >> .gitignore
echo "tokens.json" >> .gitignore
echo "*.pem" >> .gitignore
```

## 📈 Escalabilidade

### Load Balancer
```nginx
# nginx.conf
upstream app {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    location / {
        proxy_pass http://app;
    }
}
```

### Cluster Mode
```javascript
// server.js
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // Código da aplicação
}
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Porta já em uso
```bash
# Encontrar processo
lsof -i :5000

# Matar processo
kill -9 PID
```

#### 2. Erro de permissão
```bash
# Dar permissão de execução
chmod +x scripts/*.js
```

#### 3. Erro de memória
```bash
# Aumentar limite de memória
node --max-old-space-size=4096 server.js
```

#### 4. Erro de conexão
```bash
# Verificar conectividade
ping api.contaazul.com
ping api.openai.com
```

### Logs de Debug

```bash
# Logs detalhados
DEBUG=* npm start

# Logs específicos
DEBUG=oauth npm start
DEBUG=whatsapp npm start
```

## 📋 Checklist de Deploy

### Pré-deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] OAuth autorizado
- [ ] Testes passando
- [ ] Build funcionando

### Deploy
- [ ] Código deployado
- [ ] Serviços iniciados
- [ ] Health checks OK
- [ ] Logs sem erro
- [ ] Monitoramento ativo

### Pós-deploy
- [ ] Testes de integração
- [ ] Verificar funcionalidades
- [ ] Monitorar métricas
- [ ] Documentar mudanças

---

**Última atualização**: 12/09/2025  
**Versão**: 1.0.0
