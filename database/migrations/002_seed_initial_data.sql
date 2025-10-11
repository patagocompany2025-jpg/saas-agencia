-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: DADOS INICIAIS - PRIMEIRA EMPRESA E USUÁRIOS
-- ═══════════════════════════════════════════════════════════════════
-- Descrição: Cria a primeira empresa e usuários iniciais com senha temporária
-- Data: 2025-10-05
-- Autor: Claude Code
--
-- SENHA TEMPORÁRIA PARA TODOS: 123456
-- Todos serão forçados a trocar no primeiro login
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- PARTE 1: CRIAR PRIMEIRA EMPRESA (Agência Patagonia)
-- ─────────────────────────────────────────────────────────────────

INSERT INTO companies (
    id,
    name,
    slug,
    plan,
    status,
    max_users,
    max_clients,
    owner_email,
    owner_name,
    phone,
    primary_color,
    trial_ends_at,
    created_at,
    updated_at
) VALUES (
    'company_patagonia_001',  -- ID fixo para facilitar referência
    'Agência Patagonia',
    'patagonia',
    'enterprise',  -- Plano enterprise (ilimitado)
    'active',
    999,  -- Limite alto de usuários
    9999, -- Limite alto de clientes
    'contato@agenciapatagonia.com',
    'Agência Patagonia',
    NULL,
    '#5E6AD2',
    NULL,  -- Sem trial (plano pago)
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- PARTE 2: ATUALIZAR USUÁRIOS EXISTENTES
-- ─────────────────────────────────────────────────────────────────

-- Migrar Kyra para empresa Patagonia
UPDATE users
SET
    company_id = 'company_patagonia_001',
    role = 'company_admin',  -- Sócio = company_admin
    password_hash = NULL,  -- NULL = senha temporária aceita
    require_password_change = TRUE,  -- Força trocar senha
    status = 'active'
WHERE email = 'kyra@patagonia.com';

-- Migrar Alex para empresa Patagonia
UPDATE users
SET
    company_id = 'company_patagonia_001',
    role = 'company_admin',  -- Sócio = company_admin
    password_hash = NULL,  -- NULL = senha temporária aceita
    require_password_change = TRUE,  -- Força trocar senha
    status = 'active'
WHERE email = 'alex@patagonia.com';

-- ─────────────────────────────────────────────────────────────────
-- PARTE 3: CRIAR SUPER ADMIN (VOCÊ)
-- ─────────────────────────────────────────────────────────────────
-- Este usuário tem acesso a TODAS as empresas do sistema
-- ─────────────────────────────────────────────────────────────────

INSERT INTO users (
    id,
    company_id,  -- NULL = super_admin não pertence a nenhuma empresa específica
    email,
    name,
    password_hash,  -- NULL = aceita senha temporária "123456"
    role,
    status,
    require_password_change,  -- Vai trocar senha no primeiro login
    created_at,
    updated_at
) VALUES (
    'user_superadmin_001',
    NULL,  -- Super admin não pertence a empresa específica
    'admin@patagonian.com',  -- ESTE É VOCÊ!
    'Super Admin',
    NULL,  -- NULL = senha temporária "123456"
    'super_admin',  -- Role especial
    'active',
    TRUE,  -- Força trocar senha no primeiro login
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────
-- PARTE 4: MIGRAR DADOS EXISTENTES (SE HOUVER)
-- ─────────────────────────────────────────────────────────────────

-- Atualizar clientes existentes para empresa Patagonia
UPDATE clients
SET company_id = 'company_patagonia_001'
WHERE company_id IS NULL;

-- Atualizar sales_tasks existentes
UPDATE sales_tasks
SET company_id = 'company_patagonia_001'
WHERE company_id IS NULL;

-- Atualizar delivery_tasks existentes
UPDATE delivery_tasks
SET company_id = 'company_patagonia_001'
WHERE company_id IS NULL;

-- Atualizar post_sale_tasks existentes
UPDATE post_sale_tasks
SET company_id = 'company_patagonia_001'
WHERE company_id IS NULL;

-- ─────────────────────────────────────────────────────────────────
-- PARTE 5: ADICIONAR CONSTRAINTS (AGORA QUE DADOS FORAM MIGRADOS)
-- ─────────────────────────────────────────────────────────────────

-- Adicionar FK de users para companies (permitindo NULL para super_admin)
ALTER TABLE users
ADD CONSTRAINT fk_users_company
FOREIGN KEY (company_id)
REFERENCES companies(id)
ON DELETE CASCADE;

-- Email único por empresa
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_company_email
ON users(company_id, email)
WHERE company_id IS NOT NULL;

-- Super admin tem email único globalmente
CREATE UNIQUE INDEX IF NOT EXISTS idx_superadmin_email
ON users(email)
WHERE role = 'super_admin';

-- ═══════════════════════════════════════════════════════════════════
-- FINALIZADO: DADOS INICIAIS CRIADOS
-- ═══════════════════════════════════════════════════════════════════
--
-- CREDENCIAIS DE LOGIN:
--
-- Super Admin (você):
--   Email: admin@patagonian.com
--   Senha: 123456 (temporária - será forçado a trocar)
--
-- Kyra (company_admin):
--   Email: kyra@patagonia.com
--   Senha: 123456 (temporária - será forçado a trocar)
--
-- Alex (company_admin):
--   Email: alex@patagonia.com
--   Senha: 123456 (temporária - será forçado a trocar)
--
-- ═══════════════════════════════════════════════════════════════════
