'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calculator,
  Kanban,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Home,
  FileText,
  Bell,
  Search,
  Plus,
  Target,
  CheckCircle,
  Heart,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export function ModernLayout({ children }: ModernLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

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

  // Navegação baseada em roles
  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['socio', 'vendedor'] },
      { name: 'CRM', href: '/crm', icon: Users, roles: ['socio', 'vendedor'] },
      { 
        name: 'Pipeline', 
        href: '/kanban', 
        icon: Kanban, 
        roles: ['socio', 'vendedor'],
        submenu: [
          { name: 'Vendas', href: '/kanban', icon: Target },
          { name: 'Entrega de Serviços', href: '/kanban/delivery', icon: CheckCircle },
          { name: 'Pós-Venda', href: '/kanban/post-sale', icon: Heart }
        ]
      },
      { name: 'Calculadora', href: '/calculator', icon: Calculator, roles: ['socio', 'vendedor'] },
      { name: 'Financeiro', href: '/financial', icon: DollarSign, roles: ['socio'] },
      { name: 'Relatórios', href: '/reports', icon: BarChart3, roles: ['socio'] },
      { name: 'Configurações', href: '/settings', icon: Settings, roles: ['socio', 'vendedor'] },
    ];

    // Filtrar itens baseado no role do usuário
    return baseItems.filter(item => item.roles.includes(user?.role || 'vendedor'));
  };

  const navigation = getNavigationItems();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="bg-gray-900 min-h-screen font-sf-pro">
      {/* Aurora Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />
      
      {/* macOS Window Container */}
      <div className="relative z-10 h-screen w-screen flex items-center justify-center p-4">
        <div className="w-full h-full max-w-none bg-gray-800/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10">
          {/* App Content */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-800/80 backdrop-blur-2xl p-6 flex flex-col flex-shrink-0 border-r border-white/10">
              {/* Logo */}
              <div className="mb-8">
                <img 
                  src="/LOGO_HORI_WHITE.png" 
                  alt="Patagonia Company" 
                  className="h-24 w-auto mb-3"
                />
                <p className="text-white/60 text-sm text-center">Sistema de Gestão</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-1 flex-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
                  const hasSubmenu = item.submenu && item.submenu.length > 0;
                  const isExpanded = expandedMenus[item.name];
                  
                  return (
                    <div key={item.name}>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg transition-all font-sf-text cursor-pointer ${
                          isActive
                            ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                        onClick={() => {
                          if (hasSubmenu) {
                            setExpandedMenus(prev => ({
                              ...prev,
                              [item.name]: !prev[item.name]
                            }));
                          } else {
                            router.push(item.href);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        {hasSubmenu && (
                          <div className="text-white/60">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                      
                      {/* Submenu */}
                      {hasSubmenu && isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.submenu!.map((subItem) => {
                            const SubIcon = subItem.icon;
                            const isSubActive = typeof window !== 'undefined' && window.location.pathname === subItem.href;
                            
                            return (
                              <a
                                key={subItem.name}
                                href={subItem.href}
                                className={`flex items-center space-x-3 p-2 rounded-lg transition-all text-sm ${
                                  isSubActive
                                    ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <SubIcon className="w-4 h-4" />
                                <span>{subItem.name}</span>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="bg-gray-700/80 backdrop-blur-xl rounded-xl p-4 mt-auto border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name}</p>
                    <p className="text-white/60 text-xs capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center space-x-2 text-white/60 hover:text-white transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
