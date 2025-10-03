# 🔄 MIGRAÇÃO PARA ESTRATÉGIA HÍBRIDA

## **Passos para Ativar a Estratégia Híbrida**

### **1. Gerar Migração do Prisma**
```bash
# Gerar migração para adicionar stack_user_id
npx prisma migrate dev --name add-stack-user-id

# Ou se preferir resetar o banco (CUIDADO: apaga dados existentes)
npx prisma migrate reset
```

### **2. Verificar se a Migração Funcionou**
```bash
# Verificar status do banco
npx prisma db push

# Verificar se as tabelas estão corretas
npx prisma studio
```

### **3. Configurar Variáveis no Vercel**

**Adicionar no Dashboard do Vercel:**
```bash
# Stack Auth (substitua pelas suas chaves)
STACK_SECRET_SERVER_KEY=sk_SUA_CHAVE_AQUI
NEXT_PUBLIC_STACK_PROJECT_ID=prj_SEU_PROJECT_ID_AQUI
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pk_SUA_CHAVE_AQUI

# Database (já configurado)
DATABASE_URL=postgresql://neondb_owner:npg_3KLYslPa1VZE@ep-square-cloud-acj5cbxo-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth
NEXTAUTH_SECRET=seu_secret_aqui
NEXTAUTH_URL=https://saas-agencia.vercel.app
```

### **4. Fazer Deploy**
```bash
# Deploy para produção
vercel --prod
```

## **✅ Como Funciona a Estratégia Híbrida**

### **Fluxo de Login:**
1. **Usuário faz login** → Stack Auth autentica
2. **Stack Auth retorna ID** → Sistema busca no Neon DB
3. **Se não existe no Neon** → Cria automaticamente
4. **Retorna dados combinados** → Stack Auth + Neon

### **Fluxo de Cadastro:**
1. **Usuário se cadastra** → Stack Auth cria conta
2. **Stack Auth confirma** → Sistema cria no Neon
3. **Dados sincronizados** → Pronto para usar

### **Vantagens:**
- ✅ **Segurança**: Stack Auth cuida da autenticação
- ✅ **Flexibilidade**: Neon armazena dados do negócio
- ✅ **Sincronização**: Automática entre os dois
- ✅ **Performance**: Rápido e escalável

## **🔍 Testando a Integração**

### **1. Teste Local:**
```bash
# Rodar em desenvolvimento
npm run dev

# Testar cadastro e login
# Verificar se dados aparecem no Neon
```

### **2. Teste em Produção:**
1. Criar usuário no sistema
2. Compartilhar link com outra pessoa
3. Verificar se consegue fazer login
4. Dados devem persistir entre navegadores

## **📊 Monitoramento**

### **Verificar Logs:**
- Console do navegador (F12)
- Logs do Vercel
- Neon Database Dashboard

### **Verificar Dados:**
- Stack Auth Dashboard
- Neon Database (npx prisma studio)
- Vercel Analytics

## **🚨 Solução de Problemas**

### **Se usuários não aparecem:**
1. Verificar se DATABASE_URL está configurada
2. Verificar se Stack Auth está funcionando
3. Verificar logs da API /api/user/sync

### **Se login falha:**
1. Verificar chaves do Stack Auth
2. Verificar se usuário existe no Neon
3. Verificar conexão com banco

### **Se dados não persistem:**
1. Verificar se migração foi aplicada
2. Verificar se APIs estão funcionando
3. Verificar se contexto híbrido está ativo
