-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: MULTI-TENANT SaaS - SISTEMA COMPLETO
-- ═══════════════════════════════════════════════════════════════════
-- Descrição: Adiciona suporte multi-tenant ao sistema existente
-- Data: 2025-10-05
-- Autor: Claude Code
--
-- IMPORTANTE: Execute no banco de DESENVOLVIMENTO primeiro!
-- Depois teste tudo antes de executar em produção
-- ═══════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────
-- PARTE 1: CRIAR TABELA DE EMPRESAS
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,

    -- Planos e status
    plan TEXT NOT NULL DEFAULT 'trial' CHECK (plan IN ('trial', 'basic', 'pro', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),

    -- Limites por plano
    max_users INT NOT NULL DEFAULT 5,
    max_clients INT NOT NULL DEFAULT 100,

    -- Informações de contato
    owner_email TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,

    -- Branding (futuro)
    logo_url TEXT,
    primary_color TEXT DEFAULT '#5E6AD2',

    -- Datas
    trial_ends_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_status ON companies(status);

COMMENT ON TABLE companies IS 'Empresas clientes do SaaS (tenants)';

-- ─────────────────────────────────────────────────────────────────
-- PARTE 2: ADICIONAR company_id NA TABELA USERS
-- ─────────────────────────────────────────────────────────────────

-- Adicionar coluna company_id (permite NULL temporariamente)
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id TEXT;

-- Adicionar coluna password_hash
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Adicionar colunas de controle
ALTER TABLE users ADD COLUMN IF NOT EXISTS require_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

-- Modificar constraint de email para ser único POR EMPRESA
-- Primeiro remove constraint antigo
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Email único por empresa (será adicionado depois de popular company_id)
-- CREATE UNIQUE INDEX idx_users_company_email ON users(company_id, email);

COMMENT ON COLUMN users.company_id IS 'Empresa à qual o usuário pertence';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt da senha (NULL = senha temporária)';

-- ─────────────────────────────────────────────────────────────────
-- PARTE 3: CRIAR TABELA DE USUÁRIOS PENDENTES
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pending_users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Dados do cadastro
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,

    -- Informações adicionais
    message TEXT,
    role_requested TEXT DEFAULT 'company_user',

    -- Status de aprovação
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by TEXT,
    reviewed_at TIMESTAMP,
    rejection_reason TEXT,

    -- Data
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_pending_email_per_company UNIQUE (company_id, email)
);

CREATE INDEX idx_pending_company ON pending_users(company_id);
CREATE INDEX idx_pending_status ON pending_users(status);

COMMENT ON TABLE pending_users IS 'Usuários aguardando aprovação para entrar no sistema';

-- ─────────────────────────────────────────────────────────────────
-- PARTE 4: ADICIONAR company_id EM TODAS AS TABELAS
-- ─────────────────────────────────────────────────────────────────

-- Tabela clients (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        ALTER TABLE clients ADD COLUMN IF NOT EXISTS company_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company_id);
    END IF;
END $$;

-- Tabela sales_tasks (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales_tasks') THEN
        ALTER TABLE sales_tasks ADD COLUMN IF NOT EXISTS company_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_sales_tasks_company ON sales_tasks(company_id);
    END IF;
END $$;

-- Tabela delivery_tasks (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'delivery_tasks') THEN
        ALTER TABLE delivery_tasks ADD COLUMN IF NOT EXISTS company_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_delivery_tasks_company ON delivery_tasks(company_id);
    END IF;
END $$;

-- Tabela post_sale_tasks (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_sale_tasks') THEN
        ALTER TABLE post_sale_tasks ADD COLUMN IF NOT EXISTS company_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_post_sale_tasks_company ON post_sale_tasks(company_id);
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────
-- PARTE 5: CRIAR TABELA DE LOGS DE AUDITORIA
-- ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),

    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT,

    old_data JSONB,
    new_data JSONB,

    ip_address TEXT,
    user_agent TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

COMMENT ON TABLE audit_logs IS 'Log de todas as ações no sistema para auditoria';

-- ═══════════════════════════════════════════════════════════════════
-- FINALIZADO: ESTRUTURA MULTI-TENANT CRIADA
-- ═══════════════════════════════════════════════════════════════════
--
-- PRÓXIMOS PASSOS:
-- 1. Executar 002_seed_initial_data.sql (criar primeira empresa)
-- 2. Migrar dados existentes
-- 3. Adicionar constraints de NOT NULL e FK
-- ═══════════════════════════════════════════════════════════════════
