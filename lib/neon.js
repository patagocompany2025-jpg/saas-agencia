require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

// Configuração do cliente Neon
const sql = neon(process.env.DATABASE_URL);

// Função para testar conexão
async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Conexão com Neon estabelecida:', result);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Neon:', error);
    return false;
  }
}

// Função para executar queries
async function executeQuery(query, params = []) {
  try {
    const result = await sql.unsafe(query, params);
    return result;
  } catch (error) {
    console.error('❌ Erro na query:', error);
    throw error;
  }
}

module.exports = {
  sql,
  testConnection,
  executeQuery
};
