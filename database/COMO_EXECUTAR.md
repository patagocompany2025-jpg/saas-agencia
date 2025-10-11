# 🚀 COMO EXECUTAR AS MIGRATIONS NO NEON

## ⚠️ IMPORTANTE: EXECUTAR NO BANCO DE DESENVOLVIMENTO PRIMEIRO!

---

## 📋 **PASSO 1: ABRIR NEON CONSOLE**

1. Vá em https://console.neon.tech
2. Selecione seu projeto "Patagonian"
3. No menu lateral, clique em **"SQL Editor"** ou **"Editor SQL"**
4. **CERTIFIQUE-SE** de estar no branch **"development"** (não production!)

---

## 📝 **PASSO 2: EXECUTAR MIGRATION 001**

1. Abra o arquivo: `database/migrations/001_multi_tenant_setup.sql`
2. **COPIE TODO O CONTEÚDO**
3. Cole no SQL Editor do Neon
4. Clique em **"Run"** ou **"Executar"**
5. Aguarde a mensagem de sucesso ✅

**O que esse script faz:**
- ✅ Cria tabela `companies` (empresas)
- ✅ Adiciona `company_id` em todas as tabelas
- ✅ Adiciona `password_hash` na tabela users
- ✅ Cria tabela `pending_users`
- ✅ Cria tabela `audit_logs`

---

## 📝 **PASSO 3: EXECUTAR MIGRATION 002**

1. Abra o arquivo: `database/migrations/002_seed_initial_data.sql`
2. **COPIE TODO O CONTEÚDO**
3. Cole no SQL Editor do Neon
4. Clique em **"Run"** ou **"Executar"**
5. Aguarde a mensagem de sucesso ✅

**O que esse script faz:**
- ✅ Cria empresa "Agência Patagonia"
- ✅ Cria super_admin: `admin@patagonian.com` (VOCÊ)
- ✅ Migra Kyra e Alex para a empresa
- ✅ Define senha temporária "123456" para todos
- ✅ Adiciona constraints e relacionamentos

---

## 🔐 **PASSO 4: CREDENCIAIS DE ACESSO**

Depois de executar as migrations, você pode fazer login com:

### **VOCÊ (Super Admin):**
```
Email: admin@patagonian.com
Senha: 123456
```
→ Tem acesso a TODAS as empresas do sistema

### **Kyra (Admin da Patagonia):**
```
Email: kyra@patagonia.com
Senha: 123456
```
→ Administrador da Agência Patagonia

### **Alex (Admin da Patagonia):**
```
Email: alex@patagonia.com
Senha: 123456
```
→ Administrador da Agência Patagonia

**TODOS serão forçados a trocar a senha no primeiro login! ✅**

---

## ✅ **PASSO 5: VERIFICAR SE DEU CERTO**

Execute este SQL no Editor para verificar:

```sql
-- Ver empresas criadas
SELECT * FROM companies;

-- Ver usuários migrados
SELECT id, email, name, role, company_id, require_password_change
FROM users
ORDER BY created_at;

-- Ver se company_id foi adicionado
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Você deve ver:**
- ✅ 1 empresa: "Agência Patagonia"
- ✅ 3 usuários: super admin, Kyra, Alex
- ✅ Coluna `company_id` na tabela users
- ✅ Coluna `password_hash` na tabela users

---

## 🔧 **PASSO 6: INSTALAR BCRYPTJS**

No terminal do seu projeto, execute:

```bash
npm install bcryptjs
npm install --save-dev @types/bcryptjs
```

Isso é necessário para validar as senhas.

---

## ⚠️ **SE ALGO DER ERRADO**

Se precisar reverter (CUIDADO!):

```sql
-- REVERTER TUDO (só em DEV!)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS pending_users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;

ALTER TABLE users DROP COLUMN IF EXISTS company_id;
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
ALTER TABLE users DROP COLUMN IF EXISTS require_password_change;
ALTER TABLE users DROP COLUMN IF EXISTS last_login_at;

-- Depois execute as migrations novamente
```

---

## 📊 **PRÓXIMOS PASSOS DEPOIS DAS MIGRATIONS**

Depois que as migrations funcionarem:

1. ✅ Testar login com `admin@patagonian.com` / `123456`
2. ✅ Implementar APIs de autenticação
3. ✅ Criar página de troca de senha
4. ✅ Implementar sistema de aprovação
5. ✅ Adicionar middleware multi-tenant

---

## 💡 **DICAS**

- **Execute SEMPRE no development primeiro!**
- **Faça backup antes de executar em produção**
- **Teste tudo localmente antes de fazer deploy**
- Se tiver dúvida, me pergunte! 🚀

---

**Criado por: Claude Code**
**Data: 2025-10-05**
