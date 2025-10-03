'use client';

import React, { useState } from 'react';
import { useHybridAuth } from '@/lib/contexts/HybridAuthContext';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User, Mail, Calendar } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading, isAdmin } = useHybridAuth();
  const [pendingUsers] = useState<{ id: string; name: string; email: string; role: string; createdAt: Date }[]>([]); // Mock data for now
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-300">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-gray-300">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
          <p className="text-gray-300">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    );
  }

  const handleApprove = async (userId: string) => {
    setProcessingUser(userId);
    try {
      // TODO: Implementar aprovação de usuário
      console.log('Aprovar usuário:', userId);
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
    } finally {
      setProcessingUser(null);
    }
  };

  const handleReject = async (userId: string) => {
    setProcessingUser(userId);
    try {
      // TODO: Implementar rejeição de usuário
      console.log('Rejeitar usuário:', userId);
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
    } finally {
      setProcessingUser(null);
    }
  };

  return (
    <ModernLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Administração</h1>
          <p className="text-gray-400">Gerencie usuários e aprovações do sistema</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Usuários Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pendingUsers.length}</div>
              <p className="text-xs text-gray-400">Aguardando aprovação</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Usuários Aprovados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">2</div>
              <p className="text-xs text-gray-400">Usuários ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Usuários</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{pendingUsers.length + 2}</div>
              <p className="text-xs text-gray-400">Usuários no sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Usuários Pendentes */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Usuários Pendentes de Aprovação</CardTitle>
            <CardDescription className="text-gray-400">
              {pendingUsers.length === 0 
                ? 'Nenhum usuário aguardando aprovação' 
                : `${pendingUsers.length} usuário(s) aguardando aprovação`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingUsers.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-400">Todos os usuários foram processados!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingUsers.map((pendingUser) => (
                  <div key={pendingUser.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{pendingUser.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span>{pendingUser.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{pendingUser.createdAt.toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(pendingUser.id)}
                          disabled={processingUser === pendingUser.id}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {processingUser === pendingUser.id ? 'Aprovando...' : 'Aprovar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(pendingUser.id)}
                          disabled={processingUser === pendingUser.id}
                          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {processingUser === pendingUser.id ? 'Rejeitando...' : 'Rejeitar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModernLayout>
  );
}
