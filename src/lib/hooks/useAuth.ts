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
      setIsLoading(false);
      return;
    }

    // Carregar usuário do localStorage
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('[useAuth] Erro ao carregar usuário:', error);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const isAdmin = user?.role === 'socio' || user?.role === 'admin';

  return {
    user,
    isLoading,
    isAdmin,
  };
}
