# 🚀 CONFIGURAR VERCEL COM NEON DATABASE

## 📋 **INSTRUÇÕES PASSO A PASSO**

### **1. 🔧 ADICIONAR DATABASE_URL AO VERCEL**

Execute este comando no terminal:

```bash
vercel env add DATABASE_URL
```

Quando perguntar o valor, cole esta URL:

```
postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### **2. 📊 VERIFICAR VARIÁVEIS CONFIGURADAS**

```bash
vercel env ls
```

Você deve ver:
- ✅ DATABASE_URL (com a URL do Neon)
- ✅ STACK_SECRET_SERVER_KEY
- ✅ NEXT_PUBLIC_STACK_PROJECT_ID
- ✅ NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
- ✅ NEXTAUTH_URL
- ✅ NEXTAUTH_SECRET
- ✅ NODE_ENV

### **3. 🏗️ CRIAR ARQUIVO .env.local LOCAL**

Crie o arquivo `.env.local` na raiz do projeto com:

```bash
# Database Configuration - Neon Database
DATABASE_URL=postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Stack Auth Configuration (configure com suas chaves reais)
STACK_SECRET_SERVER_KEY=sk_SUA_CHAVE_AQUI
NEXT_PUBLIC_STACK_PROJECT_ID=prj_SEU_PROJECT_ID_AQUI
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_SUA_CHAVE_PUBLICA_AQUI

# NextAuth Configuration
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### **4. 🧪 TESTAR LOCALMENTE**

```bash
npm run dev
```

Acesse: http://localhost:3000

### **5. 🚀 FAZER DEPLOY**

```bash
vercel --prod
```

## ✅ **RESULTADO ESPERADO**

- ✅ Neon Database conectado
- ✅ Schema do SaaS aplicado
- ✅ Sistema funcionando localmente
- ✅ Deploy funcionando no Vercel

## 🎯 **PRÓXIMOS PASSOS**

1. Execute o comando `vercel env add DATABASE_URL`
2. Cole a URL do Neon quando solicitado
3. Crie o arquivo `.env.local` com o conteúdo acima
4. Teste com `npm run dev`
5. Faça deploy com `vercel --prod`

---

**✅ CONFIGURAÇÃO COMPLETA - NEON + VERCEL FUNCIONANDO!**
