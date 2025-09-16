// corrigir-tokens.js - Script para corrigir arquivo tokens.json corrompido
const fs = require('fs');
const path = require('path');

function corrigirTokens() {
  console.log('🔧 CORRIGINDO ARQUIVO TOKENS.JSON...');
  
  const tokensPath = './tokens.json';
  
  if (!fs.existsSync(tokensPath)) {
    console.log('❌ Arquivo tokens.json não encontrado');
    return;
  }

  try {
    // Ler arquivo como texto bruto
    const content = fs.readFileSync(tokensPath, 'utf8');
    console.log(`📄 Arquivo lido: ${content.length} caracteres`);
    
    // Tentar fazer parse do JSON
    let tokens;
    try {
      tokens = JSON.parse(content);
      console.log('✅ JSON válido - não precisa de correção');
      return;
    } catch (parseError) {
      console.log('❌ JSON inválido detectado:', parseError.message);
    }

    // Tentar corrigir o JSON
    console.log('🔧 Tentando corrigir JSON...');
    
    // Remover caracteres especiais e quebras de linha problemáticas
    let cleanContent = content
      .replace(/\r\n/g, '\n')  // Normalizar quebras de linha
      .replace(/\r/g, '\n')    // Remover \r
      .replace(/\n\s*\n/g, '\n') // Remover linhas vazias
      .trim();

    // Tentar parse novamente
    try {
      tokens = JSON.parse(cleanContent);
      console.log('✅ JSON corrigido com sucesso!');
    } catch (error) {
      console.log('❌ Ainda inválido após limpeza:', error.message);
      
      // Estratégia mais agressiva - recriar o JSON
      console.log('🔧 Recriando JSON do zero...');
      
      // Extrair tokens usando regex
      const idTokenMatch = content.match(/"id_token":\s*"([^"]+)"/);
      const accessTokenMatch = content.match(/"access_token":\s*"([^"]+)"/);
      const refreshTokenMatch = content.match(/"refresh_token":\s*"([^"]+)"/);
      const expiresInMatch = content.match(/"expires_in":\s*(\d+)/);
      const tokenTypeMatch = content.match(/"token_type":\s*"([^"]+)"/);
      
      if (idTokenMatch && accessTokenMatch && refreshTokenMatch) {
        tokens = {
          id_token: idTokenMatch[1],
          access_token: accessTokenMatch[1],
          refresh_token: refreshTokenMatch[1],
          expires_in: expiresInMatch ? parseInt(expiresInMatch[1]) : 3600,
          token_type: tokenTypeMatch ? tokenTypeMatch[1] : 'Bearer',
          saved_at: new Date().toISOString()
        };
        
        console.log('✅ Tokens extraídos e JSON recriado!');
      } else {
        console.log('❌ Não foi possível extrair tokens válidos');
        return;
      }
    }

    // Salvar arquivo corrigido
    const backupPath = './tokens-backup.json';
    fs.copyFileSync(tokensPath, backupPath);
    console.log(`💾 Backup criado: ${backupPath}`);
    
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    console.log('✅ Arquivo tokens.json corrigido e salvo!');
    
    // Verificar se está válido agora
    const verifyContent = fs.readFileSync(tokensPath, 'utf8');
    const verifyTokens = JSON.parse(verifyContent);
    console.log('✅ Verificação: JSON válido!');
    console.log(`🔑 Access Token: ${verifyTokens.access_token ? 'Presente' : 'Ausente'}`);
    console.log(`🔄 Refresh Token: ${verifyTokens.refresh_token ? 'Presente' : 'Ausente'}`);
    
  } catch (error) {
    console.log('❌ Erro ao corrigir tokens:', error.message);
  }
}

// Executar correção
corrigirTokens();
