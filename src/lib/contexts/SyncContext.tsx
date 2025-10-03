'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { dataSync } from '@/lib/sync';

interface SyncContextType {
  isOnline: boolean;
  pendingSync: number;
  lastSync: string;
  forceSync: () => Promise<boolean>;
  clearLocalData: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSync, setPendingSync] = useState(0);
  const [lastSync, setLastSync] = useState('Nunca');

  useEffect(() => {
    // Detectar mudanças de conectividade
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conectado - iniciando sincronização');
      dataSync.forceSync().then(() => {
        setLastSync(new Date().toLocaleString());
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Desconectado - dados serão sincronizados quando voltar online');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar status inicial
    setIsOnline(navigator.onLine);

    // Atualizar status de sincronização a cada 10 segundos
    const interval = setInterval(() => {
      const status = dataSync.getSyncStatus();
      setPendingSync(status.pendingItems);
      setLastSync(status.lastSync);
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const forceSync = async (): Promise<boolean> => {
    try {
      const success = await dataSync.forceSync();
      if (success) {
        setLastSync(new Date().toLocaleString());
        setPendingSync(0);
      }
      return success;
    } catch (error) {
      console.error('Erro na sincronização forçada:', error);
      return false;
    }
  };

  const clearLocalData = async (): Promise<void> => {
    await dataSync.clearLocalData();
    setPendingSync(0);
    setLastSync('Nunca');
  };

  return (
    <SyncContext.Provider value={{
      isOnline,
      pendingSync,
      lastSync,
      forceSync,
      clearLocalData
    }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync deve ser usado dentro de um SyncProvider');
  }
  return context;
}
