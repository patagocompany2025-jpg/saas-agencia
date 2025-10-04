'use client';

// Sistema de sincronização de dados entre dispositivos
export class DataSync {
  private static instance: DataSync;
  private syncQueue: Array<{key: string, data: unknown, timestamp: number}> = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupEventListeners();
    this.startSyncInterval();
  }

  static getInstance(): DataSync {
    if (!DataSync.instance) {
      DataSync.instance = new DataSync();
    }
    return DataSync.instance;
  }

  private setupEventListeners() {
    if (typeof window === 'undefined') return;

    // Detectar mudanças de conectividade
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sincronizar antes de fechar a página
    window.addEventListener('beforeunload', () => {
      this.syncPendingData();
    });
  }

  private startSyncInterval() {
    // Sincronizar a cada 30 segundos quando online
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, 30000);
  }

  // Salvar dados com sincronização
  async saveData(key: string, data: unknown, userId?: string): Promise<boolean> {
    try {
      const timestamp = Date.now();
      
      // Salvar localmente primeiro (para funcionar offline)
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, timestamp.toString());

      // Adicionar à fila de sincronização
      this.syncQueue.push({ key, data, timestamp });

      // Tentar sincronizar imediatamente se online
      if (this.isOnline) {
        await this.syncToServer(key, data, userId);
      }

      return true;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      return false;
    }
  }

  // Carregar dados (local primeiro, depois servidor)
  async loadData(key: string, userId?: string): Promise<unknown> {
    try {
      // Tentar carregar do servidor primeiro se online
      if (this.isOnline && userId) {
        const serverData = await this.loadFromServer(key, userId) as { data: unknown; timestamp: number } | null;
        if (serverData) {
          // Atualizar localStorage com dados do servidor
          localStorage.setItem(key, JSON.stringify(serverData.data));
          localStorage.setItem(`${key}_timestamp`, serverData.timestamp.toString());
          return serverData.data;
        }
      }

      // Fallback para dados locais
      const localData = localStorage.getItem(key);
      if (localData) {
        return JSON.parse(localData);
      }

      return null;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      return null;
    }
  }

  // Sincronizar dados pendentes
  private async syncPendingData() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of queue) {
      try {
        await this.syncToServer(item.key, item.data);
      } catch (error) {
        console.error('Erro ao sincronizar item:', error);
        // Re-adicionar à fila se falhou
        this.syncQueue.push(item);
      }
    }
  }

  // Sincronizar com servidor (simulado com Stack Auth)
  private async syncToServer(key: string, data: unknown, userId?: string): Promise<boolean> {
    try {
      // Simular API call para Stack Auth
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key,
          data,
          userId,
          timestamp: Date.now()
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Erro ao sincronizar com servidor:', error);
      return false;
    }
  }

  // Carregar do servidor
  private async loadFromServer(key: string, userId?: string): Promise<unknown> {
    try {
      const response = await fetch(`/api/sync?key=${key}&userId=${userId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Erro ao carregar do servidor:', error);
      return null;
    }
  }

  // Forçar sincronização manual
  async forceSync(): Promise<boolean> {
    if (!this.isOnline) {
      console.log('Offline - não é possível sincronizar');
      return false;
    }

    try {
      await this.syncPendingData();
      return true;
    } catch (error) {
      console.error('Erro na sincronização forçada:', error);
      return false;
    }
  }

  // Verificar status de sincronização
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingItems: this.syncQueue.length,
      lastSync: localStorage.getItem('lastSync') || 'Nunca'
    };
  }

  // Limpar dados locais e forçar recarregamento do servidor
  async clearLocalData(): Promise<void> {
    const keys = ['approvedUsers', 'pendingUsers', 'kanbanTasks', 'deliveryTasks', 'postSaleTasks'];
    keys.forEach(key => {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}_timestamp`);
    });
    localStorage.removeItem('lastSync');
  }
}

// Instância global (apenas no cliente)
export const dataSync = typeof window !== 'undefined' ? DataSync.getInstance() : null as unknown as DataSync;
