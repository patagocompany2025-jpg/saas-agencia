// ═══════════════════════════════════════════════════════════════════
// SCRIPT: EXECUTAR MIGRATIONS NO NEON DATABASE
// ═══════════════════════════════════════════════════════════════════
// Descrição: Executa migrations SQL usando Neon Serverless Driver
// Uso: node database/execute-migrations.mjs
// ═══════════════════════════════════════════════════════════════════

import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Carregar .env.local
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─────────────────────────────────────────────────────────────────
// CONFIGURAÇÃO
// ─────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERRO: DATABASE_URL não encontrada no .env.local');
  console.error('');
  console.error('Certifique-se de que existe o arquivo .env.local com:');
  console.error('DATABASE_URL=postgresql://...');
  process.exit(1);
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 EXECUTANDO MIGRATIONS - SISTEMA MULTI-TENANT');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
console.log('📊 Banco de dados:', DATABASE_URL.substring(0, 50) + '...');
console.log('');

const sql = neon(DATABASE_URL);

// Wrapper para executar SQL strings (Neon requer tagged templates)
async function executeSqlString(sqlString) {
  // Usar template literal dinâmico através de Function
  const fn = new Function('sql', `return sql\`${sqlString.replace(/`/g, '\\`')}\``);
  return await fn(sql);
}

// ─────────────────────────────────────────────────────────────────
// FUNÇÕES AUXILIARES
// ─────────────────────────────────────────────────────────────────

function readMigration(filename) {
  const filepath = join(__dirname, 'migrations', filename);
  try {
    return readFileSync(filepath, 'utf8');
  } catch (error) {
    console.error(`❌ Erro ao ler arquivo: ${filename}`);
    console.error(error.message);
    process.exit(1);
  }
}

function parseStatements(sqlContent) {
  const statements = [];
  let current = '';
  let inDollarBlock = false;

  const lines = sqlContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Pular linhas vazias e comentários puros
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    // Detectar blocos DO $$
    if (trimmed.includes('DO $$') || trimmed.includes('DO $')) {
      inDollarBlock = true;
    }

    current += line + '\n';

    // Fim do bloco DO
    if (inDollarBlock && (trimmed.includes('END $$') || trimmed.includes('$$ LANGUAGE') || trimmed === '$$;')) {
      inDollarBlock = false;
      statements.push(current.trim());
      current = '';
      continue;
    }

    // Statement normal terminado com ;
    if (!inDollarBlock && trimmed.endsWith(';')) {
      statements.push(current.trim());
      current = '';
    }
  }

  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

async function executeMigration(name, sqlContent) {
  console.log(`⏳ Executando: ${name}...`);

  try {
    const statements = parseStatements(sqlContent);
    console.log(`   📝 ${statements.length} statement(s) para executar...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        await executeSqlString(statement);
      } catch (err) {
        // Se já existe, ignorar
        if (err.message.includes('already exists') || err.message.includes('duplicate')) {
          console.log(`   ⚠️  Já existe (ignorando)`);
          continue;
        }
        throw err;
      }
    }

    console.log(`✅ ${name} executada com sucesso!`);
    console.log('');
    return true;
  } catch (error) {
    console.error(`❌ ERRO na migration ${name}:`);
    console.error(error.message);
    console.error('');

    // Mostrar detalhes do erro se disponível
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    if (error.detail) {
      console.error('Detalhes:', error.detail);
    }
    if (error.hint) {
      console.error('Dica:', error.hint);
    }

    console.error('');
    return false;
  }
}

async function verifyMigrations() {
  console.log('🔍 Verificando se migrations foram aplicadas...');
  console.log('');

  try {
    // Verificar se tabela companies existe
    const companies = await sql`
      SELECT COUNT(*) as count FROM companies
    `;
    console.log(`✅ Tabela companies: ${companies[0].count} registro(s)`);

    // Verificar se coluna company_id existe em users
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'users'
      AND column_name IN ('company_id', 'password_hash', 'require_password_change')
    `;

    const columnNames = columns.map(c => c.column_name);
    console.log(`✅ Colunas adicionadas em users:`, columnNames);

    // Verificar usuários criados
    const users = await sql`
      SELECT id, email, name, role, company_id, require_password_change
      FROM users
      ORDER BY created_at
    `;

    console.log('');
    console.log('👥 Usuários no sistema:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - Trocar senha: ${user.require_password_change}`);
    });

    // Verificar tabela pending_users
    const pendingCount = await sql`
      SELECT COUNT(*) as count FROM pending_users
    `;
    console.log('');
    console.log(`✅ Tabela pending_users: ${pendingCount[0].count} registro(s)`);

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ MIGRATIONS EXECUTADAS COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('🔐 CREDENCIAIS DE LOGIN:');
    console.log('');
    console.log('Super Admin (você):');
    console.log('   Email: admin@patagonian.com');
    console.log('   Senha: 123456 (temporária)');
    console.log('');

    const kyra = users.find(u => u.email === 'kyra@patagonia.com');
    const alex = users.find(u => u.email === 'alex@patagonia.com');

    if (kyra) {
      console.log('Kyra:');
      console.log('   Email: kyra@patagonia.com');
      console.log('   Senha: 123456 (temporária)');
      console.log('');
    }

    if (alex) {
      console.log('Alex:');
      console.log('   Email: alex@patagonia.com');
      console.log('   Senha: 123456 (temporária)');
      console.log('');
    }

    console.log('⚠️  Todos serão forçados a trocar a senha no primeiro login!');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao verificar migrations:');
    console.error(error.message);
    console.error('');
    console.error('As migrations podem ter sido aplicadas parcialmente.');
    console.error('Verifique manualmente no Neon Console.');
  }
}

// ─────────────────────────────────────────────────────────────────
// EXECUÇÃO PRINCIPAL
// ─────────────────────────────────────────────────────────────────

async function main() {
  try {
    // Migration 0: Criar tabelas base
    const migration0 = readMigration('000_create_base_tables.sql');
    const success0 = await executeMigration('000_create_base_tables', migration0);

    if (!success0) {
      console.log('');
      console.log('❌ Abortando: Erro ao criar tabelas base');
      process.exit(1);
    }

    // Migration 1: Estrutura multi-tenant
    const migration1 = readMigration('001_multi_tenant_setup.sql');
    const success1 = await executeMigration('001_multi_tenant_setup', migration1);

    if (!success1) {
      console.log('');
      console.log('❌ Abortando: Erro na migration multi-tenant');
      process.exit(1);
    }

    // Migration 2: Dados iniciais
    const migration2 = readMigration('002_seed_initial_data.sql');
    const success2 = await executeMigration('002_seed_initial_data', migration2);

    if (!success2) {
      console.log('');
      console.log('⚠️  Migrations 0 e 1 aplicadas, mas 2 falhou');
      console.log('Você pode tentar executar manualmente a migration 002');
      process.exit(1);
    }

    // Verificar resultado
    await verifyMigrations();

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ ERRO FATAL');
    console.error('═══════════════════════════════════════════════════════════');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main();
