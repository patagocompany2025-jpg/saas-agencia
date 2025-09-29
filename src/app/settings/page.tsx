'use client';

import React, { useState } from 'react';
import { useStackAuth } from '@/lib/contexts/StackAuthContext-approval';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Database,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  Edit,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  Moon,
  Sun,
  Monitor,
  Zap,
  Lock,
  Key,
  Trash2,
  Download,
  Upload,
  Users,
  UserPlus,
  Crown,
  UserCheck,
  MoreHorizontal,
  Plus
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoading: authLoading, createUser, approvedUsers, clearUserData } = useStackAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    company: 'Agência Patagônia',
    address: 'Bariloche, Argentina',
    website: 'www.agenciapatagonia.com',
    description: 'Agência de viagens especializada em experiências únicas na Patagônia'
  });

  // Atualizar dados do perfil quando o usuário carregar
  React.useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user?.displayName || user?.email || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Carregar tema salvo
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);


  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Estados para gerenciamento de usuários
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  } | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedUserPermissions, setSelectedUserPermissions] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  } | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendedor',
    permissions: [] as string[]
  });

  // Converter usuários aprovados do contexto para o formato da página
  const [users, setUsers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLogin: string | null;
    permissions: string[];
    updatedAt?: string;
  }>>([]);

  // Atualizar lista de usuários quando approvedUsers mudar
  React.useEffect(() => {
    console.log('=== DEBUG USUÁRIOS ===');
    console.log('approvedUsers do contexto:', approvedUsers);
    console.log('Tipo de approvedUsers:', typeof approvedUsers);
    console.log('Array?', Array.isArray(approvedUsers));
    console.log('Length:', approvedUsers?.length);
    
    if (approvedUsers && approvedUsers.length > 0) {
      const convertedUsers = approvedUsers.map(user => ({
        id: user.id,
        name: user.displayName || user.email,
        email: user.email,
        role: user.role,
        status: user.status === 'approved' ? 'active' : 'inactive',
        createdAt: user.createdAt.toISOString().split('T')[0],
        lastLogin: null, // Não temos essa informação no contexto
        permissions: [] // Permissões serão implementadas depois
      }));
      setUsers(convertedUsers);
      console.log('Usuários aprovados convertidos:', convertedUsers);
    } else {
      console.log('approvedUsers está vazio ou undefined');
      // Se approvedUsers estiver vazio, manter a lista vazia
      setUsers([]);
    }
  }, [approvedUsers]);

  // Debug: Log quando users muda
  React.useEffect(() => {
    console.log('Estado users atualizado:', users);
  }, [users]);

  // Permissões disponíveis - Todas as funcionalidades do sistema
  const availablePermissions = [
    // Dashboard e Navegação
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      description: 'Acesso ao painel principal com métricas e resumos',
      category: 'Navegação',
      icon: '📊'
    },
    
    // CRM e Clientes
    { 
      id: 'crm', 
      name: 'CRM - Clientes', 
      description: 'Gerenciamento completo de clientes e leads',
      category: 'CRM',
      icon: '👥'
    },
    { 
      id: 'crm_create', 
      name: 'Criar Clientes', 
      description: 'Adicionar novos clientes ao sistema',
      category: 'CRM',
      icon: '➕'
    },
    { 
      id: 'crm_edit', 
      name: 'Editar Clientes', 
      description: 'Modificar informações de clientes existentes',
      category: 'CRM',
      icon: '✏️'
    },
    { 
      id: 'crm_delete', 
      name: 'Excluir Clientes', 
      description: 'Remover clientes do sistema',
      category: 'CRM',
      icon: '🗑️'
    },
    
    // Pipeline de Vendas
    { 
      id: 'kanban', 
      name: 'Pipeline de Vendas', 
      description: 'Gestão completa de oportunidades de venda',
      category: 'Vendas',
      icon: '🎯'
    },
    { 
      id: 'kanban_create', 
      name: 'Criar Oportunidades', 
      description: 'Adicionar novas oportunidades de venda',
      category: 'Vendas',
      icon: '➕'
    },
    { 
      id: 'kanban_edit', 
      name: 'Editar Oportunidades', 
      description: 'Modificar oportunidades existentes',
      category: 'Vendas',
      icon: '✏️'
    },
    { 
      id: 'kanban_delete', 
      name: 'Excluir Oportunidades', 
      description: 'Remover oportunidades do pipeline',
      category: 'Vendas',
      icon: '🗑️'
    },
    { 
      id: 'kanban_columns', 
      name: 'Gerenciar Colunas', 
      description: 'Criar, editar e excluir colunas do pipeline',
      category: 'Vendas',
      icon: '📋'
    },
    
    // Entrega de Serviços
    { 
      id: 'delivery', 
      name: 'Entrega de Serviços', 
      description: 'Gestão completa do processo de entrega',
      category: 'Operações',
      icon: '🚚'
    },
    { 
      id: 'delivery_create', 
      name: 'Criar Entregas', 
      description: 'Adicionar novas entregas de serviço',
      category: 'Operações',
      icon: '➕'
    },
    { 
      id: 'delivery_edit', 
      name: 'Editar Entregas', 
      description: 'Modificar entregas existentes',
      category: 'Operações',
      icon: '✏️'
    },
    { 
      id: 'delivery_delete', 
      name: 'Excluir Entregas', 
      description: 'Remover entregas do sistema',
      category: 'Operações',
      icon: '🗑️'
    },
    
    // Pós-Venda
    { 
      id: 'post-sale', 
      name: 'Pós-Venda', 
      description: 'Gestão de atividades pós-venda e satisfação',
      category: 'Atendimento',
      icon: '💝'
    },
    { 
      id: 'post-sale_create', 
      name: 'Criar Atividades', 
      description: 'Adicionar novas atividades de pós-venda',
      category: 'Atendimento',
      icon: '➕'
    },
    { 
      id: 'post-sale_edit', 
      name: 'Editar Atividades', 
      description: 'Modificar atividades de pós-venda',
      category: 'Atendimento',
      icon: '✏️'
    },
    
    // Financeiro
    { 
      id: 'financial', 
      name: 'Financeiro', 
      description: 'Gestão financeira completa da agência',
      category: 'Financeiro',
      icon: '💰'
    },
    { 
      id: 'financial_transactions', 
      name: 'Transações', 
      description: 'Visualizar e gerenciar transações financeiras',
      category: 'Financeiro',
      icon: '💳'
    },
    { 
      id: 'financial_reports', 
      name: 'Relatórios Financeiros', 
      description: 'Acesso a relatórios e análises financeiras',
      category: 'Financeiro',
      icon: '📈'
    },
    { 
      id: 'financial_employees', 
      name: 'Funcionários', 
      description: 'Gerenciar funcionários e despesas',
      category: 'Financeiro',
      icon: '👨‍💼'
    },
    { 
      id: 'financial_expenses', 
      name: 'Despesas Fixas', 
      description: 'Gerenciar despesas fixas da empresa',
      category: 'Financeiro',
      icon: '📊'
    },
    
    // Relatórios e Análises
    { 
      id: 'reports', 
      name: 'Relatórios', 
      description: 'Acesso a todos os relatórios do sistema',
      category: 'Análises',
      icon: '📊'
    },
    { 
      id: 'reports_sales', 
      name: 'Relatórios de Vendas', 
      description: 'Análises de performance de vendas',
      category: 'Análises',
      icon: '📈'
    },
    { 
      id: 'reports_financial', 
      name: 'Relatórios Financeiros', 
      description: 'Análises financeiras detalhadas',
      category: 'Análises',
      icon: '💰'
    },
    { 
      id: 'reports_performance', 
      name: 'Relatórios de Performance', 
      description: 'Métricas de performance da equipe',
      category: 'Análises',
      icon: '🎯'
    },
    
    // Configurações e Administração
    { 
      id: 'settings', 
      name: 'Configurações', 
      description: 'Configurações gerais do sistema',
      category: 'Administração',
      icon: '⚙️'
    },
    { 
      id: 'users', 
      name: 'Gerenciar Usuários', 
      description: 'Criar, editar e excluir usuários do sistema',
      category: 'Administração',
      icon: '👥'
    },
    { 
      id: 'users_create', 
      name: 'Criar Usuários', 
      description: 'Adicionar novos usuários ao sistema',
      category: 'Administração',
      icon: '➕'
    },
    { 
      id: 'users_edit', 
      name: 'Editar Usuários', 
      description: 'Modificar informações de usuários',
      category: 'Administração',
      icon: '✏️'
    },
    { 
      id: 'users_delete', 
      name: 'Excluir Usuários', 
      description: 'Remover usuários do sistema',
      category: 'Administração',
      icon: '🗑️'
    },
    
    // Calculadora
    { 
      id: 'calculator', 
      name: 'Calculadora', 
      description: 'Ferramenta de cálculo de preços e orçamentos',
      category: 'Ferramentas',
      icon: '🧮'
    }
  ];

  // Abas baseadas em roles
  const getTabsForRole = () => {
    const allTabs = [
      { id: 'profile', name: 'Perfil', icon: User, roles: ['socio', 'vendedor'] },
      { id: 'admin', name: 'Administração', icon: Shield, roles: ['socio'] },
      { id: 'company', name: 'Empresa', icon: Building2, roles: ['socio'] },
      { id: 'users', name: 'Usuários', icon: Users, roles: ['socio'] },
      { id: 'notifications', name: 'Notificações', icon: Bell, roles: ['socio', 'vendedor'] },
      { id: 'security', name: 'Segurança', icon: Shield, roles: ['socio', 'vendedor'] },
      { id: 'appearance', name: 'Aparência', icon: Palette, roles: ['socio', 'vendedor'] },
      { id: 'data', name: 'Dados', icon: Database, roles: ['socio'] }
    ];

    return allTabs.filter(tab => tab.roles.includes(user?.role || 'vendedor'));
  };

  const tabs = getTabsForRole();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configurações salvas com sucesso!');
      setIsEditing(false);
    } catch (error) {
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (securityData.newPassword.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Senha alterada com sucesso!');
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    const data = {
      profile: profileData,
      settings: { theme, notifications },
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracoes_agencia.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    // Salvar no localStorage
    localStorage.setItem('theme', newTheme);
    alert(`Tema alterado para ${newTheme === 'light' ? 'Claro' : newTheme === 'dark' ? 'Escuro' : 'Automático'}!`);
  };

  const handleNotificationChange = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Configurações de notificação salvas!');
    } catch (error) {
      alert('Erro ao salvar configurações de notificação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validações
    if (!securityData.currentPassword.trim()) {
      alert('Digite sua senha atual!');
      return;
    }

    if (!securityData.newPassword.trim() || securityData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres!');
      return;
    }

    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    if (securityData.currentPassword === securityData.newPassword) {
      alert('A nova senha deve ser diferente da senha atual!');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simular verificação da senha atual
      if (securityData.currentPassword !== '123456') {
        alert('Senha atual incorreta!');
        setIsLoading(false);
        return;
      }

      // Simular atualização da senha
      alert('Senha alterada com sucesso!');
      
      // Limpar campos
      setSecurityData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      alert('Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Funções para gerenciamento de usuários
  const handleNewUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'vendedor',
      permissions: []
    });
    setShowUserForm(true);
  };

  const handleEditUser = (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  }) => {
    setEditingUser(user);
    setUserFormData({
      name: user?.name || user?.email || 'Usuário',
      email: user.email,
      password: '', // Senha vazia para edição
      role: user.role,
      permissions: user.permissions || []
    });
    setShowUserForm(true);
  };

  const handleCancelEdit = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'vendedor',
      permissions: []
    });
  };

  const handleSaveUser = async () => {
    console.log('Iniciando salvamento do usuário:', userFormData);
    console.log('Usuários atuais:', users);
    
    // Validações
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      alert('Nome e email são obrigatórios!');
      return;
    }

    // Validar senha (apenas para novos usuários)
    if (!editingUser && (!userFormData.password.trim() || userFormData.password.length < 6)) {
      alert('A senha é obrigatória e deve ter pelo menos 6 caracteres!');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userFormData.email)) {
      alert('Por favor, insira um email válido!');
      return;
    }

    // Verificar se email já existe (apenas para novos usuários)
    if (!editingUser) {
      const emailExists = users.some(u => u.email.toLowerCase() === userFormData.email.toLowerCase());
      if (emailExists) {
        alert('Este email já está sendo usado por outro usuário!');
        return;
      }
    }

    // Verificar se email foi alterado para um que já existe (para edição)
    if (editingUser && userFormData.email.toLowerCase() !== editingUser.email.toLowerCase()) {
      const emailExists = users.some(u => 
        u.id !== editingUser.id && 
        u.email.toLowerCase() === userFormData.email.toLowerCase()
      );
      if (emailExists) {
        alert('Este email já está sendo usado por outro usuário!');
        return;
      }
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingUser) {
        // Atualizar usuário existente
        console.log('Atualizando usuário existente:', editingUser.id);
        setUsers(prev => {
          const updated = prev.map(u => 
            u.id === editingUser.id 
              ? { ...u, ...userFormData, updatedAt: new Date().toISOString().split('T')[0] }
              : u
          );
          console.log('Usuários após atualização:', updated);
          return updated;
        });
        alert('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário usando o contexto de autenticação
        console.log('Criando novo usuário via contexto:', userFormData);
        const success = await createUser(
          userFormData.email,
          userFormData.password,
          userFormData.name,
          userFormData.role
        );
        
        if (success) {
          // A lista de usuários será atualizada automaticamente pelo useEffect
          // quando approvedUsers mudar no contexto
          alert('Usuário criado com sucesso!');
        } else {
          alert('Erro ao criar usuário. Email pode já existir.');
          return;
        }
      }
      
      handleCancelEdit();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsers(prev => prev.filter(u => u.id !== userId));
      alert('Usuário excluído com sucesso!');
    }
  };

  const handleTogglePermission = (permissionId: string) => {
    setUserFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'socio':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'vendedor':
        return <UserCheck className="h-4 w-4 text-blue-400" />;
      default:
        return <User className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'socio':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'vendedor':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleViewPermissions = (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  }) => {
    setSelectedUserPermissions(user);
    setShowPermissionsModal(true);
  };

  const handleDuplicateUser = (user: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  }) => {
    setEditingUser(null);
    setUserFormData({
      name: `${user?.name || user?.email || 'Usuário'} (Cópia)`,
      email: `copia_${user.email}`,
      password: '', // Senha vazia para duplicação
      role: user.role,
      permissions: user.permissions || []
    });
    setShowUserForm(true);
  };

  if (authLoading) {
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

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Settings className="h-10 w-10 text-indigo-400" />
            Configurações da Agência
          </h1>
          <p className="text-white/70 text-lg">
            Gerencie todas as configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-indigo-600 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            {/* Perfil do Usuário */}
            {activeTab === 'profile' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <User className="h-5 w-5 text-indigo-400" />
                      Perfil do Usuário
                    </CardTitle>
                    <Button
                      onClick={() => setIsEditing(!isEditing)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white/80">Nome Completo</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Email</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Telefone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Website</Label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  {isEditing && (
                    <Button 
                      onClick={handleSave} 
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isLoading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Gerenciamento de Usuários */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                {/* Header com botão de adicionar */}
                <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-400" />
                        Gerenciamento de Usuários
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={clearUserData}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          🔄 Reset Dados
                        </Button>
                        <Button
                          onClick={handleNewUser}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Adicionar Usuário
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Lista de Usuários */}
                <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                  <CardContent className="p-0">
                    <div className="space-y-0">
                      {users.map((user, index) => (
                        <div
                          key={user.id}
                          className={`p-6 ${index !== users.length - 1 ? 'border-b border-white/10' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-white font-semibold">{user?.name || user?.email || 'Usuário'}</h3>
                                <p className="text-white/60 text-sm">{user.email}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                                    {getRoleIcon(user.role)}
                                    <span className="ml-1">
                                      {user.role === 'socio' ? 'Sócio' : 'Vendedor'}
                                    </span>
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === 'active' 
                                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                  }`}>
                                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                                  </span>
                                  {editingUser && editingUser.id === user.id && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                      <Edit className="h-3 w-3 inline mr-1" />
                                      Editando
                                    </span>
                                  )}
                                </div>
                                
                                {/* Mostrar permissões para vendedores */}
                                {user.role === 'vendedor' && user.permissions && user.permissions.length > 0 && (
                                  <div className="mt-2">
                                    <div className="text-white/60 text-xs mb-1">Permissões:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {user.permissions.slice(0, 3).map((permissionId) => {
                                        const permission = availablePermissions.find(p => p.id === permissionId);
                                        return permission ? (
                                          <span
                                            key={permissionId}
                                            className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded border border-indigo-500/30"
                                          >
                                            {permission.icon} {permission.name}
                                          </span>
                                        ) : null;
                                      })}
                                      {user.permissions.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded border border-gray-500/30">
                                          +{user.permissions.length - 3} mais
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right text-sm text-white/60">
                                <p>Criado em: {user.createdAt}</p>
                                {user.lastLogin && (
                                  <p>Último login: {user.lastLogin}</p>
                                )}
                                {'updatedAt' in user && user.updatedAt && (
                                  <p className="text-blue-300">Atualizado: {user.updatedAt}</p>
                                )}
                              </div>
                              
                              {/* Botões de Ação Diretos */}
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleEditUser(user)}
                                  size="sm"
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                                
                                {user.role === 'vendedor' && user.permissions && user.permissions.length > 0 && (
                                  <Button
                                    onClick={() => handleViewPermissions(user)}
                                    size="sm"
                                    variant="outline"
                                    className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30 hover:border-blue-500/50"
                                  >
                                    <Shield className="h-4 w-4 mr-1" />
                                    Permissões
                                  </Button>
                                )}
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                  <DropdownMenuItem 
                                    onClick={() => handleEditUser(user)}
                                    className="text-white hover:bg-gray-700"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDuplicateUser(user)}
                                    className="text-green-400 hover:bg-green-500/10"
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  {user.role === 'vendedor' && user.permissions && user.permissions.length > 0 && (
                                    <DropdownMenuItem 
                                      onClick={() => handleViewPermissions(user)}
                                      className="text-blue-400 hover:bg-blue-500/10"
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Ver Permissões
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Trocar Senha */}
            {activeTab === 'profile' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    Segurança da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Alterar Senha</span>
                    </div>
                    <p className="text-white/60 text-sm">
                      Para sua segurança, recomendamos alterar sua senha regularmente.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white/80">Senha Atual *</Label>
                      <Input
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Nova Senha *</Label>
                      <Input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80">Confirmar Nova Senha *</Label>
                    <Input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Confirme sua nova senha"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {isLoading ? 'Alterando...' : 'Alterar Senha'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Administração */}
            {activeTab === 'admin' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    Administração do Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Usuários Pendentes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-white/60 mb-4">Gerencie usuários aguardando aprovação</p>
                        <Button 
                          onClick={() => window.open('/admin', '_blank')}
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Gerenciar Usuários
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white text-lg">Estatísticas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/60">Usuários Ativos:</span>
                            <span className="text-white">2</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Pendentes:</span>
                            <span className="text-yellow-400">1</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">Acesso Restrito</span>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      Apenas administradores podem acessar as funcionalidades de administração.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configurações da Empresa */}
            {activeTab === 'company' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                    Informações da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white/80">Nome da Empresa</Label>
                      <Input
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Endereço</Label>
                      <Input
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/80">Descrição da Empresa</Label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 mt-1 h-24 resize-none"
                      placeholder="Descreva sua empresa..."
                    />
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar Informações'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Notificações */}
            {activeTab === 'notifications' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-400" />
                    Configurações de Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-white font-medium">Notificações por Email</p>
                          <p className="text-white/60 text-sm">Receba atualizações importantes por email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-white font-medium">Notificações Push</p>
                          <p className="text-white/60 text-sm">Receba notificações no navegador</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">Notificações SMS</p>
                          <p className="text-white/60 text-sm">Receba alertas importantes por SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-white font-medium">Marketing</p>
                          <p className="text-white/60 text-sm">Receba ofertas e novidades</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketing}
                          onChange={(e) => setNotifications(prev => ({ ...prev, marketing: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                  <Button 
                    onClick={handleNotificationChange}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Salvando...' : 'Salvar Notificações'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Segurança */}
            {activeTab === 'security' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    Configurações de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white/80">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-white/10 border-white/20 text-white pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/80">Nova Senha</Label>
                      <Input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-white/80">Confirmar Nova Senha</Label>
                      <Input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handlePasswordChange}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Aparência */}
            {activeTab === 'appearance' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-400" />
                    Configurações de Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-white/80 mb-4 block">Tema do Sistema</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'light'
                            ? 'border-indigo-500 bg-indigo-500/20'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <Sun className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                        <p className="text-white text-sm">Claro</p>
                      </button>
                      <button
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-indigo-500 bg-indigo-500/20'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <Moon className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                        <p className="text-white text-sm">Escuro</p>
                      </button>
                      <button
                        onClick={() => handleThemeChange('auto')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'auto'
                            ? 'border-indigo-500 bg-indigo-500/20'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        <Monitor className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-white text-sm">Automático</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dados */}
            {activeTab === 'data' && (
              <Card className="bg-white/5 backdrop-blur-2xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Database className="h-5 w-5 text-indigo-400" />
                    Gerenciamento de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={handleExportData} className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar Dados
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Dados
                    </Button>
                    <Button className="bg-orange-600 hover:bg-orange-700">
                      <Database className="h-4 w-4 mr-2" />
                      Backup Automático
                    </Button>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Modal de Formulário de Usuário */}
        {showUserForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}
              </h3>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white/70">Nome Completo *</Label>
                    <Input
                      value={userFormData.name}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70">Email *</Label>
                    <Input
                      value={userFormData.email}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Ex: joao@agenciapatagonia.com"
                      type="email"
                    />
                  </div>
                </div>

                {/* Senha - Apenas para novos usuários */}
                {!editingUser && (
                  <div>
                    <Label className="text-white/70">Senha *</Label>
                    <Input
                      value={userFormData.password}
                      onChange={(e) => setUserFormData(prev => ({ ...prev, password: e.target.value }))}
                      className="bg-gray-700 border-gray-600 text-white"
                      placeholder="Mínimo 6 caracteres"
                      type="password"
                    />
                    <p className="text-white/50 text-xs mt-1">A senha será usada para o primeiro login do usuário</p>
                  </div>
                )}

                {/* Função/Role */}
                <div>
                  <Label className="text-white/70">Função *</Label>
                  <Select value={userFormData.role} onValueChange={(value) => setUserFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="vendedor" className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-blue-400" />
                          Vendedor - Acesso Limitado
                        </div>
                      </SelectItem>
                      <SelectItem value="socio" className="text-white hover:bg-gray-700">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-yellow-400" />
                          Sócio - Acesso Total
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Permissões (apenas para vendedores) */}
                {userFormData.role === 'vendedor' && (
                  <div>
                    <Label className="text-white/70">Permissões de Acesso</Label>
                    <p className="text-white/60 text-sm mb-4">Selecione quais funcionalidades o vendedor pode acessar:</p>
                    
                    {/* Controles de seleção rápida */}
                    <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button
                          type="button"
                          onClick={() => {
                            const allPermissionIds = availablePermissions.map(p => p.id);
                            setUserFormData(prev => ({ ...prev, permissions: allPermissionIds }));
                          }}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Selecionar Todas
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setUserFormData(prev => ({ ...prev, permissions: [] }))}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Desmarcar Todas
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            const basicPermissions = ['dashboard', 'crm', 'kanban'];
                            setUserFormData(prev => ({ ...prev, permissions: basicPermissions }));
                          }}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Permissões Básicas
                        </Button>
                      </div>
                      <div className="text-white/60 text-sm">
                        <strong>Selecionadas:</strong> {userFormData.permissions.length} de {availablePermissions.length} permissões
                      </div>
                    </div>

                    {/* Permissões organizadas por categoria */}
                    <div className="space-y-6">
                      {Array.from(new Set(availablePermissions.map(p => p.category))).map((category) => (
                        <div key={category} className="border border-gray-600 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="text-lg">
                              {availablePermissions.find(p => p.category === category)?.icon}
                            </span>
                            {category}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availablePermissions
                              .filter(permission => permission.category === category)
                              .map((permission) => (
                                <label
                                  key={permission.id}
                                  className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-colors border border-gray-600/50"
                                >
                                  <input
                                    type="checkbox"
                                    checked={userFormData.permissions.includes(permission.id)}
                                    onChange={() => handleTogglePermission(permission.id)}
                                    className="mt-1 w-4 h-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-2"
                                  />
                                  <div className="flex-1">
                                    <div className="text-white font-medium flex items-center gap-2">
                                      <span className="text-sm">{permission.icon}</span>
                                      {permission.name}
                                    </div>
                                    <div className="text-white/60 text-sm mt-1">{permission.description}</div>
                                  </div>
                                </label>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="bg-gray-600 border-gray-500 text-white hover:bg-gray-700 hover:border-gray-400 flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveUser}
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                  >
                    {isLoading ? 'Salvando...' : editingUser ? 'Atualizar Usuário' : 'Criar Usuário'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Visualização de Permissões */}
        {showPermissionsModal && selectedUserPermissions && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">
                  Permissões de {selectedUserPermissions.name}
                </h3>
                <Button
                  onClick={() => setShowPermissionsModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Informações do usuário */}
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedUserPermissions.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{selectedUserPermissions.name}</h4>
                      <p className="text-white/60">{selectedUserPermissions.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleColor(selectedUserPermissions.role)}`}>
                          {getRoleIcon(selectedUserPermissions.role)}
                          <span className="ml-1">
                            {selectedUserPermissions.role === 'socio' ? 'Sócio' : 'Vendedor'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissões organizadas por categoria */}
                {selectedUserPermissions.role === 'socio' ? (
                  <div className="p-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Crown className="h-6 w-6 text-yellow-400" />
                      <h4 className="text-yellow-300 font-semibold text-lg">Acesso Total</h4>
                    </div>
                    <p className="text-yellow-200/80">
                      Como sócio, este usuário tem acesso completo a todas as funcionalidades do sistema.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-white/60 text-sm">
                      <strong>Total de permissões:</strong> {selectedUserPermissions.permissions?.length || 0} de {availablePermissions.length}
                    </div>
                    
                    {Array.from(new Set(availablePermissions.map(p => p.category))).map((category) => {
                      const categoryPermissions = availablePermissions.filter(p => p.category === category);
                      const userCategoryPermissions = categoryPermissions.filter(p => 
                        selectedUserPermissions.permissions?.includes(p.id)
                      );
                      
                      if (userCategoryPermissions.length === 0) return null;
                      
                      return (
                        <div key={category} className="border border-gray-600 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <span className="text-lg">
                              {categoryPermissions[0]?.icon}
                            </span>
                            {category}
                            <span className="text-sm text-white/60">
                              ({userCategoryPermissions.length}/{categoryPermissions.length})
                            </span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {userCategoryPermissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                              >
                                <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                                <div>
                                  <div className="text-green-300 font-medium flex items-center gap-2">
                                    <span className="text-sm">{permission.icon}</span>
                                    {permission.name}
                                  </div>
                                  <div className="text-green-200/60 text-sm mt-1">{permission.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Botões de ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowPermissionsModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white flex-1"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      setShowPermissionsModal(false);
                      handleEditUser(selectedUserPermissions);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Permissões
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModernLayout>
  );
}
