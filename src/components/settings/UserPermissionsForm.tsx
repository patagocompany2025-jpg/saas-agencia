'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  X, 
  Save, 
  Settings,
  LayoutDashboard,
  Users,
  Kanban,
  Calculator,
  DollarSign,
  BarChart3,
  User,
  Building2,
  Bell,
  Palette,
  Database,
  UserPlus
} from 'lucide-react';
import { User as UserType, UserPermissions } from '@/lib/types';

interface UserPermissionsFormProps {
  user: UserType;
  onSave: (userId: string, permissions: UserPermissions) => Promise<boolean>;
  onCancel: () => void;
  isOpen: boolean;
}

const defaultPermissions: UserPermissions = {
  dashboard: true,
  crm: true,
  pipeline: true,
  pipelineVendas: true,
  pipelineEntrega: false,
  pipelinePosVenda: false,
  calculadora: true,
  financeiro: false,
  relatorios: false,
  configuracoes: true,
  configuracoesPerfil: true,
  configuracoesEmpresa: false,
  configuracoesNotificacoes: true,
  configuracoesSeguranca: true,
  configuracoesAparencia: true,
  configuracoesDados: false,
  gerenciarUsuarios: false,
};

const socioPermissions: UserPermissions = {
  dashboard: true,
  crm: true,
  pipeline: true,
  pipelineVendas: true,
  pipelineEntrega: true,
  pipelinePosVenda: true,
  calculadora: true,
  financeiro: true,
  relatorios: true,
  configuracoes: true,
  configuracoesPerfil: true,
  configuracoesEmpresa: true,
  configuracoesNotificacoes: true,
  configuracoesSeguranca: true,
  configuracoesAparencia: true,
  configuracoesDados: true,
  gerenciarUsuarios: true,
};

const permissionGroups = [
  {
    title: 'Módulos Principais',
    icon: Settings,
    permissions: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral do sistema' },
      { key: 'crm', label: 'CRM', icon: Users, description: 'Gerenciamento de clientes' },
      { key: 'pipeline', label: 'Pipeline', icon: Kanban, description: 'Gestão de vendas' },
      { key: 'calculadora', label: 'Calculadora', icon: Calculator, description: 'Cálculo de preços' },
    ]
  },
  {
    title: 'Pipeline Detalhado',
    icon: Kanban,
    permissions: [
      { key: 'pipelineVendas', label: 'Vendas', icon: Kanban, description: 'Gestão de oportunidades de venda' },
      { key: 'pipelineEntrega', label: 'Entrega de Serviços', icon: Kanban, description: 'Acompanhamento de entregas' },
      { key: 'pipelinePosVenda', label: 'Pós-Venda', icon: Kanban, description: 'Gestão pós-venda' },
    ]
  },
  {
    title: 'Módulos Administrativos',
    icon: Shield,
    permissions: [
      { key: 'financeiro', label: 'Financeiro', icon: DollarSign, description: 'Gestão financeira' },
      { key: 'relatorios', label: 'Relatórios', icon: BarChart3, description: 'Relatórios e análises' },
    ]
  },
  {
    title: 'Configurações',
    icon: Settings,
    permissions: [
      { key: 'configuracoes', label: 'Configurações Gerais', icon: Settings, description: 'Acesso às configurações' },
      { key: 'configuracoesPerfil', label: 'Perfil', icon: User, description: 'Editar perfil pessoal' },
      { key: 'configuracoesEmpresa', label: 'Empresa', icon: Building2, description: 'Dados da empresa' },
      { key: 'configuracoesNotificacoes', label: 'Notificações', icon: Bell, description: 'Configurar notificações' },
      { key: 'configuracoesSeguranca', label: 'Segurança', icon: Shield, description: 'Alterar senha' },
      { key: 'configuracoesAparencia', label: 'Aparência', icon: Palette, description: 'Tema e visual' },
      { key: 'configuracoesDados', label: 'Dados', icon: Database, description: 'Exportar/importar dados' },
      { key: 'gerenciarUsuarios', label: 'Gerenciar Usuários', icon: UserPlus, description: 'Cadastrar e gerenciar usuários' },
    ]
  }
];

export function UserPermissionsForm({ user, onSave, onCancel, isOpen }: UserPermissionsFormProps) {
  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'socio') {
        setPermissions(socioPermissions);
      } else {
        setPermissions(user.permissions || defaultPermissions);
      }
    }
  }, [user, isOpen]);

  const handlePermissionChange = (key: keyof UserPermissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      const success = await onSave(user.id, permissions);
      if (success) {
        onCancel();
      } else {
        alert('Erro ao salvar permissões');
      }
    } catch (error) {
      alert('Erro ao salvar permissões');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    setPermissions(socioPermissions);
  };

  const handleSelectNone = () => {
    setPermissions(defaultPermissions);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-2xl border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              Permissões de Acesso - {user.name}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground text-sm">
            Configure as permissões de acesso para {user.name} ({user.role === 'socio' ? 'Sócio' : 'Vendedor'})
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Controles rápidos */}
            <div className="flex gap-3 pb-4 border-b border-border">
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectAll}
                className="bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30"
              >
                Selecionar Tudo
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectNone}
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
              >
                Limpar Tudo
              </Button>
            </div>

            {/* Grupos de permissões */}
            {permissionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                  <group.icon className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-semibold text-foreground">{group.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.permissions.map((permission) => {
                    const IconComponent = permission.icon;
                    return (
                      <div
                        key={permission.key}
                        className="flex items-center justify-between p-4 bg-background/10 rounded-lg border border-border/50"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <Label className="text-foreground font-medium">
                              {permission.label}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={permissions[permission.key as keyof UserPermissions]}
                          onCheckedChange={(checked) => 
                            handlePermissionChange(permission.key as keyof UserPermissions, checked)
                          }
                          disabled={user.role === 'socio'}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Botões de ação */}
            <div className="flex gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 bg-background/10 border-border text-foreground hover:bg-accent"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || user.role === 'socio'}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Permissões
                  </div>
                )}
              </Button>
            </div>

            {user.role === 'socio' && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-400 text-sm text-center">
                  Sócios têm acesso completo a todas as funcionalidades
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
