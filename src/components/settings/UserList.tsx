'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck,
  Calendar,
  Mail,
  Settings,
  Key
} from 'lucide-react';
import { User } from '@/lib/types';

interface UserListProps {
  users: User[];
  currentUserId?: string;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => Promise<boolean>;
  onNewUser: () => void;
  onManagePermissions: (user: User) => void;
  onResetPassword: (user: User) => void;
}

export function UserList({ users, currentUserId, onEdit, onDelete, onNewUser, onManagePermissions, onResetPassword }: UserListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (userId: string) => {
    if (userId === currentUserId) {
      alert('Você não pode deletar seu próprio usuário');
      return;
    }

    if (confirm('Tem certeza que deseja deletar este usuário?')) {
      setDeletingId(userId);
      try {
        const success = await onDelete(userId);
        if (!success) {
          alert('Erro ao deletar usuário');
        }
      } catch (error) {
        alert('Erro ao deletar usuário');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getRoleBadge = (role: 'socio' | 'vendedor') => {
    if (role === 'socio') {
      return (
        <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
          <Shield className="h-3 w-3 mr-1" />
          Sócio
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        <UserCheck className="h-3 w-3 mr-1" />
        Vendedor
      </Badge>
    );
  };

  const getRoleDescription = (role: 'socio' | 'vendedor') => {
    if (role === 'socio') {
      return 'Acesso completo ao sistema';
    }
    return 'Acesso limitado (sem financeiro)';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            Gerenciar Usuários
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          onClick={onNewUser}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Lista de usuários */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="bg-card/95 backdrop-blur-2xl border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  
                  {/* Informações do usuário */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-foreground">{user.name}</h4>
                      {getRoleBadge(user.role)}
                      {user.id === currentUserId && (
                        <Badge variant="outline" className="text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-2" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-2" />
                        Cadastrado em {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getRoleDescription(user.role)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu de ações */}
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-muted-foreground hover:text-foreground hover:bg-accent"
                        disabled={deletingId === user.id}
                      >
                        {deletingId === user.id ? (
                          <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                        ) : (
                          <MoreHorizontal className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                      <DropdownMenuItem 
                        onClick={() => onEdit(user)}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onResetPassword(user)}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Redefinir Senha
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onManagePermissions(user)}
                        className="hover:bg-accent cursor-pointer"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Permissões
                      </DropdownMenuItem>
                      {user.id !== currentUserId && (
                        <DropdownMenuItem 
                          onClick={() => handleDelete(user.id)}
                          className="hover:bg-accent cursor-pointer text-red-400"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Deletar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estado vazio */}
      {users.length === 0 && (
        <Card className="bg-card/95 backdrop-blur-2xl border-border">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum usuário cadastrado
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece adicionando o primeiro usuário ao sistema
            </p>
            <Button
              onClick={onNewUser}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Usuário
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
