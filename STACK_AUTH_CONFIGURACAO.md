# 🔐 CONFIGURAÇÃO STACK AUTH - GUIA COMPLETO

## 📋 **PASSO A PASSO PARA CONFIGURAR STACK AUTH**

### **1. CRIAR CONTA NO STACK AUTH**

1. Acesse: https://stack-auth.com
2. Clique em "Sign Up" ou "Get Started"
3. Preencha:
   - **Email:** seu email
   - **Senha:** uma senha segura
   - **Nome:** seu nome completo
4. Confirme o email (se solicitado)

### **2. CRIAR PROJETO**

1. Após login, clique em **"Create New Project"**
2. Preencha:
   - **Nome:** `Agência Patagônia SaaS`
   - **Descrição:** `Sistema de gestão empresarial para agência de turismo`
3. Clique em **"Create Project"**

### **3. OBTER CREDENCIAIS**

Após criar o projeto, você verá uma página com as credenciais. **COPIE EXATAMENTE:**

```bash
STACK_SECRET_SERVER_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STACK_PROJECT_ID=prj_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### **4. CRIAR ARQUIVO .env.local**

Crie um arquivo `.env.local` na raiz do projeto com:

```bash
# Stack Auth Configuration
STACK_SECRET_SERVER_KEY=sk_SUA_CHAVE_AQUI
NEXT_PUBLIC_STACK_PROJECT_ID=prj_SEU_PROJECT_ID_AQUI
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_SUA_CHAVE_PUBLICA_AQUI

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# NextAuth Configuration
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### **5. CONFIGURAR BANCO DE DADOS (OPCIONAL)**

Se quiser usar banco de dados real:

1. **Neon (Recomendado):** https://neon.tech
2. **Supabase:** https://supabase.com
3. **Railway:** https://railway.app

### **6. TESTAR CONFIGURAÇÃO**

Após configurar o `.env.local`:

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Testar rotas:
# - http://localhost:3000/auth/sign-in
# - http://localhost:3000/auth/sign-up
# - http://localhost:3000/dashboard
```

## ⚠️ **IMPORTANTE:**

1. **NUNCA** commite o arquivo `.env.local` no Git
2. **SEMPRE** use as credenciais reais do Stack Auth
3. **TESTE** o login/cadastro antes do deploy
4. **CONFIGURE** as variáveis de ambiente na plataforma de deploy

## 🚀 **PRÓXIMOS PASSOS:**

1. ✅ Configurar Stack Auth
2. ✅ Criar arquivo .env.local
3. ✅ Testar sistema localmente
4. ✅ Fazer deploy em produção
5. ✅ Configurar domínio personalizado

---

**✅ SISTEMA PRONTO PARA PRODUÇÃO APÓS CONFIGURAÇÃO!**
