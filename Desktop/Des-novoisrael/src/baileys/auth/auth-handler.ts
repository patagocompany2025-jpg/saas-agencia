import { useMultiFileAuthState, AuthenticationState } from '@whiskeysockets/baileys';
import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import pino from 'pino';

export class AuthHandler {
  private logger: pino.Logger;
  private sessionPath: string;

  constructor(logger: pino.Logger) {
    this.logger = logger;
    this.sessionPath = join(process.cwd(), 'data', 'sessions');
    
    // Garantir que o diretório de sessões existe
    if (!existsSync(this.sessionPath)) {
      mkdirSync(this.sessionPath, { recursive: true });
      this.logger.info(`📁 Diretório de sessões criado: ${this.sessionPath}`);
    }
  }

  async getAuthState(): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
    try {
      this.logger.info('🔐 Carregando estado de autenticação...');
      
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionPath);
      
      this.logger.info('✅ Estado de autenticação carregado com sucesso');
      
      return { state, saveCreds };
    } catch (error) {
      this.logger.error('❌ Erro ao carregar estado de autenticação:', error);
      throw error;
    }
  }

  async saveAuthState(authState: any): Promise<void> {
    try {
      if (authState && authState.saveCreds) {
        await authState.saveCreds();
        this.logger.info('💾 Estado de autenticação salvo com sucesso');
      }
    } catch (error) {
      this.logger.error('❌ Erro ao salvar estado de autenticação:', error);
    }
  }

  async clearSession(): Promise<void> {
    try {
      // Remover arquivos de sessão
      const sessionFiles = [
        'creds.json',
        'session-1.json',
        'session-2.json',
        'session-3.json',
        'session-4.json',
        'session-5.json'
      ];

      for (const file of sessionFiles) {
        const filePath = join(this.sessionPath, file);
        if (existsSync(filePath)) {
          writeFileSync(filePath, '{}');
          this.logger.info(`🗑️ Arquivo de sessão limpo: ${file}`);
        }
      }

      this.logger.info('✅ Sessão limpa com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao limpar sessão:', error);
      throw error;
    }
  }

  async getSessionInfo(): Promise<{
    hasSession: boolean;
    sessionFiles: string[];
    lastModified?: Date;
  }> {
    try {
      const sessionFiles = [
        'creds.json',
        'session-1.json',
        'session-2.json',
        'session-3.json',
        'session-4.json',
        'session-5.json'
      ];

      const existingFiles: string[] = [];
      let lastModified: Date | undefined;

      for (const file of sessionFiles) {
        const filePath = join(this.sessionPath, file);
        if (existsSync(filePath)) {
          existingFiles.push(file);
          
          const stats = readFileSync(filePath, 'utf8');
          if (stats && stats !== '{}') {
            const fileStats = require('fs').statSync(filePath);
            if (!lastModified || fileStats.mtime > lastModified) {
              lastModified = fileStats.mtime;
            }
          }
        }
      }

      return {
        hasSession: existingFiles.length > 0,
        sessionFiles: existingFiles,
        lastModified
      };
    } catch (error) {
      this.logger.error('❌ Erro ao obter informações da sessão:', error);
      return {
        hasSession: false,
        sessionFiles: []
      };
    }
  }

  async backupSession(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = join(this.sessionPath, `backup-${timestamp}`);
      
      if (!existsSync(backupPath)) {
        mkdirSync(backupPath, { recursive: true });
      }

      const sessionFiles = [
        'creds.json',
        'session-1.json',
        'session-2.json',
        'session-3.json',
        'session-4.json',
        'session-5.json'
      ];

      for (const file of sessionFiles) {
        const sourcePath = join(this.sessionPath, file);
        const destPath = join(backupPath, file);
        
        if (existsSync(sourcePath)) {
          const content = readFileSync(sourcePath);
          writeFileSync(destPath, content);
        }
      }

      this.logger.info(`💾 Backup da sessão criado: ${backupPath}`);
      return backupPath;
    } catch (error) {
      this.logger.error('❌ Erro ao criar backup da sessão:', error);
      throw error;
    }
  }

  async restoreSession(backupPath: string): Promise<void> {
    try {
      if (!existsSync(backupPath)) {
        throw new Error('Caminho do backup não encontrado');
      }

      const sessionFiles = [
        'creds.json',
        'session-1.json',
        'session-2.json',
        'session-3.json',
        'session-4.json',
        'session-5.json'
      ];

      for (const file of sessionFiles) {
        const sourcePath = join(backupPath, file);
        const destPath = join(this.sessionPath, file);
        
        if (existsSync(sourcePath)) {
          const content = readFileSync(sourcePath);
          writeFileSync(destPath, content);
        }
      }

      this.logger.info(`🔄 Sessão restaurada de: ${backupPath}`);
    } catch (error) {
      this.logger.error('❌ Erro ao restaurar sessão:', error);
      throw error;
    }
  }
}
