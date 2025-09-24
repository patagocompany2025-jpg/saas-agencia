'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ClientList } from '@/components/crm/ClientList';
import { ClientForm } from '@/components/crm/ClientForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, UserCheck } from 'lucide-react';
import { Client } from '@/lib/types';
import { useClients } from '@/lib/contexts/ClientContext';

export default function CRMPage() {
  const { data: session, status } = useSession();
  const { clients, addClient, updateClient } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600">
            Você precisa fazer login para acessar esta página.
          </p>
        </div>
      </div>
    );
  }

  const handleSaveClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingClient) {
      // Atualizar cliente existente
      updateClient(editingClient.id, clientData);
      alert('Cliente atualizado com sucesso!');
    } else {
      // Adicionar novo cliente
      addClient(clientData);
      alert('Cliente criado com sucesso!');
    }
    setShowForm(false);
    setEditingClient(undefined);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleNewClient = () => {
    setEditingClient(undefined);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <ModernLayout>
        <ClientForm
          client={editingClient}
          onSave={handleSaveClient}
          onCancel={() => {
            setShowForm(false);
            setEditingClient(undefined);
          }}
        />
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">CRM</h1>
            <p className="text-muted-foreground">Gerencie seus clientes e leads</p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card/95 backdrop-blur-2xl rounded-xl p-6 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Total de Clientes</h3>
                  <p className="text-sm text-muted-foreground">Clientes cadastrados</p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">{clients.length}</div>
          </div>

          <div className="bg-card/95 backdrop-blur-2xl rounded-xl p-6 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <UserPlus className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Leads Ativos</h3>
                  <p className="text-sm text-muted-foreground">Em acompanhamento</p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {clients.filter(c => c.status === 'lead').length}
            </div>
          </div>

          <div className="bg-card/95 backdrop-blur-2xl rounded-xl p-6 border border-border shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Clientes Ativos</h3>
                  <p className="text-sm text-muted-foreground">Clientes confirmados</p>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {clients.filter(c => c.status === 'cliente').length}
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        <ClientList 
          onNewClient={handleNewClient}
          onEditClient={handleEditClient}
        />
      </div>
    </ModernLayout>
  );
}
