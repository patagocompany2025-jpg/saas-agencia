# 🔄 INSTRUÇÕES PARA SINCRONIZAÇÃO ENTRE COMPUTADORES

## ✅ PROBLEMA RESOLVIDO!

O problema era que cada computador estava usando um banco de dados diferente. Agora ambos usarão o mesmo banco Neon Database.

## 📋 PASSO A PASSO PARA O OUTRO COMPUTADOR:

### 1. **Copie o arquivo `.env.local` para o outro computador:**
```bash
# Copie este arquivo para a raiz do projeto no outro computador
# Caminho: C:\Users\[SEU_USUARIO]\Desktop\Projetos em desenvolvimento\Projeto Patagonian\saas\.env.local
```

### 2. **Conteúdo do arquivo `.env.local`:**
```
# CONFIGURAÇÃO LOCAL - NEON DATABASE + STACK AUTH
# Este arquivo garante que ambos os computadores usem o mesmo banco

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

### 3. **Configure as chaves do Stack Auth:**
- Substitua `sk_SUA_CHAVE_AQUI` pela sua chave real do Stack Auth
- Substitua `prj_SEU_PROJECT_ID_AQUI` pelo seu Project ID real  
- Substitua `pk_SUA_CHAVE_PUBLICA_AQUI` pela sua chave pública real
- Substitua `seu_secret_aqui` por uma string aleatória segura

### 4. **Reinicie o servidor:**
```bash
npm run dev
```

## 🎯 RESULTADO ESPERADO:

✅ **Modificações feitas em um computador aparecerão no outro**
✅ **Dados sincronizados em tempo real**
✅ **Mesmo banco de dados para todos os computadores**

## 🔍 VERIFICAÇÃO:

Execute este comando para verificar se está funcionando:
```bash
node check-db.js
```

Deve mostrar:
- ✅ Conexão com banco estabelecida!
- 📊 Estatísticas do banco (usuários, clientes, reservas)

