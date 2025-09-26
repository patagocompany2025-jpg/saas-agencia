'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client } from '../types';

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Dados mockados iniciais
const initialClients: Client[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-9999',
    company: 'Tech Corp',
    status: 'cliente',
    source: 'Website',
    notes: 'Interessada em pacotes para Patagônia',
    assignedTo: '2',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    name: 'Carlos Mendes',
    email: 'carlos@empresa.com',
    phone: '(21) 88888-8888',
    company: 'Mendes & Associados',
    status: 'prospect',
    source: 'Indicação',
    notes: 'Possível cliente para grupo corporativo',
    assignedTo: '2',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria.santos@gmail.com',
    phone: '(31) 77777-7777',
    status: 'lead',
    source: 'Facebook',
    notes: 'Primeira consulta sobre Torres del Paine',
    assignedTo: '2',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
];

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);

  // Carregar clientes do localStorage na inicialização
  useEffect(() => {
    console.log('Carregando clientes do localStorage...');
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      try {
        const parsedClients = JSON.parse(savedClients).map((client: any) => ({
          ...client,
          createdAt: new Date(client.createdAt),
          updatedAt: new Date(client.updatedAt),
        }));
        console.log('Clientes carregados:', parsedClients.length);
        setClients(parsedClients);
      } catch (error) {
        console.error('Erro ao carregar clientes do localStorage:', error);
        setClients(initialClients);
      }
    } else {
      console.log('Nenhum cliente salvo encontrado, usando dados iniciais...');
    }
  }, []);

  // Salvar clientes no localStorage sempre que a lista mudar
  useEffect(() => {
    console.log('Salvando clientes no localStorage:', clients.length);
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(), // ID simples baseado em timestamp
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log('Adicionando novo cliente:', newClient.name);
    setClients(prev => [newClient, ...prev]);
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    console.log('Atualizando cliente:', id, 'Dados:', clientData);
    setClients(prev => prev.map(client => 
      client.id === id 
        ? { ...client, ...clientData, updatedAt: new Date() }
        : client
    ));
  };

  const deleteClient = (id: string) => {
    console.log('Deletando cliente:', id);
    setClients(prev => prev.filter(client => client.id !== id));
  };

  const getClient = (id: string) => {
    return clients.find(client => client.id === id);
  };

  return (
    <ClientContext.Provider value={{ 
      clients, 
      addClient, 
      updateClient, 
      deleteClient, 
      getClient 
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}
