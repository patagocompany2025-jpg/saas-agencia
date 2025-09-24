'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session, signOut } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (user) {
      setIsLoading(false);
    }
  }, [user]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">Você precisa fazer login para acessar esta página.</p>
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
    <div className="bg-background min-h-screen font-sf-pro">
      {/* Aurora Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-pink-900/20 pointer-events-none" />
      
      {/* macOS Window Container */}
      <div className="relative z-10 h-screen w-screen flex items-center justify-center p-4">
        <div className="w-full h-full max-w-none bg-card/95 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-border">
          {/* App Content */}
          <div className="flex flex-1 min-h-0">
            {/* Sidebar */}
            <aside className="w-64 bg-card/80 backdrop-blur-2xl p-6 flex flex-col flex-shrink-0 border-r border-border">
              {/* Logo */}
              <div className="mb-8">
                <img 
                  src="/LOGO_HORI_WHITE.png" 
                  alt="Patagonia Company" 
                  className="h-24 w-auto mb-3"
                />
                <p className="text-muted-foreground text-sm text-center">Sistema de Gestão</p>
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
                            ? 'bg-primary/20 text-foreground border border-primary/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
                          <div className="text-muted-foreground">
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
                                    ? 'bg-primary/20 text-foreground border border-primary/30'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
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
              <div className="bg-card/80 backdrop-blur-xl rounded-xl p-4 mt-auto border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {session?.user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <p className="text-foreground text-sm font-medium">{session?.user?.name}</p>
                    <p className="text-muted-foreground text-xs capitalize">{session?.user?.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col bg-background/50 backdrop-blur-2xl">
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
