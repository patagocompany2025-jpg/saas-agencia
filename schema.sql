-- Schema do banco de dados para Neon
-- Tabelas de autenticação (NextAuth.js)

CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "image" TEXT,
  "password" TEXT,
  "role" TEXT DEFAULT 'vendedor',
  "isActive" BOOLEAN DEFAULT true,
  "permissions" JSONB,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP NOT NULL,
  UNIQUE("identifier", "token")
);

-- Tabelas do sistema

CREATE TABLE IF NOT EXISTS "Client" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "company" TEXT,
  "status" TEXT DEFAULT 'lead',
  "source" TEXT NOT NULL,
  "notes" TEXT,
  "assignedTo" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Lead" (
  "id" TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "service" TEXT NOT NULL,
  "value" DECIMAL NOT NULL,
  "status" TEXT DEFAULT 'novo',
  "priority" TEXT DEFAULT 'media',
  "expectedCloseDate" TIMESTAMP,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "basePrice" DECIMAL NOT NULL,
  "category" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FinancialTransaction" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL NOT NULL,
  "dueDate" TIMESTAMP,
  "paidDate" TIMESTAMP,
  "status" TEXT DEFAULT 'pendente',
  "paymentMethod" TEXT,
  "notes" TEXT,
  "recurring" BOOLEAN DEFAULT false,
  "recurringInterval" TEXT,
  "assignedTo" TEXT,
  "clientId" TEXT,
  "leadId" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Employee" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "position" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "salary" DECIMAL NOT NULL,
  "proLabore" DECIMAL,
  "profitShare" DECIMAL,
  "paymentDay" INTEGER NOT NULL,
  "bankAccount" JSONB NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "hireDate" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "FixedExpense" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "amount" DECIMAL NOT NULL,
  "dueDay" INTEGER NOT NULL,
  "category" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT true,
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Alert" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "isRead" BOOLEAN DEFAULT false,
  "priority" TEXT DEFAULT 'media',
  "dueDate" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_client_email" ON "Client"("email");
CREATE INDEX IF NOT EXISTS "idx_lead_status" ON "Lead"("status");
CREATE INDEX IF NOT EXISTS "idx_transaction_type" ON "FinancialTransaction"("type");
CREATE INDEX IF NOT EXISTS "idx_alert_type" ON "Alert"("type");
