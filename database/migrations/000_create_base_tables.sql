-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION 000: CRIAR TABELAS BASE
-- ═══════════════════════════════════════════════════════════════════
-- Descrição: Cria as tabelas básicas que já existem em produção
-- Executar ANTES das outras migrations
-- ═══════════════════════════════════════════════════════════════════

-- Tabela users (estrutura básica do schema.prisma)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company TEXT,
    user_id TEXT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela sales_tasks
CREATE TABLE IF NOT EXISTS sales_tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    value DECIMAL(10,2),
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP,
    client_id TEXT NOT NULL REFERENCES clients(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela delivery_tasks
CREATE TABLE IF NOT EXISTS delivery_tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP,
    client_id TEXT NOT NULL REFERENCES clients(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela post_sale_tasks
CREATE TABLE IF NOT EXISTS post_sale_tasks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    due_date TIMESTAMP,
    client_id TEXT NOT NULL REFERENCES clients(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    data TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_client ON sales_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_user ON sales_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_client ON delivery_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_user ON delivery_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_postsale_client ON post_sale_tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_postsale_user ON post_sale_tasks(user_id);
