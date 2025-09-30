'use client';

import React from 'react';
import { useSync } from '@/lib/contexts/SyncContext';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

export function SyncStatus() {
  const { isOnline, pendingSync, lastSync, forceSync } = useSync();

  const handleForceSync = async () => {
    const success = await forceSync();
    if (success) {
      console.log('✅ Sincronização forçada realizada com sucesso');
    } else {
      console.log('❌ Erro na sincronização forçada');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="flex items-center gap-3">
          {/* Status de Conectividade */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-400" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-400" />
            )}
            <span className="text-sm text-white">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Status de Sincronização */}
          <div className="flex items-center gap-2">
            {pendingSync > 0 ? (
              <>
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span className="text-sm text-yellow-300">
                  {pendingSync} pendente{pendingSync > 1 ? 's' : ''}
                </span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">Sincronizado</span>
              </>
            )}
          </div>

          {/* Botão de Sincronização Forçada */}
          <button
            onClick={handleForceSync}
            disabled={!isOnline}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Sincronizar
          </button>
        </div>

        {/* Última Sincronização */}
        <div className="mt-2 text-xs text-gray-400">
          Última sincronização: {lastSync}
        </div>
      </div>
    </div>
  );
}
