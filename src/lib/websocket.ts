'use client';

type ListenerCallback = (data: unknown) => void;

// Sistema de WebSockets para sincronização em tempo real
export class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private listeners: Map<string, ListenerCallback[]> = new Map();

  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      // Em produção, usar WebSocket real
      // Por enquanto, simular com polling
      this.startPolling();
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private startPolling() {
    // Polling a cada 5 segundos para verificar mudanças
    setInterval(async () => {
      try {
        await this.checkForUpdates();
      } catch (error) {
        console.error('Erro ao verificar atualizações:', error);
      }
    }, 5000);
  }

  private async checkForUpdates() {
    try {
      // Verificar última atividade
      const response = await fetch('/api/activity/latest');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          this.notifyListeners('update', data.data);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.error('Máximo de tentativas de reconexão atingido');
    }
  }

  // Adicionar listener para eventos
  on(event: string, callback: ListenerCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  // Remover listener
  off(event: string, callback: ListenerCallback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  // Notificar listeners
  private notifyListeners(event: string, data: unknown) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Erro ao executar listener:', error);
        }
      });
    }
  }

  // Enviar mensagem (simulado)
  send(type: string, data: unknown) {
    console.log(`Enviando ${type}:`, data);
    // Em produção, enviar via WebSocket real
    this.notifyListeners(type, data);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

// Instância global
export const wsManager = WebSocketManager.getInstance();
