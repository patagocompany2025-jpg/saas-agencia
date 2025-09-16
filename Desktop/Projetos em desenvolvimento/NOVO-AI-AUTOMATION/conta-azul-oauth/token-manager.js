// token-manager.js - Sistema Automático de Gerenciamento de Tokens
const fs = require('fs');
const fetch = require('node-fetch');

class TokenManager {
  constructor() {
    this.tokensFile = './tokens.json';
    this.config = {
      CLIENT_ID: '7f178p84rfk7phnkq2bbthk3m1',
      CLIENT_SECRET: '5cf9ij4hk7sgnuubmd8d6uo2isb5jb3mi90t7v00g8npfnq72fp',
      TOKEN_URL: 'https://auth.contaazul.com/oauth2/token',
      API_BASE: 'https://api.contaazul.com'
    };
    this.tokens = null;
    this.refreshPromise = null; // Evita múltiplas renovações simultâneas
  }

  // Carregar tokens do arquivo
  loadTokens() {
    try {
      if (fs.existsSync(this.tokensFile)) {
        this.tokens = JSON.parse(fs.readFileSync(this.tokensFile, 'utf8'));
        console.log('✅ Tokens carregados do arquivo');
        return true;
      }
    } catch (error) {
      console.log('⚠️ Erro ao carregar tokens:', error.message);
    }
    return false;
  }

  // Salvar tokens no arquivo
  saveTokens(tokens) {
    try {
      const tokensToSave = {
        ...tokens,
        saved_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
      };
      fs.writeFileSync(this.tokensFile, JSON.stringify(tokensToSave, null, 2));
      this.tokens = tokensToSave;
      console.log('💾 Tokens salvos com sucesso!');
      return true;
    } catch (error) {
      console.log('❌ Erro ao salvar tokens:', error.message);
      return false;
    }
  }

  // Verificar se token está próximo do vencimento (5 minutos antes)
  isTokenExpiringSoon() {
    if (!this.tokens || !this.tokens.expires_at) return true;
    
    const expiresAt = new Date(this.tokens.expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    return expiresAt <= fiveMinutesFromNow;
  }

  // Verificar se token está expirado
  isTokenExpired() {
    if (!this.tokens || !this.tokens.expires_at) return true;
    
    const expiresAt = new Date(this.tokens.expires_at);
    const now = new Date();
    
    return expiresAt <= now;
  }

  // Renovar token usando refresh_token
  async refreshToken() {
    if (this.refreshPromise) {
      console.log('🔄 Renovação já em andamento, aguardando...');
      return await this.refreshPromise;
    }

    this.refreshPromise = this._doRefreshToken();
    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _doRefreshToken() {
    if (!this.tokens || !this.tokens.refresh_token) {
      throw new Error('Refresh token não disponível');
    }

    console.log('🔄 Renovando token automaticamente...');

    try {
      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.tokens.refresh_token,
        client_id: this.config.CLIENT_ID,
        client_secret: this.config.CLIENT_SECRET
      });

      const response = await fetch(this.config.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Erro na renovação:', response.status, errorText);
        throw new Error(`Erro na renovação: ${response.status} ${errorText}`);
      }

      const newTokens = await response.json();
      console.log('✅ Token renovado com sucesso!');

      // Salvar novos tokens
      this.saveTokens(newTokens);
      return newTokens;

    } catch (error) {
      console.log('❌ Erro na renovação:', error.message);
      throw error;
    }
  }

  // Obter token válido (renova automaticamente se necessário)
  async getValidToken() {
    // Carregar tokens se não estiverem carregados
    if (!this.tokens) {
      this.loadTokens();
    }

    // Se não há tokens, precisa de nova autorização
    if (!this.tokens || !this.tokens.access_token) {
      throw new Error('Nenhum token disponível. É necessário fazer nova autorização OAuth.');
    }

    // Se token está expirado ou próximo do vencimento, renovar
    if (this.isTokenExpiringSoon()) {
      console.log('⏰ Token próximo do vencimento, renovando automaticamente...');
      try {
        await this.refreshToken();
      } catch (error) {
        console.log('❌ Falha na renovação automática:', error.message);
        throw new Error('Token expirado e não foi possível renovar. É necessário nova autorização OAuth.');
      }
    }

    return this.tokens.access_token;
  }

  // Fazer requisição para API com token automático
  async makeApiRequest(endpoint, options = {}) {
    try {
      const token = await this.getValidToken();
      
      const url = `${this.config.API_BASE}${endpoint}`;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      };

      console.log(`🌐 Fazendo requisição para: ${url}`);

      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        // Se for 401, tentar renovar token uma vez
        if (response.status === 401) {
          console.log('🔄 Token inválido, tentando renovar...');
          try {
            await this.refreshToken();
            const newToken = await this.getValidToken();
            
            // Tentar novamente com novo token
            const retryHeaders = {
              ...headers,
              'Authorization': `Bearer ${newToken}`
            };
            
            const retryResponse = await fetch(url, {
              ...options,
              headers: retryHeaders
            });
            
            if (retryResponse.ok) {
              console.log('✅ Requisição bem-sucedida após renovação!');
              return await retryResponse.json();
            }
          } catch (refreshError) {
            console.log('❌ Falha na renovação:', refreshError.message);
          }
        }
        
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      console.log('✅ Requisição bem-sucedida!');
      return await response.json();

    } catch (error) {
      console.log('❌ Erro na requisição:', error.message);
      throw error;
    }
  }

  // Obter status dos tokens
  getTokenStatus() {
    if (!this.tokens) {
      return {
        hasTokens: false,
        message: 'Nenhum token disponível'
      };
    }

    const isExpired = this.isTokenExpired();
    const isExpiringSoon = this.isTokenExpiringSoon();
    
    let status = 'válido';
    if (isExpired) {
      status = 'expirado';
    } else if (isExpiringSoon) {
      status = 'próximo do vencimento';
    }

    return {
      hasTokens: true,
      hasAccessToken: !!this.tokens.access_token,
      hasRefreshToken: !!this.tokens.refresh_token,
      status: status,
      expiresAt: this.tokens.expires_at,
      savedAt: this.tokens.saved_at
    };
  }
}

// Exportar instância singleton
const tokenManager = new TokenManager();
module.exports = tokenManager;
