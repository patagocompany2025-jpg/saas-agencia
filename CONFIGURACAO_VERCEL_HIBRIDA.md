# 🚀 CONFIGURAÇÃO VERCEL - ESTRATÉGIA HÍBRIDA

## **📋 Passo a Passo para Configurar**

### **1. 🔑 Obter Chaves do Stack Auth**

**Acesse:** https://app.stack-auth.com/dashboard

**Você precisa de:**
- `STACK_SECRET_SERVER_KEY` (começa com `sk_`)
- `NEXT_PUBLIC_STACK_PROJECT_ID` (começa com `prj_`)
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` (começa com `pk_`)

### **2. 🌐 Configurar no Dashboard do Vercel**

**Acesse:** https://vercel.com/dashboard → Seu Projeto → Settings → Environment Variables

**Adicionar as seguintes variáveis:**

```bash
# Stack Auth Configuration
STACK_SECRET_SERVER_KEY=sk_SUA_CHAVE_SERVER_AQUI
NEXT_PUBLIC_STACK_PROJECT_ID=prj_SEU_PROJECT_ID_AQUI
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_SUA_CHAVE_PUBLICA_AQUI

# Database (já configurado)
DATABASE_URL=postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=https://saas-agencia.vercel.app
```

### **3. 💻 Configurar via CLI (Alternativa)**

```bash
# Adicionar variáveis do Stack Auth
vercel env add STACK_SECRET_SERVER_KEY production
vercel env add NEXT_PUBLIC_STACK_PROJECT_ID production  
vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production

# Verificar se foram adicionadas
vercel env ls
```

### **4. 🚀 Fazer Deploy**

```bash
# Deploy para produção
vercel --prod

# Ou fazer commit e push (se conectado ao Git)
git add .
git commit -m "Implementar estratégia híbrida Stack Auth + Neon"
git push
```

### **5. ✅ Verificar Deploy**

**Após o deploy, testar:**
1. Acessar: https://saas-agencia.vercel.app/auth/sign-up
2. Criar um usuário
3. Fazer login
4. Compartilhar link com outra pessoa
5. Verificar se a outra pessoa consegue fazer login

## **🔍 Verificações Importantes**

### **Stack Auth Dashboard:**
- Verificar se usuários aparecem
- Verificar logs de autenticação

### **Neon Database:**
- Verificar se dados aparecem na tabela `users`
- Verificar se `stack_user_id` está sendo preenchido

### **Vercel Logs:**
- Verificar se não há erros de conexão
- Verificar se APIs `/api/user/sync` e `/api/user/create` funcionam

## **🚨 Solução de Problemas**

### **Se deploy falha:**
1. Verificar se todas as variáveis estão configuradas
2. Verificar se chaves do Stack Auth estão corretas
3. Verificar logs do Vercel

### **Se usuários não persistem:**
1. Verificar se DATABASE_URL está configurada
2. Verificar se APIs estão funcionando
3. Verificar se contexto híbrido está ativo

### **Se login falha:**
1. Verificar chaves do Stack Auth
2. Verificar se usuário existe no Neon
3. Verificar logs da API

## **📊 Resultado Esperado**

Após configurar tudo:
- ✅ Usuários são salvos no Stack Auth
- ✅ Dados são sincronizados com Neon DB
- ✅ Usuários persistem entre sessões
- ✅ Qualquer pessoa pode acessar com as credenciais
- ✅ Sistema funciona para múltiplos usuários

## **🎯 Teste Final**

1. **Criar usuário** no sistema
2. **Compartilhar link** com outra pessoa
3. **Outra pessoa faz login** com as credenciais
4. **Dados persistem** entre navegadores diferentes
5. **Sistema funciona** para todos os usuários

**Se tudo funcionar, a estratégia híbrida está implementada com sucesso!** 🎉
