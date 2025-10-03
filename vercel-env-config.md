# 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE NO VERCEL

## **Problema Identificado**
O sistema estava usando localStorage em vez de banco de dados real, causando:
- ❌ Usuários não são salvos entre sessões
- ❌ Dados não são compartilhados entre usuários
- ❌ Perda de dados ao limpar cache

## **Solução Implementada**
Migração para Stack Auth com banco de dados real.

## **Variáveis Necessárias no Vercel**

### 1. **Configurar no Dashboard do Vercel**
Acesse: https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

### 2. **Adicionar as seguintes variáveis:**

```bash
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Stack Auth Configuration (SUBSTITUA PELAS SUAS CHAVES REAIS)
STACK_SECRET_SERVER_KEY=sk_SUA_CHAVE_SERVER_AQUI
NEXT_PUBLIC_STACK_PROJECT_ID=prj_SEU_PROJECT_ID_AQUI
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_SUA_CHAVE_PUBLICA_AQUI

# NextAuth Configuration
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=https://saas-agencia.vercel.app
```

### 3. **Comandos para configurar via CLI:**

```bash
# Adicionar DATABASE_URL
vercel env add DATABASE_URL production
# Cole: postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Adicionar STACK_SECRET_SERVER_KEY
vercel env add STACK_SECRET_SERVER_KEY production
# Cole sua chave server do Stack Auth

# Adicionar NEXT_PUBLIC_STACK_PROJECT_ID
vercel env add NEXT_PUBLIC_STACK_PROJECT_ID production
# Cole seu project ID do Stack Auth

# Adicionar NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production
# Cole sua chave pública do Stack Auth

# Adicionar NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Cole um secret aleatório (pode gerar com: openssl rand -base64 32)

# Adicionar NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Cole: https://saas-agencia.vercel.app
```

### 4. **Verificar se as variáveis foram adicionadas:**
```bash
vercel env ls
```

### 5. **Fazer novo deploy:**
```bash
vercel --prod
```

## **✅ Resultado Esperado**
Após configurar as variáveis e fazer o deploy:
- ✅ Usuários serão salvos no banco de dados
- ✅ Dados persistirão entre sessões
- ✅ Usuários poderão acessar de qualquer lugar
- ✅ Sistema funcionará corretamente para todos os usuários

## **🔍 Verificação**
1. Crie um usuário no sistema
2. Compartilhe o link com outra pessoa
3. A outra pessoa deve conseguir fazer login com o usuário criado
4. Os dados devem persistir entre navegadores diferentes
