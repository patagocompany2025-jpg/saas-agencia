import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  status: string;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se está no navegador
    if (typeof window === 'undefined') {
      console.log('[useAuth] Executando no servidor, não há localStorage');
      setIsLoading(false);
      return;
    }

    console.log('[useAuth] Verificando localStorage...');
    // Carregar usuário do localStorage
    const demoUser = localStorage.getItem('demo_user');
    console.log('[useAuth] demo_user encontrado:', demoUser);
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        console.log('[useAuth] Usuário carregado:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('[useAuth] Erro ao carregar usuário:', error);
        setUser(null);
      }
    } else {
      console.log('[useAuth] Nenhum usuário encontrado no localStorage');
    }
    setIsLoading(false);
  }, []);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'socio' || user?.role === 'admin';

  const signOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      setUser(null);
    }
  };

  return {
    user,
    isLoading,
    isAdmin,
    signOut,
  };
}
