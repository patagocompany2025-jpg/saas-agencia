'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface PendingUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: 'pending';
  createdAt: Date;
}

interface StackAuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  isSignedIn: boolean;
  pendingUsers: PendingUser[];
  approveUser: (userId: string) => Promise<boolean>;
  rejectUser: (userId: string) => Promise<boolean>;
  createUser: (email: string, password: string, name: string, role: string) => Promise<boolean>;
  isAdmin: boolean;
}

const StackAuthContext = createContext<StackAuthContextType | undefined>(undefined);

export function StackAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);

  // Estado para usuários aprovados
  const [approvedUsers, setApprovedUsers] = useState<User[]>([
    {
      id: '1',
      email: 'kyra@patagonia.com',
      displayName: 'Kyra',
      role: 'socio',
      status: 'approved',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '2',
      email: 'alex@patagonia.com',
      displayName: 'Alex',
      role: 'socio',
      status: 'approved',
      createdAt: new Date('2024-01-01')
    }
  ]);

  useEffect(() => {
    console.log('=== INICIANDO CARREGAMENTO DO USUÁRIO ===');
    
    // Carregar usuários pendentes do localStorage
    const savedPendingUsers = localStorage.getItem('pendingUsers');
    if (savedPendingUsers) {
      const parsedUsers = JSON.parse(savedPendingUsers).map((u: {
        id: string;
        email: string;
        displayName: string;
        role: string;
        status: string;
        createdAt: string;
      }) => ({
        ...u,
        createdAt: new Date(u.createdAt)
      }));
      setPendingUsers(parsedUsers);
    } else {
      // Usuários iniciais mockados
      const initialPendingUsers: PendingUser[] = [
        {
          id: '3',
          email: 'novo@patagonia.com',
          displayName: 'Novo Usuário',
          role: 'cliente',
          status: 'pending',
          createdAt: new Date()
        }
      ];
      setPendingUsers(initialPendingUsers);
      localStorage.setItem('pendingUsers', JSON.stringify(initialPendingUsers));
    }
    
    // Carregar usuários aprovados do localStorage
    const savedApprovedUsers = localStorage.getItem('approvedUsers');
    if (savedApprovedUsers) {
      try {
        const parsedUsers = JSON.parse(savedApprovedUsers).map((u: {
          id: string;
          email: string;
          displayName: string;
          role: string;
          status: string;
          createdAt: string;
        }) => ({
          ...u,
          createdAt: new Date(u.createdAt)
        }));
        setApprovedUsers(parsedUsers);
        console.log('Usuários aprovados carregados:', parsedUsers.length);
      } catch (error) {
        console.error('Erro ao carregar usuários aprovados:', error);
      }
    }

    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('simpleUser');
    console.log('Usuário salvo encontrado:', savedUser);
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Dados do usuário parseados:', userData);
        console.log('Status do usuário:', userData.status);
        
        if (userData.status === 'approved') {
          console.log('Usuário aprovado, definindo como logado');
          setUser(userData);
          setIsSignedIn(true);
        } else {
          console.log('Usuário não aprovado, status:', userData.status);
        }
      } catch (error) {
        console.error('Erro ao fazer parse do usuário salvo:', error);
      }
    } else {
      console.log('Nenhum usuário salvo encontrado');
    }
    
    // Finalizar loading independentemente do resultado
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('=== INICIANDO LOGIN ===');
      console.log('Email:', email);
      console.log('Password:', password);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o usuário existe e está aprovado
      const foundUser = approvedUsers.find(u => u.email === email);
      console.log('Usuário encontrado:', foundUser);
      console.log('Lista de usuários aprovados:', approvedUsers);
      
      if (foundUser && password === '123456') {
        if (foundUser.status === 'approved') {
          console.log('Usuário aprovado, fazendo login');
          setUser(foundUser);
          setIsSignedIn(true);
          localStorage.setItem('simpleUser', JSON.stringify(foundUser));
          console.log('Usuário salvo no localStorage');
          return true;
        } else {
          throw new Error('Usuário aguardando aprovação');
        }
      }
      
      console.log('Login falhou - usuário não encontrado ou senha incorreta');
      return false;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Tentando cadastro com:', email, name);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se o email já existe
      const existingUser = approvedUsers.find(u => u.email === email) || 
                          pendingUsers.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('Email já cadastrado');
      }
      
      // Criar usuário pendente
      const newPendingUser: PendingUser = {
        id: Date.now().toString(),
        email: email,
        displayName: name,
        role: 'cliente',
        status: 'pending',
        createdAt: new Date()
      };
      
      // Adicionar à lista de pendentes
      setPendingUsers(prev => {
        const updated = [...prev, newPendingUser];
        localStorage.setItem('pendingUsers', JSON.stringify(updated));
        return updated;
      });
      
      // Simular envio de email para admin
      console.log('Email enviado para admin sobre novo usuário:', newPendingUser);
      
      return true;
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('simpleUser');
    setIsLoading(false);
  };

  const approveUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Iniciando aprovação do usuário:', userId);
      console.log('Usuários pendentes antes:', pendingUsers);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Encontrar usuário pendente
      const pendingUser = pendingUsers.find(u => u.id === userId);
      if (!pendingUser) {
        console.log('Usuário não encontrado:', userId);
        return false;
      }
      
      // Criar usuário aprovado
      const approvedUser: User = {
        ...pendingUser,
        status: 'approved'
      };
      
      // Adicionar à lista de aprovados
      setApprovedUsers(prev => {
        const updated = [...prev, approvedUser];
        localStorage.setItem('approvedUsers', JSON.stringify(updated));
        console.log('Usuário adicionado aos aprovados:', approvedUser);
        return updated;
      });
      
      // Remover da lista de pendentes
      setPendingUsers(prev => {
        const updated = prev.filter(u => u.id !== userId);
        console.log('Usuários pendentes após remoção:', updated);
        localStorage.setItem('pendingUsers', JSON.stringify(updated));
        return updated;
      });
      
      console.log('Usuário aprovado com sucesso:', approvedUser);
      
      return true;
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectUser = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Iniciando rejeição do usuário:', userId);
      console.log('Usuários pendentes antes:', pendingUsers);
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remover da lista de pendentes
      setPendingUsers(prev => {
        const updated = prev.filter(u => u.id !== userId);
        console.log('Usuários pendentes após remoção:', updated);
        localStorage.setItem('pendingUsers', JSON.stringify(updated));
        return updated;
      });
      
      console.log('Usuário rejeitado:', userId);
      
      return true;
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (email: string, password: string, name: string, role: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Criando novo usuário:', { email, name, role });
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar se email já existe
      const emailExists = approvedUsers.find(u => u.email === email) || 
                         pendingUsers.find(u => u.email === email);
      
      if (emailExists) {
        console.log('Email já existe:', email);
        return false;
      }
      
      // Criar usuário aprovado diretamente
      const newUser: User = {
        id: Date.now().toString(),
        email: email,
        displayName: name,
        role: role,
        status: 'approved',
        createdAt: new Date()
      };
      
      // Adicionar à lista de aprovados
      setApprovedUsers(prev => {
        const updated = [...prev, newUser];
        localStorage.setItem('approvedUsers', JSON.stringify(updated));
        console.log('Usuário criado e aprovado:', newUser);
        return updated;
      });
      
      console.log('Usuário criado com sucesso:', newUser);
      return true;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar se é admin (apenas para demonstração)
  const isAdmin = user?.role === 'socio';

  return (
    <StackAuthContext.Provider value={{ 
      user, 
      isLoading, 
      signIn, 
      signUp, 
      signOut, 
      isSignedIn,
      pendingUsers,
      approveUser,
      rejectUser,
      createUser,
      isAdmin
    }}>
      {children}
    </StackAuthContext.Provider>
  );
}

export function useStackAuth() {
  const context = useContext(StackAuthContext);
  if (context === undefined) {
    throw new Error('useStackAuth must be used within a StackAuthProvider');
  }
  return context;
}
