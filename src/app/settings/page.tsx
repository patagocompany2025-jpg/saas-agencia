'use client';

import React, { useState } from 'react';
import { useSecureAuth } from '@/lib/contexts/SecureAuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Users
} from 'lucide-react';
import { UserForm } from '@/components/settings/UserForm';
import { UserList } from '@/components/settings/UserList';
import { UserPermissionsForm } from '@/components/settings/UserPermissionsForm';
import { ResetPasswordForm } from '@/components/settings/ResetPasswordForm';
import { User as UserType, UserPermissions } from '@/lib/types';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useSecureAuth();
  const { canManageUsers, canManageCompany, canManageData } = usePermissions();
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
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPermissionsForm, setShowPermissionsForm] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<UserType | null>(null);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<UserType | null>(null);

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
        name: user.name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Carregar tema salvo
  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      // Aplicar tema salvo ao carregar a página
      const htmlElement = document.documentElement;
      
      if (savedTheme === 'light') {
        htmlElement.classList.remove('dark');
      } else if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
      } else if (savedTheme === 'auto') {
        // Detectar preferência do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }
    }

    // Listener para mudanças na preferência do sistema (tema automático)
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'auto') {
        const htmlElement = document.documentElement;
        if (e.matches) {
          htmlElement.classList.add('dark');
        } else {
          htmlElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Abas baseadas em permissões
  const getTabsForRole = () => {
    const allTabs = [
      { id: 'profile', name: 'Perfil', icon: User, canAccess: true },
      { id: 'company', name: 'Empresa', icon: Building2, canAccess: canManageCompany() },
      { id: 'users', name: 'Usuários', icon: Users, canAccess: canManageUsers() },
      { id: 'notifications', name: 'Notificações', icon: Bell, canAccess: true },
      { id: 'security', name: 'Segurança', icon: Shield, canAccess: true },
      { id: 'appearance', name: 'Aparência', icon: Palette, canAccess: true },
      { id: 'data', name: 'Dados', icon: Database, canAccess: canManageData() }
    ];

    return allTabs.filter(tab => tab.canAccess);
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

  // Funções de gerenciamento de usuários
  const handleNewUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleSaveUser = async (userData: Omit<UserType, 'id' | 'createdAt'>) => {
    if (editingUser) {
      return await updateUser(editingUser.id, userData);
    } else {
      return await addUser(userData);
    }
  };

  const handleCancelUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
  };

  // Funções de gerenciamento de permissões
  const handleManagePermissions = (user: UserType) => {
    setPermissionsUser(user);
    setShowPermissionsForm(true);
  };

  const handleSavePermissions = async (userId: string, permissions: UserPermissions) => {
    return await updateUserPermissions(userId, permissions);
  };

  const handleCancelPermissionsForm = () => {
    setShowPermissionsForm(false);
    setPermissionsUser(null);
  };

  // Funções de redefinição de senha
  const handleResetPassword = (user: UserType) => {
    setResetPasswordUser(user);
    setShowResetPasswordForm(true);
  };

  const handleSavePasswordReset = async (userId: string, newPassword: string) => {
    return await resetUserPassword(userId, newPassword);
  };

  const handleCancelPasswordReset = () => {
    setShowResetPasswordForm(false);
    setResetPasswordUser(null);
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
    
    // Aplicar tema ao documento
    const htmlElement = document.documentElement;
    
    if (newTheme === 'light') {
      htmlElement.classList.remove('dark');
    } else if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
    } else if (newTheme === 'auto') {
      // Detectar preferência do sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        htmlElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
      }
    }
    
    // Mostrar feedback visual
    const themeNames = {
      light: 'Claro',
      dark: 'Escuro', 
      auto: 'Automático'
    };
    
    // Feedback visual temporário
    const button = document.querySelector(`[data-theme="${newTheme}"]`) as HTMLButtonElement;
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Aplicado!';
      button.className = button.className.replace('border-white/20', 'border-green-500 bg-green-500/20');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.className = button.className.replace('border-green-500 bg-green-500/20', 'border-indigo-500 bg-indigo-500/20');
      }, 2000);
    }
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
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa fazer login para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <ModernLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Settings className="h-10 w-10 text-indigo-400" />
            Configurações da Agência
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie todas as configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar de Navegação */}
          <div className="lg:col-span-1">
            <Card className="bg-card/95 backdrop-blur-2xl border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Configurações</CardTitle>
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
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
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
              <Card className="bg-card/95 backdrop-blur-2xl border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground flex items-center gap-2">
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
                      <Label className="text-foreground/80">Nome Completo</Label>
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-background/10 border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground/80">Email</Label>
                      <Input
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-background/10 border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground/80">Telefone</Label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-background/10 border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground/80">Website</Label>
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                        disabled={!isEditing}
                        className="bg-background/10 border-border text-foreground"
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

            {/* Configurações da Empresa */}
            {activeTab === 'company' && (
              <Card className="bg-card/95 backdrop-blur-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                    Informações da Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-foreground/80">Nome da Empresa</Label>
                      <Input
                        value={profileData.company}
                        onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                        className="bg-background/10 border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground/80">Endereço</Label>
                      <Input
                        value={profileData.address}
                        onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                        className="bg-background/10 border-border text-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-foreground/80">Descrição da Empresa</Label>
                    <textarea
                      value={profileData.description}
                      onChange={(e) => setProfileData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-background/10 border border-border text-foreground rounded-lg px-3 py-2 mt-1 h-24 resize-none"
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
              <Card className="bg-card/95 backdrop-blur-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Bell className="h-5 w-5 text-indigo-400" />
                    Configurações de Notificações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-foreground font-medium">Notificações por Email</p>
                          <p className="text-muted-foreground text-sm">Receba atualizações importantes por email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.email}
                          onChange={(e) => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bell className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="text-foreground font-medium">Notificações Push</p>
                          <p className="text-muted-foreground text-sm">Receba notificações no navegador</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.push}
                          onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-orange-400" />
                        <div>
                          <p className="text-foreground font-medium">Notificações SMS</p>
                          <p className="text-muted-foreground text-sm">Receba alertas importantes por SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.sms}
                          onChange={(e) => setNotifications(prev => ({ ...prev, sms: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="h-5 w-5 text-purple-400" />
                        <div>
                          <p className="text-foreground font-medium">Marketing</p>
                          <p className="text-muted-foreground text-sm">Receba ofertas e novidades</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketing}
                          onChange={(e) => setNotifications(prev => ({ ...prev, marketing: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
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
              <Card className="bg-card/95 backdrop-blur-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Shield className="h-5 w-5 text-indigo-400" />
                    Configurações de Segurança
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-foreground/80">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={securityData.currentPassword}
                          onChange={(e) => setSecurityData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="bg-background/10 border-border text-foreground pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-foreground/80">Nova Senha</Label>
                      <Input
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="bg-background/10 border-border text-foreground"
                      />
                    </div>
                    <div>
                      <Label className="text-foreground/80">Confirmar Nova Senha</Label>
                      <Input
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) => setSecurityData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="bg-background/10 border-border text-foreground"
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
              <Card className="bg-card/95 backdrop-blur-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Palette className="h-5 w-5 text-indigo-400" />
                    Configurações de Aparência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-foreground/80 mb-4 block">Tema do Sistema</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        data-theme="light"
                        onClick={() => handleThemeChange('light')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'light'
                            ? 'border-indigo-500 bg-indigo-500/20 text-foreground shadow-lg'
                            : 'border-border hover:border-border/60 text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card/80'
                        }`}
                      >
                        <Sun className={`h-8 w-8 mx-auto mb-2 ${
                          theme === 'light' ? 'text-yellow-500' : 'text-yellow-400'
                        }`} />
                        <p className="text-sm font-medium">Claro</p>
                      </button>
                      <button
                        data-theme="dark"
                        onClick={() => handleThemeChange('dark')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'dark'
                            ? 'border-indigo-500 bg-indigo-500/20 text-foreground shadow-lg'
                            : 'border-border hover:border-border/60 text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card/80'
                        }`}
                      >
                        <Moon className={`h-8 w-8 mx-auto mb-2 ${
                          theme === 'dark' ? 'text-blue-500' : 'text-blue-400'
                        }`} />
                        <p className="text-sm font-medium">Escuro</p>
                      </button>
                      <button
                        data-theme="auto"
                        onClick={() => handleThemeChange('auto')}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          theme === 'auto'
                            ? 'border-indigo-500 bg-indigo-500/20 text-foreground shadow-lg'
                            : 'border-border hover:border-border/60 text-muted-foreground hover:text-foreground bg-card/50 hover:bg-card/80'
                        }`}
                      >
                        <Monitor className={`h-8 w-8 mx-auto mb-2 ${
                          theme === 'auto' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <p className="text-sm font-medium">Automático</p>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usuários */}
            {activeTab === 'users' && (
              <UserList
                users={users}
                currentUserId={user?.id}
                onEdit={handleEditUser}
                onDelete={deleteUser}
                onNewUser={handleNewUser}
                onManagePermissions={handleManagePermissions}
                onResetPassword={handleResetPassword}
              />
            )}

            {/* Dados */}
            {activeTab === 'data' && (
              <Card className="bg-card/95 backdrop-blur-2xl border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
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
      </div>

      {/* Formulário de Usuário */}
      <UserForm
        user={editingUser}
        onSave={handleSaveUser}
        onCancel={handleCancelUserForm}
        isOpen={showUserForm}
      />

      {/* Formulário de Permissões */}
      {permissionsUser && (
        <UserPermissionsForm
          user={permissionsUser}
          onSave={handleSavePermissions}
          onCancel={handleCancelPermissionsForm}
          isOpen={showPermissionsForm}
        />
      )}

      {/* Formulário de Redefinição de Senha */}
      {resetPasswordUser && (
        <ResetPasswordForm
          user={resetPasswordUser}
          onSave={handleSavePasswordReset}
          onCancel={handleCancelPasswordReset}
          isOpen={showResetPasswordForm}
        />
      )}
    </ModernLayout>
  );
}
