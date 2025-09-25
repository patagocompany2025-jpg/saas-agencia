'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo e se ainda está válido
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedExpiry = localStorage.getItem('userExpiry');
      
      if (savedUser && savedExpiry) {
        const expiryDate = new Date(savedExpiry);
        const now = new Date();
        
        // Se ainda não expirou, restaurar o usuário
        if (expiryDate > now) {
          setUser(JSON.parse(savedUser));
        } else {
          // Se expirou, limpar dados
          localStorage.removeItem('user');
          localStorage.removeItem('userExpiry');
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    // Simular login - em produção, fazer chamada para API
    setIsLoading(true);
    
    // Usuários da Agência Patagônia
    const mockUsers = [
      {
        id: '1',
        name: 'Kyra',
        email: 'kyra@patagonia.com',
        role: 'socio' as const,
        createdAt: new Date(),
      },
      {
        id: '2',
        name: 'Alex',
        email: 'alex@patagonia.com',
        role: 'socio' as const,
        createdAt: new Date(),
      },
      {
        id: '3',
        name: 'Amanda',
        email: 'amanda@patagonia.com',
        role: 'socio' as const,
        createdAt: new Date(),
      },
      {
        id: '4',
        name: 'Vitor',
        email: 'vitor@patagonia.com',
        role: 'socio' as const,
        createdAt: new Date(),
      },
      {
        id: '5',
        name: 'Alexandre',
        email: 'alexandre@patagonia.com',
        role: 'vendedor' as const,
        createdAt: new Date(),
      },
    ];

    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === '123456') {
      setUser(foundUser);
      
      // Salvar dados do usuário
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        if (rememberMe) {
          // Se "Lembrar de mim" estiver marcado, salvar por 30 dias
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem('userExpiry', expiryDate.toISOString());
        } else {
          // Se não estiver marcado, salvar apenas para a sessão atual (expira no final do dia)
          const expiryDate = new Date();
          expiryDate.setHours(23, 59, 59, 999); // Final do dia atual
          localStorage.setItem('userExpiry', expiryDate.toISOString());
        }
      }
      
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('userExpiry');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
