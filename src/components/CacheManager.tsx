'use client';

import { useEffect } from 'react';

export function CacheManager() {
  useEffect(() => {
    // Verificar se há dados corrompidos no localStorage
    const checkCorruptedData = () => {
      try {
        const approvedUsers = localStorage.getItem('approvedUsers');
        const pendingUsers = localStorage.getItem('pendingUsers');
        
        if (approvedUsers) {
          const parsed = JSON.parse(approvedUsers);
          // Verificar se há dados de teste antigos
          const hasOldTestData = parsed.some((user: any) => 
            user.email?.includes('teste') || 
            user.email?.includes('fake') ||
            user.displayName?.includes('Teste')
          );
          
          if (hasOldTestData) {
            console.log('🧹 Dados de teste antigos detectados - limpando cache');
            localStorage.removeItem('approvedUsers');
            localStorage.removeItem('pendingUsers');
            localStorage.removeItem('simpleUser');
            return true;
          }
        }
        
        return false;
      } catch (error) {
        console.log('🧹 Erro ao verificar dados - limpando cache');
        localStorage.removeItem('approvedUsers');
        localStorage.removeItem('pendingUsers');
        localStorage.removeItem('simpleUser');
        return true;
      }
    };

    // Verificar e limpar dados corrompidos
    const wasCorrupted = checkCorruptedData();
    
    if (wasCorrupted) {
      console.log('✅ Cache limpo - dados corrompidos removidos');
    }

    // Adicionar listener para detectar mudanças de versão
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'appVersion') {
        console.log('🔄 Nova versão detectada - recarregando página');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Definir versão atual da aplicação
    const currentVersion = '1.0.0';
    const storedVersion = localStorage.getItem('appVersion');
    
    if (storedVersion !== currentVersion) {
      console.log('🔄 Atualizando versão da aplicação');
      localStorage.setItem('appVersion', currentVersion);
      
      // Limpar cache de dados antigos se necessário
      if (storedVersion && storedVersion !== currentVersion) {
        console.log('🧹 Limpando cache de versão anterior');
        localStorage.removeItem('approvedUsers');
        localStorage.removeItem('pendingUsers');
        localStorage.removeItem('simpleUser');
      }
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return null; // Este componente não renderiza nada
}
