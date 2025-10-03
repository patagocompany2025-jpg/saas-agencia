'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useStackApp } from '@stackframe/stack';
// Removido import do prisma - será usado apenas nas APIs

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  status?: 'active' | 'pending' | 'blocked';
  createdAt: Date;
}

interface HybridAuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
  isAdmin: boolean;
  syncUser: () => Promise<void>;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(undefined);

export function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const stackApp = useStackApp();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    console.log('=== INICIANDO CARREGAMENTO HÍBRIDO ===');

    const initializeAuth = async () => {
      try {
        // PRIMEIRO: Verificar modo demo no localStorage
        const storedUser = localStorage.getItem('demo_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUser(user);
          setIsSignedIn(true);
          console.log('Usuário demo carregado do localStorage:', user);
          setIsLoading(false);
          return; // Sair aqui se está em modo demo
        }

        // SEGUNDO: Verificar se há usuário no Stack Auth
        const stackUser = await stackApp.getUser();
        console.log('Usuário do Stack Auth:', stackUser);

        if (stackUser && stackUser.primaryEmail) {
          // 2. Buscar dados do usuário no Neon DB
          const userData = await fetchUserFromDatabase(stackUser.primaryEmail);

          if (userData) {
            setUser(userData);
            setIsSignedIn(true);
            console.log('Usuário híbrido carregado:', userData);
          } else {
            // 3. Se não existe no Neon, criar automaticamente
            console.log('Usuário não encontrado no Neon, criando...');
            if (stackUser.primaryEmail) {
              const created = await createUserInDatabase(stackUser);
              if (created) {
                const newUserData = await fetchUserFromDatabase(stackUser.primaryEmail);
                if (newUserData) {
                  setUser(newUserData);
                  setIsSignedIn(true);
                  console.log('Usuário criado no Neon:', newUserData);
                }
              }
            }
          }
        } else {
          console.log('Nenhum usuário logado no Stack Auth');
        }
      } catch (error) {
        console.error('Erro ao inicializar autenticação híbrida:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [stackApp]);

  // Função para buscar usuário no Neon DB
  const fetchUserFromDatabase = async (email: string): Promise<User | null> => {
    try {
      // Tentar buscar no banco primeiro
      try {
        const response = await fetch('/api/user/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stack_user_id: email })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.user) {
            return result.user;
          } else {
            console.warn('Usuário não encontrado no banco:', result.error);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erro na API sync:', response.status, errorData);
        }
      } catch (apiError) {
        console.error('Erro na API, usando fallback localStorage:', apiError);
      }

      // Fallback: buscar no localStorage
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email === email) {
          console.log('Usuário encontrado no localStorage:', user);
          return user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Erro de rede ao buscar usuário:', error);
      return null;
    }
  };

  // Função para criar usuário no Neon DB
  const createUserInDatabase = async (stackUser: { id: string; primaryEmail: string | null; displayName?: string | null }): Promise<boolean> => {
    try {
      // Fallback: usar localStorage se API falhar
      const fallbackUser = {
        id: Date.now().toString(),
        email: stackUser.primaryEmail || '',
        displayName: stackUser.displayName || (stackUser.primaryEmail ? stackUser.primaryEmail.split('@')[0] : 'Usuario'),
        role: 'cliente',
        status: 'active',
        createdAt: new Date()
      };

      try {
        const response = await fetch('/api/user/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: stackUser.primaryEmail,
            name: stackUser.displayName || (stackUser.primaryEmail ? stackUser.primaryEmail.split('@')[0] : 'Usuario'),
            role: 'cliente'
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('Usuário criado com sucesso no banco');
            return true;
          } else {
            console.error('Erro ao criar usuário:', result.error);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Erro na API create:', response.status, errorData);
        }
      } catch (apiError) {
        console.error('Erro na API, usando fallback localStorage:', apiError);
      }

      // Fallback: salvar no localStorage
      console.log('Usando fallback localStorage para usuário');
      localStorage.setItem('demo_user', JSON.stringify(fallbackUser));
      return true;
    } catch (error) {
      console.error('Erro de rede ao criar usuário:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('=== LOGIN HÍBRIDO ===');
      
      // Modo demo: buscar usuário no localStorage
      console.log('Usando modo demo - buscando no localStorage');
      
      const storedUser = localStorage.getItem('demo_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email === email) {
          setUser(user);
          setIsSignedIn(true);
          console.log('Login demo realizado:', user);
          return true;
        }
      }
      
      console.log('Usuário não encontrado no localStorage');
      return false;
    } catch (error) {
      console.error('Erro no login híbrido:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('=== CADASTRO HÍBRIDO ===');
      
      // Modo demo: criar usuário diretamente no localStorage
      console.log('Usando modo demo - salvando no localStorage');
      
      const demoUser = {
        id: Date.now().toString(),
        email: email,
        displayName: name,
        role: 'cliente',
        status: 'active',
        createdAt: new Date()
      };

      // Salvar no localStorage
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      console.log('Usuário salvo no localStorage:', demoUser);
      
      // Definir como logado
      setUser(demoUser);
      setIsSignedIn(true);
      
      console.log('Cadastro demo realizado com sucesso');
      return true;
    } catch (error) {
      console.error('Erro no cadastro híbrido:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('=== LOGOUT HÍBRIDO ===');
      
      // 1. Limpar estado local
      setUser(null);
      setIsSignedIn(false);
      
      // 2. Tentar logout no Stack Auth (se disponível)
      try {
        // Stack Auth logout será gerenciado pelo middleware
        console.log('Logout local realizado');
      } catch (stackError) {
        console.warn('Erro no logout Stack Auth:', stackError);
      }
      
      // 3. Redirecionar para página de login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
      
      console.log('Logout híbrido completo');
    } catch (error) {
      console.error('Erro no logout híbrido:', error);
      // Garantir que estado seja limpo mesmo em caso de erro
      setUser(null);
      setIsSignedIn(false);
      
      // Redirecionar mesmo com erro
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const syncUser = async (): Promise<void> => {
    if (user) {
      const updatedUser = await fetchUserFromDatabase(user.email);
      if (updatedUser) {
        setUser(updatedUser);
        console.log('Usuário sincronizado:', updatedUser);
      }
    }
  };

  // Verificar se é admin
  const isAdmin = user?.role === 'socio' || user?.role === 'admin';

  return (
    <HybridAuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      isSignedIn,
      isAdmin,
      syncUser
    }}>
      {children}
    </HybridAuthContext.Provider>
  );
}

export function useHybridAuth() {
  const context = useContext(HybridAuthContext);
  if (context === undefined) {
    throw new Error('useHybridAuth must be used within a HybridAuthProvider');
  }
  return context;
}
